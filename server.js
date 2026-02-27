import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { start } from 'repl';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async() => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    await connectDB();
    console.log("DB connected successfully");

    server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch(error) {
    console.error("Startup error: ", error.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection: ", err);
  shutdownGracefully();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  shutdownGracefully();
});

const shutdownGracefully = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed grecefully");
      process.exit(1);
    });
  }
  else {
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  shutdownGracefully();
});

process.on("SIGINT", () => {
  console.log("SIGINT reveiced. Shutting down...");
  shutdownGracefully();
});

