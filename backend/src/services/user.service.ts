import { AdminUpdateUserDto, CreateUserDto, ForgotPasswordDto, LoginUserDto, ResetPasswordDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { IJobSeeker, IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import { FRONTEND_URL, JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import { ResumeType, UserRoleType } from "../types/user.type";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { uploadDir } from "../middlewares/upload.middleware";

let userRepository = new UserRepository();

export class UserService {

    private ensureJobSeeker(user: IUser, action: string): asserts user is IJobSeeker {
        if (user.role !== "user") {
            throw new HttpError(403, `Only job seekers can ${action}`);
        }
    }

    private createAuthToken(user: IUser) {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
        };

        return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    }

    async registerUser(data: CreateUserDto) {
        const requestedRole = data.role as UserRoleType;
        if (requestedRole === "admin") {
            throw new HttpError(403, "Cannot self-register as admin");
        }

        const existingEmail = await userRepository.getUserByEmail(data.email);
        if (existingEmail) {
            throw new HttpError(403, "Email is already in use");
        }

        if (data.phone) {
            const existingPhone = await userRepository.getUserByPhone(data.phone);
            if (existingPhone) {
                throw new HttpError(403, "Phone number is already in use");
            }
        }

        const { confirmPassword, ...userData } = data;
        const hashedPassword = await bcryptjs.hash(userData.password, 10);

        const newUser = await userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });

        const token = this.createAuthToken(newUser);

        return { token, user: newUser };
    }

    async loginUser(data: LoginUserDto) {
        const existingUser = await userRepository.getUserByEmail(data.email);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        const isPasswordMatch = await bcryptjs.compare(data.password, existingUser.password);
        if (!isPasswordMatch) {
            throw new HttpError(401, "Invalid credentials");
        }

        const token = this.createAuthToken(existingUser);

        return { token, user: existingUser };
    }

    private brandedEmailHtml(kicker: string, title: string, body: string) {
        const font = "Helvetica, Arial, sans-serif";
        return `
        <body style="margin:0; padding:0; background-color:#f5f7fa;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;">
                <tr>
                    <td align="center" style="padding:40px 16px;">
                        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:100%; background-color:#ffffff; border:1px solid #e5e8ec; border-radius:12px;">
                            <tr>
                                <td style="padding:24px 40px; border-bottom:1px solid #e5e8ec;">
                                    <span style="font-family:${font}; font-size:18px; font-weight:700; letter-spacing:1px; color:#2E5BFF;">JobFlow</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:40px;">
                                    <p style="margin:0 0 8px 0; font-family:${font}; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#6B7280;">${kicker}</p>
                                    <h1 style="margin:0 0 16px 0; font-family:${font}; font-size:24px; font-weight:700; color:#0E1116;">${title}</h1>
                                    ${body}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:20px 40px; border-top:1px solid #e5e8ec;">
                                    <p style="margin:0; font-family:${font}; font-size:12px; color:#8A92A0;">&copy; JobFlow Nepal</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        `;
    }

    private resetPasswordEmailHtml(resetLink: string) {
        const font = "Helvetica, Arial, sans-serif";
        const body = `
            <p style="margin:0 0 28px 0; font-family:${font}; font-size:15px; line-height:1.6; color:#4A5160;">
                We received a request to reset your JobFlow password. Click the button below to choose a new one.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center">
                        <a href="${resetLink}" style="font-family:${font}; font-size:15px; font-weight:700; color:#ffffff; background-color:#2E5BFF; text-decoration:none; padding:14px 32px; display:inline-block; border-radius:8px;">Reset password</a>
                    </td>
                </tr>
            </table>
            <p style="margin:28px 0 0 0; font-family:${font}; font-size:13px; line-height:1.6; color:#8A92A0;">
                Didn't request this? You can safely ignore this email — your password will stay the same.
            </p>
        `;
        return this.brandedEmailHtml("Password reset", "Reset your password", body);
    }

    async requestPasswordReset(data: ForgotPasswordDto) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "No account found with that email");
        }

        const resetLink = `${FRONTEND_URL}/reset-password?email=${encodeURIComponent(user.email)}`;
        await sendEmail(
            user.email,
            "Reset your JobFlow password",
            this.resetPasswordEmailHtml(resetLink),
            `We received a request to reset your JobFlow password. Open this link to choose a new one: ${resetLink}. If you didn't request this, you can ignore this email.`,
        );

        return true;
    }

    async resetPassword(data: ResetPasswordDto) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "No account found with that email");
        }

        const newHash = await bcryptjs.hash(data.password, 10);
        await userRepository.updatePassword(user._id.toString(), newHash);

        return true;
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(userId: string, data: UpdateUserDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (
            data.skills !== undefined ||
            data.educations !== undefined ||
            data.experiences !== undefined
        ) {
            this.ensureJobSeeker(user, "update job seeker profile details");
        }

        const updatedUser = await userRepository.updateOneUser(userId, data);
        return updatedUser;
    }

    async getAllUsers({ page, size, search, role }: { page: number, size: number, search?: string, role?: UserRoleType }) {
        return await userRepository.getAllUsers({ page, size, search, role });
    }

    async deleteUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return await userRepository.deleteOneUser(userId);
    }

    async adminUpdateUser(userId: string, data: AdminUpdateUserDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return await userRepository.updateOneUser(userId, data);
    }

    async uploadProfilePicture(userId: string, file?: Express.Multer.File) {
        if (!file) {
            throw new HttpError(400, "Please upload a file");
        }

        const fileName = file.filename;

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const oldFileName = user.profilePicture;
        if (oldFileName) {
            const oldFilePath = path.join(uploadDir, oldFileName);
            if (fs.existsSync(oldFilePath)) {
                await fs.promises.unlink(oldFilePath);
            }
        }

        const updated = await userRepository.uploadProfilePicture(userId, fileName);
        if (!updated) {
            throw new HttpError(404, "User not found");
        }

        return updated;
    }


    async addResume(userId: string, resume: Partial<ResumeType>) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(user, "add resumes");

        if (user.resumes.length === 0) {
            resume.isDefault = true;
        }

        return await userRepository.addResume(userId, resume);
    }

    async removeResume(userId: string, resumeId: string) {
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            throw new HttpError(400, "Invalid resume ID");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(user, "remove resumes");

        const target = user.resumes.find(r => r._id.toString() === resumeId);
        if (!target) {
            throw new HttpError(404, "Resume not found");
        }

        const updatedUser = await userRepository.removeResume(userId, resumeId);

        if (target.isDefault && updatedUser && updatedUser.resumes.length > 0) {
            const newDefaultId = updatedUser.resumes[0]._id.toString();
            return await userRepository.setDefaultResume(userId, newDefaultId);
        }

        return updatedUser;
    }

    async setDefaultResume(userId: string, resumeId: string) {
        if (!mongoose.Types.ObjectId.isValid(resumeId)) {
            throw new HttpError(400, "Invalid resume ID");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(user, "set default resumes");

        const exists = user.resumes.some(r => r._id.toString() === resumeId);
        if (!exists) {
            throw new HttpError(404, "Resume not found");
        }

        return await userRepository.setDefaultResume(userId, resumeId);
    }


    async saveJob(userId: string, jobId: string) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(user, "save jobs");

        const updatedUser = await userRepository.addSavedJob(userId, jobId);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    async unsaveJob(userId: string, jobId: string) {
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            throw new HttpError(400, "Invalid job ID");
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(user, "unsave jobs");

        const updatedUser = await userRepository.removeSavedJob(userId, jobId);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    async getSavedJobs(userId: string) {
        const existingUser = await userRepository.getUserById(userId);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }
        this.ensureJobSeeker(existingUser, "view saved jobs");

        const user = await userRepository.getSavedJobs(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user.savedJobs;
    }
}
