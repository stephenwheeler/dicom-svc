const express = require('express');
const multer = require('multer');
const { generateUniqueId, extractDicomAttribute, convertDicomToPng, dicomFileFilter } = require('./dicom');


const app = express();

const upload = multer({
    dest: 'uploads/',
    fileFilter: dicomFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
  });

// Upload DICOM file
app.post('/api/v1/dicom', upload.single('dicom'), handleDicomUpload);

// Get DICOM attribute
app.get('/api/v1/dicom/:dicomId/attribute/:dicomTag', handleDicomAttribute);

// Get PNG representation
app.get('/api/v1/dicom/:dicomId/png', handleDicomPng);


module.exports = app;