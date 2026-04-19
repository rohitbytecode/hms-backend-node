import express from 'express'
import { protect, authorize } from '../middleware/authmiddleware.js'
import * as leaveController from '../controllers/leave.controller.js'

const router = express.Router()

router.post('/', protect, authorize('doctor'), leaveController.applyLeave)
router.get('/my', protect, authorize('doctor'), leaveController.getMyLeaves)
router.get('/pending', protect, authorize('admin'), leaveController.getAllLeaves)
router.put('/:id/approve', protect, authorize('admin'), leaveController.approveLeave)
router.put('/:id/reject', protect, authorize('admin'), leaveController.rejectLeave)
router.delete('/:id', protect, authorize('doctor'), leaveController.cancelLeave)
router.get('/doctor/:doctorId', protect, leaveController.getDoctorApprovedLeaves)

export default router