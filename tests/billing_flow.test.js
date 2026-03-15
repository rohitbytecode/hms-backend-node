import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Patient from '../src/models/patient.js';
import bcrypt from 'bcrypt';

describe('HMS Billing Flow Integration', () => {
  let adminToken;
  let patientId;

  beforeAll(async () => {
    const url = 'mongodb://mongo:27017/hms_billing_test';
    await mongoose.connect(url);
    await User.deleteMany({});
    await Patient.deleteMany({});

    // Create Admin for testing
    const admin = new User({
        email: 'admin_billing_test@hms.com',
        password: await bcrypt.hash('adminpassword', 10),
        role: 'admin',
        status: 'Active'
    });
    await admin.save();

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin_billing_test@hms.com', password: 'adminpassword', role: 'admin' });
    adminToken = loginRes.body.token;

    // Create a patient to bill
    const pRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jane Doe',
        email: 'jane@test.com',
        phno: '0987654321',
        age: 25,
        gender: 'female',
        status: 'active'
      });
    patientId = pRes.body._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Patient.deleteMany({});
    // Billing records would need to be cleared too if they exist
    await mongoose.connection.db.collection('billings').deleteMany({});
    await mongoose.connection.close();
  });

  let billId;

  it('1. Should create a new bill for a patient', async () => {
    const res = await request(app)
      .post('/api/billing')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        patient: patientId,
        amount: 500,
        status: 'pending',
        items: [{ desc: 'Consultation', price: 500 }]
      });

    expect([200, 201]).toContain(res.statusCode);
    billId = res.body.data?._id || res.body._id;
    expect(billId).toBeDefined();
  });

  it('2. Should fetch billing records (Verifying map bug fix)', async () => {
    const res = await request(app)
      .get('/api/billing')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const bills = res.body.data?.bills || res.body.bills || res.body;
    expect(Array.isArray(bills)).toBe(true);
  });

  it('3. Should update bill status to Paid', async () => {
    const res = await request(app)
      .patch(`/api/billing/${billId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'paid'
      });

    expect(res.statusCode).toBe(200);
    const updatedBill = res.body.data || res.body;
    expect(updatedBill.status).toBe('paid');
  });
});
