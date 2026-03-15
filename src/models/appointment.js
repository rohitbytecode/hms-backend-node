import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    dept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    rsv: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true, strict: true }
);

appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Appointment', appointmentSchema);
