import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from 'bcrypt';

describe('HMS Integration Suite - Auth & Roles', () => {
  let token;

  beforeAll(async () => {
    // Force local test database
    const url = 'mongodb://mongo:27017/hms_auth_test';
    await mongoose.connect(url);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  const testUser = {
    email: 'test_reception@hms.com',
    password: 'reception@123',
    role: 'receptionist',
    name: 'Test Receptionist',
    phno: '1234567890',
    status: 'Active'
  };

  it('1. Should create a new receptionist (via internal service logic simulated)', async () => {
    // We simulate the receptionist creation that usually happens via Admin
    // In a real integration test, we might call the Admin API, but first we need an Admin.
    const admin = new User({
        email: 'admin_test@hms.com',
        password: 'adminpassword', 
        role: 'admin',
        status: 'Active'
    });
    admin.password = await bcrypt.hash('adminpassword', 10);
    await admin.save();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin_test@hms.com', password: 'adminpassword', role: 'admin' });
    
    expect(loginRes.statusCode).toBe(200);
    const adminToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/users/receptionist')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: testUser.name,
        email: testUser.email,
        phno: testUser.phno,
        status: testUser.status
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('2. Should login successfully with default password "reception@123"', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'reception@123',
        role: 'receptionist'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('3. Should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
        role: 'receptionist'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('4. Should access receptionist-only dashboard route', async () => {
    const res = await request(app)
      .get('/api/users/receptionist') // This route is protect, authorize('admin', 'receptionist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
