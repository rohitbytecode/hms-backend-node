import Appointment from '../models/appointment.js';
import mongoose from 'mongoose';

const createAppointment = async (req, res) => {
  try {
    const { patient, dept, doctor } = req.body;

    
    const [patientDoc, deptDoc, doctorDoc] = await Promise.all([
      mongoose.model('Patient').findById(patient),
      mongoose.model('Department').findById(dept),
      mongoose.model('User').findOne({ _id: doctor, role: 'doctor' })
    ]);

    if (!patientDoc) return res.status(400).json({ message: 'Invalid patient ID' });
    if (!deptDoc) return res.status(400).json({ message: 'Invalid department ID' });
    if (!doctorDoc) return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor' });

    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ message: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let query = {};
    if (role === 'doctor') {
      query.doctor = userId; 
    } else if (role === 'patient') {
      const patient = await mongoose.model('Patient').findOne({ email: req.user.email });
      if (!patient) {
        return res.status(404).json({ message: 'Patient record not found' });
      }
      query.patient = patient._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name spec')
      .populate('dept', 'dept')
      .lean();

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error while fetching appointments', error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name spec')
      .populate('dept', 'dept')
      .lean();

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment by ID:', err);
    res.status(500).json({ message: 'Server error while fetching appointment', error: err.message });
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { patient, dept, doctor, status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this appointment",
      });
    }

    if (req.user.role === "doctor" && (doctor || dept)) {
      return res.status(403).json({
        success: false,
        message: "Doctor cannot reassign appointment",
      });
    }

    if (patient || dept || doctor) {
      const checks = [];
      if (patient) checks.push(mongoose.model('Patient').findById(patient));
      if (dept) checks.push(mongoose.model('Department').findById(dept));
      if (doctor) checks.push(
        mongoose.model('User').findOne({ _id: doctor, role: 'doctor' })
      );

      const results = await Promise.all(checks);

      if (patient && !results[0])
        return res.status(400).json({ success: false, message: 'Invalid patient ID' });

    }

    if (status) {
      const validTransitions = {
        scheduled: ["completed", "cancelled"],
        completed: [],
        cancelled: []
      };

      const allowed = validTransitions[appointment.status] || [];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status transition"
        });
      }

      appointment.status = status;
    }

    if (patient) appointment.patient = patient;
    if (dept) appointment.dept = dept;
    if (doctor) appointment.doctor = doctor;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (err) {
    next(err);
  }
};

/*const deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!deletedAppointment) return res.status(404).json({ message: 'Appointment not found' });

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: err.message });
  }
};*/

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  //deleteAppointment,
};