import express from "express";
import userRoute from "./routes/userRoute.js";
import jobRoute from "./routes/jobsRoute.js";
import referralRoute from "./routes/referralRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
const corsOption = {
  origin: ["*", "http://localhost:3000", " http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoute);
app.use("/api", jobRoute);
app.use("/api", referralRoute);

export default app;
