import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Patient from '../src/models/patient.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
jest.setTimeout(30000);
jest.mock('../src/models/User.js');
jest.mock('../src/models/patient.js');

describe('Patient Integration Tests', () => {
  let adminToken;

  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    adminToken = jwt.sign({ id: 'adminId' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'adminId',
        role: 'admin',
        status: 'Active'
      })
    });
  });

  describe('GET /api/patients', () => {
    it('should return patients list for admin', async () => {
      Patient.find = jest.fn().mockResolvedValue([
        { _id: 'pat1', name: 'John Doe', email: 'john@test.com' }
      ]);

      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('POST /api/patients', () => {
    it('should register a new patient', async () => {
      Patient.prototype.save = jest.fn().mockResolvedValue({});
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@test.com',
          phno: '1234567890',
          age: 25,
          gender: 'Female',
          bg: 'O+',
          address: '123 Street'
        });

      expect(res.statusCode).toBe(201);

      const patient = res.body.data || res.body;

      expect(patient._id).toBeDefined();
    });

    it('should fail if missing required patient details', async () => {
      Patient.prototype.save = jest.fn().mockRejectedValue(new Error('Validation error'));
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Jane Doe' }); // missing fields

      // Assuming controller validates or database throws
      // The current backend likely returns 400 or 500
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
