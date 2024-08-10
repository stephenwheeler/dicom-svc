const express = require('express');
const multer = require('multer');
const { handleDicomUpload, handleDicomAttribute, handleDicomPng, dicomFileFilter } = require('./dicom');


const app = express();

const maxFileSizeMBs = 50;  // Limit file size

const upload = multer({
    dest: 'uploads/',
    fileFilter: dicomFileFilter,
    limits: { fileSize: maxFileSizeMBs * 1024 * 1024 } 
  });

// Upload DICOM file
app.post('/api/v1/dicom', upload.single('dicom'), handleDicomUpload);

// Get DICOM attribute
app.get('/api/v1/dicom/:dicomId/attribute/:dicomTag', handleDicomAttribute);

// Get PNG representation
app.get('/api/v1/dicom/:dicomId/png', handleDicomPng);


module.exports = app;