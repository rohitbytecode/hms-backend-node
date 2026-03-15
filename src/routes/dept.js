import express from 'express';
import { protect, authorize } from '../middleware/authmiddleware.js';
import * as departmentController from '../controllers/department.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), departmentController.createDepartment);

router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'patient'), departmentController.getDepartments);

export default router;