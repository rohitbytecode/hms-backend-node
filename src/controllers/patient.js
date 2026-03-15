import Patient from '../models/patient.js';
<<<<<<< HEAD
import { createPatientPortalAccount } from '../services/patientPortal.service.js';
=======
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import * as emailService from '../services/email.service.js';
>>>>>>> recovery-branch

const createPatient = async (req, res, next) => {
  try {
    const { name, email, phno, paymentMode } = req.body;
    console.log(`Creating patient: ${name}, Email: ${email}, PaymentMode: ${paymentMode}`);

    // Create the patient record
    const patient = new Patient(req.body);
    await patient.save();

<<<<<<< HEAD
    const { email, paymentMethod } = req.body;

    if (paymentMethod === "online" && email) {
      await createPatientPortalAccount(email);
    }

    res.status(201).json({
      success: true,
      patient
    });

=======
    // If online payment, create a patient portal account
    if (paymentMode === 'online') {
      console.log(`Online payment mode detected for ${email}. Processing portal creation...`);
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        // Use phone number as default password
        const password = phno; // Plain text for the email
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'patient',
          status: 'Active',
          phno
        });
        console.log(`Patient portal User record created for: ${email}`);

        // Send credentials email
        try {
          await emailService.sendPortalCredentials(email, name, password);
          console.log(`Portal credentials email sent to: ${email}`);
        } catch (mailErr) {
          console.error(`Failed to send portal credentials email: ${mailErr.message}`);
        }
      } else {
        console.log(`User account already exists for: ${email}. Skipping portal creation.`);
      }
    } else {
      console.log(`Payment mode is '${paymentMode}'. Skipping portal creation.`);
    }

    res.status(201).json(patient);
>>>>>>> recovery-branch
  } catch (err) {
    console.error(`Error in createPatient: ${err.message}`);
    next(err);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,       
      runValidators: true 
    });

    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json(patient);
  } catch (err) {
    next(err);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
