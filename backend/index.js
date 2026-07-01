import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import http from "http";

import routes from "./routes/index.js";
import { initializeSocket } from "./socket/socket-server.js";
import { startRiskCron } from "./jobs/riskCron.js";

dotenv.config();

console.log("MONGODB_URI =", process.env.MONGODB_URI);
console.log("FRONTEND_URL =", process.env.FRONTEND_URL);
console.log("PORT =", process.env.PORT);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to WebPM API",
  });
});

app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'uploads/avatars')));
// http:localhost:5000/api-v1/
app.use("/api-v1", routes);

// error middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const server = http.createServer(app);

// attach Socket.IO to the same server — this is the line that was missing
initializeSocket(server);
startRiskCron();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

