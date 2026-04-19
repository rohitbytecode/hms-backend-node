import doctorService from '../services/doctor.service.js';
import User from '../models/User.js';

const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await doctorService.changePassword(
      req.user.id, 
      oldPassword, 
      newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getDoctors();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await doctorService.updateDoctor(id, req.body);
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doctorService.deleteDoctor(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMyWorkingHours = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

    doctor.pendingWorkingHours = req.body.workingHours
    doctor.pendingWorkingHoursStatus = 'pending'
    await doctor.save()

    res.json({ message: 'Schedule change submitted for admin approval.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

  const approveSchedule = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })
    if (!doctor.pendingWorkingHours) return res.status(400).json({ message: 'No pending schedule.' })

    doctor.workingHours = doctor.pendingWorkingHours
    doctor.pendingWorkingHours = undefined
    doctor.pendingWorkingHoursStatus = 'approved'
    await doctor.save()

    res.json({ message: 'Schedule approved.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

  const rejectSchedule = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

    doctor.pendingWorkingHours = undefined
    doctor.pendingWorkingHoursStatus = 'rejected'
    await doctor.save()

    res.json({ message: 'Schedule rejected.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
  
export {
  createDoctor,
  changePassword,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  updateMyWorkingHours,
  approveSchedule,
  rejectSchedule
};