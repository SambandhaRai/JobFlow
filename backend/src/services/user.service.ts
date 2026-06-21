import { AdminUpdateUserDto, CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { IJobSeeker, IUser } from "../models/user.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
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
            data.educations !== undefined
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
