import mongoose, { QueryFilter } from "mongoose";
import { IUser, UserModel } from "../models/user.model";
import { ResumeType, UserRoleType } from "../types/user.type";

export interface IUserRepository {
    createUser(data: Partial<IUser>): Promise<IUser>;
    getAllUsers({ page, size, search, role }: { page: number, size: number, search?: string, role?: UserRoleType }): Promise<{ users: IUser[], totalUsers: number }>;
    getUserById(id: string): Promise<IUser | null>;
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteOneUser(id: string): Promise<boolean | null>;

    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;

    addResume(userId: string, resume: Partial<ResumeType>): Promise<IUser | null>;
    removeResume(userId: string, resumeId: string): Promise<IUser | null>;
    setDefaultResume(userId: string, resumeId: string): Promise<IUser | null>;

    addSavedJob(userId: string, jobId: string): Promise<IUser | null>;
    removeSavedJob(userId: string, jobId: string): Promise<IUser | null>;
    getSavedJobs(userId: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {

    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data);
        return await user.save();
    }

    async getAllUsers({ page, size, search, role }: { page: number, size: number, search?: string, role?: UserRoleType }): Promise<{ users: IUser[], totalUsers: number }> {
        let filter: QueryFilter<IUser> = {};
        if (role) {
            filter.role = role;
        }
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { skills: { $regex: search, $options: "i" } },
            ];
        }
        const [users, totalUsers] = await Promise.all([
            UserModel.find(filter)
                .skip((page - 1) * size)
                .limit(size),
            UserModel.countDocuments(filter)
        ]);
        return { users, totalUsers };
    }

    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }

    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }

    async deleteOneUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ email });
        return user;
    }

    async getUserByPhone(phone: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ phone });
        return user;
    }

    async addResume(userId: string, resume: Partial<ResumeType>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $push: { resumes: resume } },
            { new: true }
        );
    }

    async removeResume(userId: string, resumeId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { resumes: { _id: new mongoose.Types.ObjectId(resumeId) } } },
            { new: true }
        );
    }

    async setDefaultResume(userId: string, resumeId: string): Promise<IUser | null> {
        // Unset isDefault on all resumes for this user
        await UserModel.updateOne(
            { _id: userId },
            { $set: { "resumes.$[].isDefault": false } }
        );
        // Set the chosen resume as default
        return await UserModel.findOneAndUpdate(
            { _id: userId, "resumes._id": new mongoose.Types.ObjectId(resumeId) },
            { $set: { "resumes.$.isDefault": true } },
            { new: true }
        );
    }

    async addSavedJob(userId: string, jobId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $addToSet: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
            { new: true }
        );
    }

    async removeSavedJob(userId: string, jobId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
            { new: true }
        );
    }

    async getSavedJobs(userId: string): Promise<IUser | null> {
        return await UserModel.findById(userId).populate("savedJobs");
    }

}