import Billing from "../models/billing.js";
import Appointment from "../models/appointment.js";

export const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const match = { status: "paid" };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await Billing.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: result[0] || { totalRevenue: 0, totalTransactions: 0 }
    });

  } catch (error) {
    next(error);
  }
};

export const getAppointmentReport = async (req, res, next) => {
  try {
    const { status, doctorId, startDate, endDate } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalAppointments = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        totalAppointments
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getDoctorSummary = async (req, res, next) => {
  try {
    const doctorId = req.user.id

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const [
      completedAppointments,
      todaysAppointments,
      upcomingAppointments,
      allAppointments
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, date: { $gte: startOfToday, $lte: endOfToday } }),
      Appointment.countDocuments({ doctor: doctorId, status: 'scheduled', date: { $gt: endOfToday } }),
      Appointment.find({ doctor: doctorId }, 'patient').lean()
    ])

    const uniquePatients = new Set(allAppointments.map((a) => String(a.patient))).size

    res.status(200).json({
      success: true,
      data: {
        uniquePatients,
        todaysAppointments,
        upcomingAppointments,
        completedAppointments
      }
    })
  } catch (error) {
    next(error)
  }
}