import mongoose from "mongoose";

const Patientschema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      match: /.+@.+\..+/,
    },
    phno: {
      type: String,
      unique: true,
      required: true,
      match: /^[0-9]{10}$/,
    },
    age: {
      type: Number,
      required: true,
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
      validate: {
        validator: Number.isInteger,
        message: "Age must be a whole number",
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
      required: true,
    },
    bg: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    address: { type: String },
    emerno: {
      type: String,
      match: /^[0-9]{10}$/,
    },
    medical_history: { type: String },
    paymentMode: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

const Patient = mongoose.model("Patient", Patientschema);
export default Patient;
