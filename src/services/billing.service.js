import bcrypt from "bcrypt";
import { checkUniqueUser } from "../utils/uniqueness.js";
import UserModel from "../models/User.js";

const getUserModel = () => UserModel;

const normalizeEmail = (email) => {
  if (!email) return email;
  return email.trim().toLowerCase();
};

const sanitizePhone = (phno) => {
  if (!phno) return phno;
  return phno.toString().replace(/\D/g, "");
};

const createBillingStaff = async (data) => {
  const UserModel = await getUserModel();

  const email = normalizeEmail(data.email);
  const phno = sanitizePhone(data.phno);

  await checkUniqueUser(UserModel, { email, phno });

  const password = data.password || "billing@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const billing = new UserModel({
      ...data,
      email,
      phno,
      password: hashedPassword,
      role: "billing",
    });

    await billing.save();

    return {
      success: true,
      message: "Billing staff created successfully",
    };
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email) throw new Error("Email aleady exists");
      if (err.keyPattern?.phno) throw new Error("Phone number already exists");
    }
    throw err;
  }
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const UserModel = await getUserModel();
  const billing = await UserModel.findById(userId);
  if (!billing) throw new Error("Billing staff not found");

  const isMatch = await bcrypt.compare(oldPassword, billing.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  billing.password = await bcrypt.hash(newPassword, 10);
  await billing.save();

  return { message: "Password changed successfully" };
};

const getAllBillingStaff = async () => {
  const UserModel = await getUserModel();
  return await UserModel.find({ role: "billing" });
};

const updateBillingStaff = async (id, data) => {
  const UserModel = await getUserModel();
  let email, phno;

  if (data.email) email = normalizeEmail(data.email);
  if (data.phno) phno = sanitizePhone(data.phone);

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
    const billing = await UserModel.findOneAndUpdate({ _id: id, role: "billing" }, data, {
      new: true,
      runValidators: true,
    });

    if (!billing) throw new Error("Billing staff not found");

    return billing;
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.email) throw new Error("Email already exists");
      if (err.keyPattern?.phno) throw new Error("Phone number already exists");
    }
    throw err;
  }
};

const deleteBillingStaff = async (id) => {
  const UserModel = await getUserModel();

  const billing = await UserModel.findOneAndDelete({ _id: id, role: "billing" });
  if (!billing) throw new Error("Billing staff not found");

  return { message: "Billing staff deleted successfully" };
};

export default {
  createBillingStaff,
  changePassword,
  getAllBillingStaff,
  updateBillingStaff,
  deleteBillingStaff,
};
