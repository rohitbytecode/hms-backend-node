import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists",
        });
      }

      if (user.status === 'Inactive') {
        return res.status(401).json({
          success: false,
          message: "User account is inactive",
        });
      }

      req.user = {
        id: user._id,
        role: String(user.role || '').trim().toLowerCase(),
        email: user.email,
      };

      return next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Token has expired"
            : "Invalid token",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authorized, no token",
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    const normalizedAllowed = allowedRoles.map((r) => String(r || '').trim().toLowerCase());

    if (!req.user || !normalizedAllowed.includes(String(req.user.role || '').trim().toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};