import User from "../models/User.js";
import bcrypt from "bcrypt";
import { checkUniqueUser } from "../utils/uniqueness.js";

const createDoctor = async (data) => {
  const email = normalizeEmail(data.email);
  const phno = sanitizePhone(data.phno);

  await checkUniqueUser({ email, phno });

  const password = data.password || "doctor@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const doctor = new User({
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

const changePassword = async (userId, oldPassword, newPassword) => {
  const doctor = await User.findById(userId);
  if (!doctor) throw new Error("Doctor not found");

  const isMatch = await bcrypt.compare(oldPassword, doctor.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  doctor.password = await bcrypt.hash(newPassword, 10);
  await doctor.save();

  return { message: "Password changed successfully" };
};

const getDoctors = async () => {
  return await User.find({ role: "doctor" });
};

const updateDoctor = async (id, data) => {
  if (data.workingHours) {
    throw new Error("Use dedicated endpoint to update working hours");
  }

  let email, phno;

  if (data.email) {
    email = normalizeEmail(data.email);
  }

  if (data.phno) {
    phno = sanitizePhone(data.phno);
  }

  if (email || phno) {
    await checkUniqueUser({
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
    const doctor = await User.findOneAndUpdate({ _id: id, role: "doctor" }, data, {
      new: true,
      runValidators: true,
    });

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

const deleteDoctor = async (id) => {
  const doctor = await User.findOneAndDelete({ _id: id, role: "doctor" });
  if (!doctor) throw new Error("Doctor not found");

  return { message: "Doctor deleted successfully" };
};

const updateWorkingHours = async (doctorId, workingHours) => {
  const doctor = await User.findOne({
    _id: doctorId,
    role: "doctor",
  });

  if (!doctor) throw new Error("Doctor not found");

  doctor.workingHours = workingHours;

  await doctor.save();

  return {
    message: "Working hours updated successfully",
  };
};

export default {
  createDoctor,
  changePassword,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  updateWorkingHours,
};
