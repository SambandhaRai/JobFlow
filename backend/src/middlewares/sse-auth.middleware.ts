import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UserRoleType } from "../types/user.type";

interface JwtPayload {
    id: string;
    email: string;
    role: UserRoleType;
}

export const sseAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const headerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : undefined;
        const token = (req.query.token as string | undefined) || headerToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Authorization token missing" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error: any) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        return res.status(500).json({ success: false, message: "Authentication failed" });
    }
};
