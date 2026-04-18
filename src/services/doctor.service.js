// doctor.service.js
import bcrypt from "bcrypt";
import { checkUniqueUser } from "../utils/uniqueness.js";

// Import User model here (inside the file, not at top if there's any issue)
let User;
const getUserModel = async () => {
  if (!User) {
    const module = await import("../models/User.js");
    User = module.default;
  }
  return User;
};

// Helper functions
const normalizeEmail = (email) => {
  if (!email) return email;
  return email.trim().toLowerCase();
};

const sanitizePhone = (phno) => {
  if (!phno) return phno;
  return phno.toString().replace(/\D/g, '');
};

const createDoctor = async (data) => {
  const UserModel = await getUserModel();

  const email = normalizeEmail(data.email);
  const phno = sanitizePhone(data.phno);

  await checkUniqueUser(UserModel, { email, phno });

  const password = data.password || "doctor@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const doctor = new UserModel({
      ...data,
      email,
      phno,
      password: hashedPassword,
      role: "doctor",
    });

    await doctor.save();

    return {
      success: true,
      message: "Doctor created successfully",
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email) throw new Error("Email already exists");
      if (err.keyPattern?.phno) throw new Error("Phone number already exists");
    }
    throw err;
  }
};

const updateDoctor = async (id, data) => {
  const UserModel = await getUserModel();

  if (data.workingHours) {
    throw new Error("Use dedicated endpoint to update working hours");
  }

  let email, phno;

  if (data.email) email = normalizeEmail(data.email);
  if (data.phno) phno = sanitizePhone(data.phno);

  if (email || phno) {
    await checkUniqueUser(UserModel, {
      email: email || undefined,
      phno: phno || undefined,
      excludeId: id,
    });
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  if (email) data.email = email;
  if (phno) data.phno = phno;

  try {
    const doctor = await UserModel.findOneAndUpdate(
      { _id: id, role: "doctor" }, 
      data, 
      { new: true, runValidators: true }
    );

    if (!doctor) throw new Error("Doctor not found");

    return doctor;
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email) throw new Error("Email already exists");
      if (err.keyPattern?.phno) throw new Error("Phone number already exists");
    }
    throw err;
  }
};

// Other functions (keep them simple)
const changePassword = async (userId, oldPassword, newPassword) => {
  const UserModel = await getUserModel();
  const doctor = await UserModel.findById(userId);
  if (!doctor) throw new Error("Doctor not found");

  const isMatch = await bcrypt.compare(oldPassword, doctor.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  doctor.password = await bcrypt.hash(newPassword, 10);
  await doctor.save();

  return { message: "Password changed successfully" };
};

const getDoctors = async () => {
  const UserModel = await getUserModel();
  return await UserModel.find({ role: "doctor" }).populate('dept');
};

const deleteDoctor = async (id) => {
  const UserModel = await getUserModel();
  const doctor = await UserModel.findOneAndDelete({ _id: id, role: "doctor" });
  if (!doctor) throw new Error("Doctor not found");
  return { message: "Doctor deleted successfully" };
};

const updateWorkingHours = async (doctorId, workingHours) => {
  const UserModel = await getUserModel();
  const doctor = await UserModel.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) throw new Error("Doctor not found");

  doctor.workingHours = workingHours;
  await doctor.save();

  return { message: "Working hours updated successfully" };
};

export default {
  createDoctor,
  changePassword,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  updateWorkingHours,
};