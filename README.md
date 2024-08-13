# dicom-svc

To run the service
------------------

npm install

npm start

For Docker
----------

npm run docker:build

npm run docker:run


To make requests to the service
-------------------------------

// Upload a DICOM image

curl -X POST -H "Content-Type: multipart/form-data" -F "dicom=@/Users/stephenwheeler/Documents/SE000001/IM000003" http://localhost:3000/api/v1/dicom

// Query a DICOM attribute of a DICOM image

curl -X GET http://localhost:3000/api/v1/dicom/d036cca4200d307e319be0cfd557d03a/attribute/x00100010

// Download a PNG file of a DICOM image

curl -X GET http://localhost:3000/api/v1/dicom/d036cca4200d307e319be0cfd557d03a/png --output steve.png


Next Steps
----------

1. Convert API's to use streams to minimize memory usage and handle large file sizes.
2. Add support for uploading multiple files (e.g. a whole imaging series) simultaneously.
