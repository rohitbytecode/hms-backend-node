import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/User.js');
jest.mock('bcrypt');

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' }); // missing password
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for invalid email', async () => {
      User.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password', role: 'admin' });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should return 200 and token for valid credentials', async () => {
      const mockUser = {
        _id: 'userid',
        email: 'admin@test.com',
        role: 'admin',
        status: 'Active'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password', role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('admin@test.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return user profile if valid token provided', async () => {
      const token = jwt.sign({ id: 'userid' }, process.env.JWT_SECRET);
      
      const mockUser = {
        _id: 'userid',
        email: 'admin@test.com',
        role: 'admin',
        status: 'Active',
      };
      User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('admin@test.com');
    });
  });
});
