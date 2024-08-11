const fs = require('fs');
const path = require('path');

function getDicomFile(dicomId) {
    const dicomFilePath = './uploads/' + dicomId;
        
     // Read the DICOM file
    const dicomFileBuffer = fs.readFileSync(dicomFilePath);

    return dicomFileBuffer;
}

async function deleteDicomFile(dicomId) {
    // Delete the DICOM file
    await fs.promises.unlink(path.join(__dirname, 'uploads', dicomId));
}

function savePNG(dicomId, pngBuffer) {
    // Write PNG to disk
    const outputPngPath = path.join(__dirname, '/png/' + dicomId + '.png');
    fs.writeFileSync(outputPngPath, pngBuffer);

    return outputPngPath;
}

module.exports = { getDicomFile, savePNG, deleteDicomFile }