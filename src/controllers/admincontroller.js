import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import doctorService from '../services/doctor.service.js';

export const login = async (req, res, next) => {
  try {
    const { role, email, password } = req.body;

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      role: { $regex: new RegExp(`^${role}$`, 'i') },
    });

    if (!user) {
      const error = new Error("Invalid role or email");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      return next(error);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorWorkingHours = async (req, res, next) => {
    try {

        if (req.user.role !== 'admin') {
            const error = new Error("Access denied");
            error.statusCode = 403;
            return next(error);
        }

        const result = await doctorService.updateWorkingHours(
            req.params.id,
            req.body.workingHours
        );

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};