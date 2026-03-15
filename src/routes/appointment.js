import express from 'express';
import { protect, authorize } from '../middleware/authmiddleware.js';
import * as appointmentController from '../controllers/aptcontrol.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'doctor', 'receptionist','billing'),
  appointmentController.createAppointment
);

router.get(
  '/',
  protect,
  authorize('admin', 'doctor', 'receptionist', 'patient', 'billing'),
  appointmentController.getAppointments
);

router.get(
  '/:id',
  protect,
  authorize('admin', 'doctor', 'receptionist', 'patient', 'billing'),
  appointmentController.getAppointmentById
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'doctor', 'receptionist','billing'),
  appointmentController.updateAppointment
);

/*router.delete(
  '/:id',
  protect,
  authorize('admin', 'doctor'),
  appointmentController.deleteAppointment
);*/

export default router;
