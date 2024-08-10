const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('./app'); // Adjust the path as necessary

describe('DICOM API', () => {
  jest.setTimeout(30000);

  let dicomId;

  // Test DICOM file upload
  test('POST /api/v1/dicom should upload a DICOM file', async () => {
    const response = await request(app)
      .post('/api/v1/dicom')
      .attach('dicom', path.join(__dirname, './test-data/IM000003.dcm'), {
        contentType: 'application/dicom'
      }) 
      .expect(201);

    expect(response.body).toHaveProperty('id');
    dicomId = response.body.id;
  });

  // Test getting DICOM attribute
  test('GET /api/v1/dicom/{dicom_id}/attribute/{dicom_tag} should return attribute value', async () => {
    const dicomTag = '00100010'; // Patient's Name tag
    const dicomId = '8bc6637b120fea9516986d19ed8f7b8d'; // from uploads folder
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/attribute/${dicomTag}`)
      .expect(200);

    expect(response.body).toHaveProperty('tag', dicomTag);
    expect(response.body).toHaveProperty('value', 'NAYYAR^HARSH');
  });

  // Test PNG conversion
  test('GET /api/v1/dicom/{dicom_id}/png should return a PNG image', async () => {
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/png`)
      .expect(200)
      .expect('Content-Type', 'image/png');

    expect(response.body).toBeInstanceOf(Buffer);
  });

  // Clean up test files after all tests
  afterAll(async () => {
    if (dicomId) {
      await fs.unlink(path.join(__dirname, '..', 'uploads', dicomId));
    }
  });

});