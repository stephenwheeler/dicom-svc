const dicomParser = require('dicom-parser');
const { createCanvas } = require('canvas');
const sharp = require('sharp');
const dataStore = require('./dataStore');


// File filter for multer
const dicomFileFilter = (req, file, cb) => {
    
    // req.file = file;
    cb(null, true);

};

// DICOM API Handler functions
function handleDicomUpload(req, res) {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const dicomId = req.file.filename;
    res.status(201).json({ id: dicomId });
  }
  
  function handleDicomAttribute(req, res) {
    const { dicomId, dicomTag } = req.params;
    const attributeValue = extractDicomAttribute(dicomId, dicomTag);
    res.json({ tag: dicomTag, value: attributeValue });
  }
  
  async function handleDicomPng(req, res) {
    const { dicomId } = req.params;
    
    const pngPath = await convertDicomToPng(dicomId);
    if (!pngPath || !pngPath.success) {
        switch (pngPath.code) {
            case 'bits':
                return res.status(415).send(pngPath.error);
            case 'no_pixel_data':
                return res.status(422).send(pngPath.error);
            default:
                return res.status(500).send(pngPath.error);
        }
    } else {
      res.set('Content-Type', 'image/png');
      res.status(200).sendFile(pngPath.pngPath);
    };
  }


// Helper functions (to be implemented)
function extractDicomAttribute(dicomId, dicomTag) {
    
    var dicomFileAsBuffer;
    var dicomData;

    try {
        dicomFileAsBuffer = dataStore.getDicomFile(dicomId);
        dicomData = dicomParser.parseDicom(dicomFileAsBuffer);
    } catch (err) {
        return null;
    }

    return dicomData.string(dicomTag);    
}

async function convertDicomToPng(dicomId) { 
    try {
                
         // Read the DICOM file
        const dicomFileBuffer = dataStore.getDicomFile(dicomId);

        // Parse the DICOM data
        const dataSet = dicomParser.parseDicom(dicomFileBuffer);

        // Get image dimensions
        const width = dataSet.uint16('x00280011');
        const height = dataSet.uint16('x00280010');
        const bitsAllocated = dataSet.uint16('x00280100');
        const pixelRepresentation = dataSet.uint16('x00280103');

        // Get pixel data
        const pixelDataElement = dataSet.elements.x7fe00010;
        if (!pixelDataElement) {
            return { success: false, code: 'no_pixel_data', error: 'No pixel data found in tag 0x7fe00010' };
        }

        // Create canvas and draw image
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        // Handle different bit allocations
        if (bitsAllocated === 16) {
            const pixelData16 = pixelRepresentation === 1 
                ? new Int16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2)
                : new Uint16Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length / 2);
            
            // Find the min and max values for normalization
            let min = pixelData16[0], max = pixelData16[0];
            for (let i = 1; i < pixelData16.length; i++) {
                if (pixelData16[i] < min) min = pixelData16[i];
                if (pixelData16[i] > max) max = pixelData16[i];
            }

            for (let i = 0; i < pixelData16.length; i++) {
                // Normalize to 0-255
                const pixel = Math.round(((pixelData16[i] - min) / (max - min)) * 255);
                // Convert to grayscale image
                imageData.data[i * 4] = pixel;     // R
                imageData.data[i * 4 + 1] = pixel; // G
                imageData.data[i * 4 + 2] = pixel; // B
                imageData.data[i * 4 + 3] = 255;   // A
            }
        } else {
            return { success: false, code: 'bits', error: `Unsupported bits allocated: ${bitsAllocated}` };;
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to PNG using sharp
        const pngBuffer = await sharp(canvas.toBuffer('image/png'))
        .png()
        .toBuffer();

        // Save the PNG file
        const outputPngPath = dataStore.savePNG(dicomId, pngBuffer);

        console.log('Conversion completed successfully');
        return { success: true, pngPath: outputPngPath }; 

    } catch (error) {

        console.error('Error converting DICOM to PNG:', error);
        return { success: false, error: error };
    
    }
        
 }

module.exports = {
    dicomFileFilter,
    handleDicomAttribute,
    handleDicomUpload,
    handleDicomPng,
}