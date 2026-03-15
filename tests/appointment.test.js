import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Appointment from '../src/models/Appointment.js';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User.js');
jest.mock('../src/models/Appointment.js');

describe('Appointment Integration Tests', () => {
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

  describe('GET /api/appointments', () => {
    it('should return appointments list', async () => {
      Appointment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: 'apt1', patient: 'pat1', doctor: 'doc1', status: 'Scheduled' }
        ])
      });
      // The backend uses .find().populate().populate(), mocking populate strictly is complex, 
      // but returning a chainable mock handles most cases.
      Appointment.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([ { _id: 'apt1' } ]) }) });

      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data) || Array.isArray(res.body.appointments)).toBe(true);
    });
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      Appointment.prototype.save = jest.fn().mockResolvedValue({ _id: 'newApt' });
      User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'adminId', role: 'admin', status: 'Active', name: 'Admin', email: 'admin@hms.com' }) });

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: 'patId',
          dept: 'deptId',
          doctor: 'docId',
          date: new Date().toISOString(),
          rsv: 'Fever'
        });

      // Based on validation it will return 201
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
