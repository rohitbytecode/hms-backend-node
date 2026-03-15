import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Doctor from '../src/models/Doctor.js';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User.js');
jest.mock('../src/models/Doctor.js');

describe('Doctor Integration Tests', () => {
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

  describe('GET /api/users/doctors', () => {
    it('should return doctors list for admin', async () => {
      Doctor.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { _id: 'doc1', name: 'Dr. Test', email: 'doc@test.com' }
        ])
      });

      const res = await request(app)
        .get('/api/users/doctors')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.doctors.length).toBe(1);
    });
  });

  describe('POST /api/users/doctors', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/users/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Dr. Test' }); // missing email, pass, dept

      expect(res.statusCode).toBe(400);
    });
  });
});
