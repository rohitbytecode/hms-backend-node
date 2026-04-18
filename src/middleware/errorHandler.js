export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    statusCode = 400;
    if (err.keyPattern?.email) message = "Email already exists";
    else if (err.keyPattern?.phno) message = "Phone number already exists";
    else message = "Duplicate entry detected";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
