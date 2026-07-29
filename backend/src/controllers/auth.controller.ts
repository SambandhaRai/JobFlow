import { CreateUserDto, ForgotPasswordDto, GoogleCallbackDto, LoginUserDto, ResetPasswordDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { GoogleService } from "../services/google.service";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();
let googleService = new GoogleService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.registerUser(parsedData.data);
            return res.status(201).json({
                success: true,
                data: user,
                token,
                message: "User registered successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            const { token, user } = await userService.loginUser(parsedData.data);
            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async googleStart(req: Request, res: Response) {
        try {
            if (!googleService.isConfigured()) {
                return res.status(503).json({
                    success: false,
                    message: "Google sign-in is not configured on this server"
                });
            }
            const state = googleService.createStateToken();
            return res.status(200).json({
                success: true,
                data: {
                    url: googleService.getAuthUrl(state),
                    state
                },
                message: "Google sign-in started"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async googleCallback(req: Request, res: Response) {
        try {
            if (!googleService.isConfigured()) {
                return res.status(503).json({
                    success: false,
                    message: "Google sign-in is not configured on this server"
                });
            }

            const parsedData = GoogleCallbackDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }

            const { code, state, stateCookie } = parsedData.data;

            if (state !== stateCookie) {
                return res.status(400).json({
                    success: false,
                    message: "Google sign-in could not be verified, please try again"
                });
            }

            googleService.verifyStateToken(stateCookie);

            const identity = await googleService.exchangeCode(code);
            const { token, user } = await userService.loginWithGoogle(identity);

            return res.status(200).json({
                success: true,
                data: user,
                token,
                message: "Login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const parsedData = ForgotPasswordDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            await userService.requestPasswordReset(parsedData.data);
            return res.status(200).json({
                success: true,
                message: "A reset link has been sent to your email"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const parsedData = ResetPasswordDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    errors: z.prettifyError(parsedData.error)
                });
            }
            await userService.resetPassword(parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Password reset successfully"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}
