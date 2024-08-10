const dicomParser = require('dicom-parser');
const fs = require('fs');


// File filter for multer
const dicomFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/dicom' || 
            file.mimetype === 'application/x-dicom' || 
            file.mimetype === 'image/x-dicom')
    {
        cb(null, true);
    } else {
        cb(new Error('Only DICOM files are allowed!'), false);
    }
};

// DICOM API Handler functions
function handleDicomUpload(req, res) {
    const dicomId = req.file.filename;
    res.status(201).json({ id: dicomId });
  }
  
  function handleDicomAttribute(req, res) {
    const { dicomId, dicomTag } = req.params;
    const attributeValue = extractDicomAttribute(dicomId, dicomTag);
    res.json({ tag: dicomTag, value: attributeValue });
  }
  
  function handleDicomPng(req, res) {
    const { dicomId } = req.params;
    convertDicomToPng(dicomId, (err, pngPath) => {
      if (err) {
        return res.status(500).send('Conversion failed');
      }
      res.sendFile(pngPath);
    });
  }


// Helper functions (to be implemented)
function extractDicomAttribute(dicomId, dicomTag) {
    
    var dicomFileAsBuffer = fs.readFileSync('./uploads/' + dicomId);
    
    var dicomData;
    try {
        dicomData = dicomParser.parseDicom(dicomFileAsBuffer);
    } catch (err) {
        return null;
    }
    
    return dicomData.string('x' + dicomTag);    
}

function convertDicomToPng(dicomId, callback) { /* ... */ }

module.exports = {
    dicomFileFilter,
    handleDicomAttribute,
    handleDicomUpload,
    handleDicomPng,
}