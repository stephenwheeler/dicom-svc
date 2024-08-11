const express = require('express');
const multer = require('multer');
const { handleDicomUpload, handleDicomAttribute, handleDicomPng, dicomFileFilter } = require('./dicom');
const auth = require('./authorization');
const app = express();


//
// Public Routes
//

// About
app.get('/about', (req, res) => {
    res.status(200).send({ 'DICOM API': 'v1' });
  });
  

//
// Protected Routes
//

// Enable token validation on API calls below this point.
//  NEVER COMMENT THIS OUT IN COMMITTED CODE - WITHOUT THIS PUBLIC USERS CAN MAKE UNAUTHENTICATED API CALLS.
app.use(auth.validateAuthToken);
  

const maxFileSizeMBs = 50;  // Limit file size

const upload = multer({
    dest: 'uploads/',
    fileFilter: dicomFileFilter,
    
    limits: { fileSize: maxFileSizeMBs * 1024 * 1024 } 
  });

// Upload DICOM file
app.post('/api/v1/dicom', upload.single('dicom'), handleDicomUpload);

// Get DICOM attribute
app.get('/api/v1/dicom/:dicomId/attribute/:dicomTag', auth.validateDataAccess,handleDicomAttribute);

// Get PNG representation
app.get('/api/v1/dicom/:dicomId/png', auth.validateDataAccess, handleDicomPng);


module.exports = app;