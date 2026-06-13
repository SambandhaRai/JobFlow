import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import path from "path";

dotenv.config();
console.log(process.env.PORT);

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import institutionRoutes from "./routes/institution.routes";
import companyRoutes from "./routes/company.routes";
import reportRoutes from "./routes/report.routes";
import notificationRoutes from "./routes/notification.routes";

const app: Application = express();

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.101.8:3000",
    "http://10.1.19.83:3000"
].filter(Boolean);

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        const isLocalNetwork = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/.test(origin);

        if (allowedOrigins.includes(origin) || isLocalNetwork) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
