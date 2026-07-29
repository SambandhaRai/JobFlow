import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5051;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/jobflow_database";
export const JWT_SECRET: string = process.env.JWT_SECRET || "default_secret";
export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";

export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_CALLBACK_URL: string =
    process.env.GOOGLE_CALLBACK_URL || `${FRONTEND_URL}/api/auth/google/callback`;