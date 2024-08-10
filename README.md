# dicom-svc

To run the service:

npm start


To make requests to the service:

curl -X POST -H "Content-Type: multipart/form-data" -F "dicom=@/Users/stephenwheeler/Documents/SE000001/IM000003" http://localhost:3000/api/v1/dicom

curl -X GET http://localhost:3000/api/v1/dicom/d036cca4200d307e319be0cfd557d03a/attribute/x00100010

curl -X GET http://localhost:3000/api/v1/dicom/d036cca4200d307e319be0cfd557d03a/png --output steve.png
