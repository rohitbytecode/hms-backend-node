import express from 'express';
import { protect, authorize } from '../middleware/authmiddleware.js';
import * as patientController from '../controllers/patient.js';

const router = express.Router();


router.get('/', protect, authorize('admin', 'doctor', 'receptionist'), patientController.getPatients);

router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist'), patientController.getPatientById);

router.post('/', protect, authorize('admin', 'doctor', 'receptionist'), patientController.createPatient);

router.put('/:id', protect, authorize('admin', 'doctor', 'receptionist'), patientController.updatePatient);

router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

export default router;
