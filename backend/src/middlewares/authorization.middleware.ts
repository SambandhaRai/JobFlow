import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors/http-error";
import { UserRoleType } from "../types/user.type";

interface JwtPayload {
    id: string;
    email: string;
    role: UserRoleType;
}

export const authorizedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new HttpError(401, "Authorization token missing or malformed");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new HttpError(401, "Authorization token missing");
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error: any) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Authentication failed",
        });
    }
};