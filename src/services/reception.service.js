import User from "../models/User.js";
import bcrypt from "bcrypt";

const normalizeEmail = (email) => {
  if (!email) return email;
  return email.trim().toLowerCase();
};

const sanitizePhone = (phno) => {
  if (!phno) return phno;
  return phno.toString().replace(/\D/g, "");
};

const creatReceptionist = async (data) => {
  const email = normalizeEmail(data.email);
  const phno = sanitizePhone(data.phno);

  const password = data.password || "reception@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const receptionist = new User({
      ...data,
      email,
      phno,
      password: hashedPassword,
      role: "receptionist",
    });

    await receptionist.save();

    return {
      success: true,
      message: "Receptionist created successfully",
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
  const receptionist = await User.findById(userId);
  if (!receptionist) throw new Error("Receptionist not found");

  const isMatch = await bcrypt.compare(oldPassword, receptionist.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  receptionist.password = await bcrypt.hash(newPassword, 10);
  await receptionist.save();

  return { message: "Password changed successfully" };
};

const getReceptionists = async () => {
  return await User.find({ role: "receptionist" });
};

const updateReceptionist = async (id, data) => {
  let email, phno;

  if (data.email) email = normalizeEmail(data.email);
  if (data.phno) phno = sanitizePhone(data.phno);

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  if (email) data.email = email;
  if (phno) data.phno = phno;

  try {
    const receptionist = await User.findOneAndUpdate(
      { _id: id, role: "receptionist" },
      data,
      { new: true, runValidators: true },
    );

    if (!receptionist) throw new Error("Receptionist not found");

    return receptionist;
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email) throw new Error("Email already exists");
      if (err.keyPattern?.phno) throw new Error("Phone number already exists");
    }
    throw err;
  }
};

const deleteReceptionist = async (id) => {
  const receptionist = await User.findOneAndDelete({ _id: id, role: "receptionist" });

  if (!receptionist) throw new Error("Receptionist not found");

  return { message: "Receptionist deleted successfully" };
};

export default {
  creatReceptionist,
  changePassword,
  getReceptionists,
  updateReceptionist,
  deleteReceptionist,
};
