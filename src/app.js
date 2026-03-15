import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';

import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { metricsMiddleware } from './middleware/metricsMiddleware.js';
import { register } from './config/metrics.js';

import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import signupRoutes from './routes/signup.js';
import adminRoutes from './routes/adminroutes.js';

import reportRoutes from './routes/report.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

import doctorRoutes from './routes/doctor.routes.js';
import receptionRoutes from './routes/reception.routes.js';
import billingRoutes from './routes/billing.routes.js';

import patientRoutes from './routes/patient.js';
import deptRoutes from './routes/dept.js';
import appointmentRoutes from './routes/appointment.js';

const app = express();

app.set('trust proxy', 1);

//basic security
app.disable('x-powered-by');
app.use(helmet());
app.use(hpp());
app.use(compression());

const allowedOrigins =
  process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json({ limit: '10kb' }));

app.use(metricsMiddleware);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      skip: (req) =>
        req.url === '/health' || req.url === '/metrics'
    })
  );
}

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'hms-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Backend is online'
  });
});

//app.use(globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/signup', signupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use('/api/users/doctors', doctorRoutes);
app.use('/api/users/receptionist', receptionRoutes);
app.use('/api/billing', billingRoutes);

app.use('/api/patients', patientRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

export default app;