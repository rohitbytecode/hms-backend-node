import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Patient from '../src/models/patient.js';
import bcrypt from 'bcrypt';

describe('HMS Patient Flow Integration', () => {
  let adminToken;

  beforeAll(async () => {
    const url = 'mongodb://mongo:27017/hms_patient_test';
    await mongoose.connect(url);
    await User.deleteMany({});
    await Patient.deleteMany({});

    // Create Admin for testing
    const admin = new User({
        email: 'admin_patient_test@hms.com',
        password: await bcrypt.hash('adminpassword', 10),
        role: 'admin',
        status: 'Active'
    });
    await admin.save();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin_patient_test@hms.com', password: 'adminpassword', role: 'admin' });
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await mongoose.connection.close();
  });

  let patientId;

  it('1. Should register a patient without password requirement', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        phno: '1234567890',
        age: 30,
        gender: 'male',
        status: 'active',
        bg: 'O+',
        address: '123 Test St'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    patientId = res.body._id;
  });

  it('2. Should fetch patient by ID (Verifying the 404 fix)', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('John Doe');
  });

  it('3. Should update patient details', async () => {
    const res = await request(app)
      .put(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Updated'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('John Updated');
  });
});
