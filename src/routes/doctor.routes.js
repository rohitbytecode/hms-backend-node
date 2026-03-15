import express from 'express';
import { protect, authorize } from '../middleware/authmiddleware.js';
import * as doctorController from '../controllers/doctor.controller.js';

const router = express.Router();

router.post('/', protect, authorize(['admin']), doctorController.createDoctor);

router.get('/', protect, authorize('admin', 'doctor', 'receptionist'), doctorController.getDoctors);

router.put('/change-password', protect, authorize('doctor'), doctorController.changePassword);

router.put('/:id', protect, authorize('admin'), doctorController.updateDoctor);

router.put('/me/working-hours',
    protect,
    authorize('doctor'),
    doctorController.updateMyWorkingHours
);

router.delete('/:id', protect, authorize('admin'), doctorController.deleteDoctor);

export default router;