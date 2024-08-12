const request = require('supertest');
const dataStore = require('./dataStore');
const path = require('path');
const app = require('./app'); // Adjust the path as necessary

describe('DICOM API', () => {
  jest.setTimeout(30000);

  var uploads_cleanup = [];

  test('GET /about', async () => {
    const response = await request(app)
      .get('/about')
      .expect(200);
    expect(response.body).toHaveProperty('DICOM API', 'v1');
  });

  // Test DICOM file upload
  test('POST /api/v1/dicom should upload a DICOM file', async () => {
    const response = await request(app)
      .post('/api/v1/dicom')
      .attach('dicom', path.join(__dirname, './test-data/IM000003.dcm'), {
        contentType: 'application/dicom'
      }) 
      .expect(201);

    expect(response.body).toHaveProperty('id');

    // Cleanup - see afterAll.
    uploads_cleanup.push(response.body.id);
  });

  test('POST /api/v1/dicom without a file', async () => {
    const response = await request(app)
      .post('/api/v1/dicom')
      .send({}) 
      .expect(400);

  
  });

  // Test getting DICOM attribute
  test('GET /api/v1/dicom/{dicom_id}/attribute/{dicom_tag} should return attribute value', async () => {
    const dicomTag = 'x00100010'; // Patient's Name tag
    const dicomId = '0f4aed7e2bfe767cb5357aa46fb43332'; // from uploads folder
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/attribute/${dicomTag}`)
      .expect(200);

    expect(response.body).toHaveProperty('tag', dicomTag);
    expect(response.body).toHaveProperty('value', 'NAYYAR^HARSH');
  });

  test('GET /api/v1/dicom/{dicom_id}/attribute/{dicom_tag} with invalid tag', async () => {
    const dicomTag = 'x00000000'; // Invalid tag
    const dicomId = '0f4aed7e2bfe767cb5357aa46fb43332'; // from uploads folder
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/attribute/${dicomTag}`)
      .expect(200);

    expect(response.body).toHaveProperty('tag', dicomTag);
    expect(response.body).not.toHaveProperty('value');
  });

  test('GET /api/v1/dicom/{dicom_id}/attribute/{dicom_tag} with invalid DICOM ID', async () => {
    const dicomTag = 'x00000000'; // Invalid tag
    const dicomId = '0f4aed7e2bfe767cb5357aa46fbinvalid'; // invalid ID
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/attribute/${dicomTag}`)
      .expect(200);

    expect(response.body).toHaveProperty('tag', dicomTag);
    expect(response.body).toHaveProperty('value', null);
  });

  // Test PNG conversion
  test('GET /api/v1/dicom/{dicom_id}/png should return a PNG image', async () => {
    const dicomId = '0f4aed7e2bfe767cb5357aa46fb43332'; // from uploads folder
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/png`)
      .expect(200)
      .expect('Content-Type', 'image/png');

    expect(response.body).toBeInstanceOf(Buffer);
  });

  test('GET PNG for an image with no pixel data', async () => {
    const dicomId = '727c5c9cc0b860ae6fb42dde90accada'; // Has no pixel data
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/png`)
      .expect(422)
    
  });

  test('GET PNG for a non-existing image', async () => {
    const dicomId = '727c5c9cc0b860ae6fb42dde90doesntexist'; // doesnt exist
    const response = await request(app)
      .get(`/api/v1/dicom/${dicomId}/png`)
      .expect(500)
    
  });

  test.skip('Convert a bunch of images in search of edge cases', async () => {
    const testDataFolder = "/Users/stephenwheeler/Documents/SE000002";
    const fs = require('fs');
    const files = fs.readdirSync(testDataFolder).filter(f => f.startsWith("IM0"));
    for (const file of files) {
      const filePath = path.join(testDataFolder, file);
      const response = await request(app)
        .post('/api/v1/dicom')
        .attach('dicom', filePath, {
          contentType: 'application/dicom'
        }) 
        .expect(201);

      const dicomId = response.body.id;

      await request(app)
        .get(`/api/v1/dicom/${dicomId}/png`)
        .expect(200)
        .expect('Content-Type', 'image/png');
    }
    
  });


  // Clean up test files after all tests
  afterAll(async () => {
    if (uploads_cleanup.length > 0) {
      for (const dicomId of uploads_cleanup) {
        await dataStore.deleteDicomFile(dicomId);
      }
    }
  });

});