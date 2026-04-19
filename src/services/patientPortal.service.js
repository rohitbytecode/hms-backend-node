import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateRandomPassword } from "../utils/password.utils.js";
import { sendCredentialsEmail } from "./email.service.js";

export const createPatientPortalAccount = async (email, name) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log(`Portal account already exists for: ${email}`);
    return;
  }

  const rawPassword = generateRandomPassword(10);
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = new User({
    email,
    password: hashedPassword,
    role: "patient",
    status: "Active",
    mustChangePassword: true,
    name: name || "",
  });

  await user.save();

  await sendCredentialsEmail(email, rawPassword);

  console.log(`Portal account created for: ${email}`);
};
