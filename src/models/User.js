import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: timeRegex,
    },
    endTime: {
      type: String,
      required: true,
      match: timeRegex,
    },
  },
  { _id: false },
);

const workingDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    slots: {
      type: [slotSchema],
      default: [],
    },
  },
  { _id: false },
);

workingDaySchema.pre("validate", function () {
  if (!this.isAvailable && this.slots.length > 0) {
    return new Error("Slots cannot exist when doctor is unavailable");
  }

  const sorted = [...this.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].startTime >= sorted[i].endTime) {
      return new Error("Start time must be before end time");
    }

    if (i > 0 && sorted[i - 1].endTime > sorted[i].startTime) {
      return new Error("Overlapping time slots detected");
    }
  }
});

const DEFAULT_WORKING_HOURS = [
  { day: "Monday", isAvailable: true, slots: [{ startTime: "09:00", endTime: "17:00" }] },
  {
    day: "Tuesday",
    isAvailable: true,
    slots: [{ startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Wednesday",
    isAvailable: true,
    slots: [{ startTime: "09:00", endTime: "17:00" }],
  },
  {
    day: "Thursday",
    isAvailable: true,
    slots: [{ startTime: "09:00", endTime: "17:00" }],
  },
  { day: "Friday", isAvailable: true, slots: [{ startTime: "09:00", endTime: "17:00" }] },
  { day: "Saturday", isAvailable: false, slots: [] },
  { day: "Sunday", isAvailable: false, slots: [] },
];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+@.+\..+/,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "doctor", "receptionist", "billing", "patient"],
    },

    name: { type: String },

    phno: {
      type: String,
      match: /^[0-9]{10}$/,
      unique: true,
    },
    dob: { type: Date },
    joining_date: { type: Date },

    spec: { type: String },

    dept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    exp: { type: String },
    qual: { type: String },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    workingHours: {
      type: [workingDaySchema],
    },
  },
  { timestamps: true },
);

userSchema.pre("validate", function () {
  if (this.role === "doctor" && this.workingHours) {
    const days = this.workingHours.map((d) => d.day);
    const uniqueDays = new Set(days);

    if (days.length !== uniqueDays.size) {
      return new Error("Duplicate days are not allowed");
    }
  }
});

userSchema.pre("save", function () {
  if (this.role === "doctor" && (!this.workingHours || this.workingHours.length === 0)) {
    this.workingHours = DEFAULT_WORKING_HOURS;
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
