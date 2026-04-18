import Patient from "../models/patient.js";
import { createPatientPortalAccount } from "../services/patientPortal.service.js";
import { checkUniqueUser } from "../utils/uniqueness.js"; // ← Import this

const normalizeEmail = (email) => {
  if (!email) return email;
  return email.trim().toLowerCase();
};

const sanitizePhone = (phno) => {
  if (!phno) return phno;
  return phno.toString().replace(/\D/g, "");
};

const createPatient = async (req, res, next) => {
  try {
    const { name, email, phno, paymentMode } = req.body;

    console.log(
      `Creating patient: ${name}, Email: ${email}, PaymentMode: ${paymentMode}`,
    );

    const normalizedEmail = normalizeEmail(email);
    const sanitizedPhno = sanitizePhone(phno);

    await checkUniqueUser(Patient, {
      email: normalizedEmail,
      phno: sanitizedPhno,
    });

    const patient = new Patient({
      ...req.body,
      email: normalizedEmail,
      phno: sanitizedPhno,
    });

    await patient.save();

    if (paymentMode === "online" && normalizedEmail) {
      await createPatientPortalAccount(normalizedEmail);
    }

    res.status(201).json({
      success: true,
      patient,
    });
  } catch (err) {
    console.error(`Error in createPatient: ${err.message}`);

    if (err.code === 11000) {
      if (err.keyPattern?.email) {
        return next(new Error("Email already exists"));
      }
      if (err.keyPattern?.phno) {
        return next(new Error("Phone number already exists"));
      }
    }

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
      const error = new Error("Patient not found");
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

    let normalizedEmail = req.body.email ? normalizeEmail(req.body.email) : undefined;
    let sanitizedPhno = req.body.phno ? sanitizePhone(req.body.phno) : undefined;

    if (normalizedEmail || sanitizedPhno) {
      await checkUniqueUser(Patient, {
        email: normalizedEmail || undefined,
        phno: sanitizedPhno || undefined,
        excludeId: id,
      });
    }

    const updateData = { ...req.body };
    if (normalizedEmail) updateData.email = normalizedEmail;
    if (sanitizedPhno) updateData.phno = sanitizedPhno;

    const patient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json(patient);
  } catch (err) {
    console.error(`Error in updatePatient: ${err.message}`);

    if (err.code === 11000) {
      if (err.keyPattern?.email) {
        return next(new Error("Email already exists"));
      }
      if (err.keyPattern?.phno) {
        return next(new Error("Phone number already exists"));
      }
    }

    next(err);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
