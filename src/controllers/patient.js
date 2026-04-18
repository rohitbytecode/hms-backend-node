import Patient from "../models/patient.js";
import { createPatientPortalAccount } from "../services/patientPortal.service.js";
import { checkUniqueUser } from "../utils/uniqueness.js";
import User from "../models/User.js";

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
    const { name, email, phno } = req.body;

    console.log(`Creating patient: ${name}, Email: ${email}`);

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

    if (normalizedEmail) {
      try {
        await createPatientPortalAccount(normalizedEmail);
      } catch (portalErr) {
        console.error(
          `Patient saved but portal creation failed for ${normalizedEmail}:`,
          portalErr.message,
        );

        return res.status(201).json({
          success: true,
          patient,
          warning:
            "Patient created but portal account could not be set up. Please retry manually.",
        });
      }
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
  const session = await Patient.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const patient = await Patient.findByIdAndDelete(id, { session });

    if (!patient) {
      await session.abortTransaction();
      const error = new Error("Patient not found");
      error.statusCode = 404;
      return next(error);
    }

    if (patient.email) {
      await User.findOneAndDelete({ email: patient.email }, { session });
    }

    await session.commitTransaction();

    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
