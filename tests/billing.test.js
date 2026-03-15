import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Billing from '../src/models/Billing.js';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User.js');
jest.mock('../src/models/Billing.js');

describe('Billing Integration Tests', () => {
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

  describe('GET /api/billing', () => {
    it('should return billing records', async () => {
      Billing.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([{ _id: 'bill1', amount: 500, status: 'pending' }])
        })
      });

      const res = await request(app)
        .get('/api/billing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/billing', () => {
    it('should create a new bill', async () => {
      Billing.prototype.save = jest.fn().mockResolvedValue({});
      
      const res = await request(app)
        .post('/api/billing')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          patient: 'patId',
          amount: 1500,
          paymentMethod: 'cash',
          status: 'paid'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
