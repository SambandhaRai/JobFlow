import mongoose, { QueryFilter } from "mongoose";
import { AdminModel, EmployerModel, IEmployer, IJobSeeker, IUser, JobSeekerModel, UserModel } from "../models/user.model";
import { JobSeekerType, ResumeType, UserRoleType, UserType } from "../types/user.type";

type CreateUserData = Partial<UserType> & {
    role?: UserRoleType;
    skills?: string[];
    resumes?: Partial<ResumeType>[];
    savedJobs?: mongoose.Types.ObjectId[];
    companyName?: string;
    companyWebsite?: string;
};

type UpdateUserData = Partial<Pick<UserType, "fullName" | "phone">> & {
    educations?: JobSeekerType["educations"];
    skills?: string[];
};

export interface IUserRepository {
    createUser(data: CreateUserData): Promise<IUser>;
    getAllUsers({ page, size, search, role }: { page: number, size: number, search?: string, role?: UserRoleType }): Promise<{ users: IUser[], totalUsers: number }>;
    getUserById(id: string): Promise<IUser | null>;
    getEmployerById(id: string): Promise<IEmployer | null>;
    updateOneUser(id: string, data: UpdateUserData): Promise<IUser | null>;
    deleteOneUser(id: string): Promise<boolean | null>;

    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByPhone(phone: string): Promise<IUser | null>;

    addResume(userId: string, resume: Partial<ResumeType>): Promise<IJobSeeker | null>;
    removeResume(userId: string, resumeId: string): Promise<IJobSeeker | null>;
    setDefaultResume(userId: string, resumeId: string): Promise<IJobSeeker | null>;

    addSavedJob(userId: string, jobId: string): Promise<IJobSeeker | null>;
    removeSavedJob(userId: string, jobId: string): Promise<IJobSeeker | null>;
    getSavedJobs(userId: string): Promise<IJobSeeker | null>;
}

export class UserRepository implements IUserRepository {

    async createUser(data: CreateUserData): Promise<IUser> {
        if (data.role === "employer") {
            return await EmployerModel.create({ ...data, role: "employer" });
        }
        if (data.role === "admin") {
            return await AdminModel.create({ ...data, role: "admin" });
        }
        return await JobSeekerModel.create({ ...data, role: "user" });
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
                { "educations.institutionName": { $regex: search, $options: "i" } },
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

    async getEmployerById(id: string): Promise<IEmployer | null> {
        const employer = await EmployerModel.findById(id);
        return employer;
    }

    async updateOneUser(id: string, data: UpdateUserData): Promise<IUser | null> {
        if (
            data.skills !== undefined ||
            data.educations !== undefined
        ) {
            return await JobSeekerModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
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

    async addResume(userId: string, resume: Partial<ResumeType>): Promise<IJobSeeker | null> {
        return await JobSeekerModel.findByIdAndUpdate(
            userId,
            { $push: { resumes: resume } },
            { returnDocument: "after" }
        );
    }

    async removeResume(userId: string, resumeId: string): Promise<IJobSeeker | null> {
        return await JobSeekerModel.findByIdAndUpdate(
            userId,
            { $pull: { resumes: { _id: new mongoose.Types.ObjectId(resumeId) } } },
            { returnDocument: "after" }
        );
    }

    async setDefaultResume(userId: string, resumeId: string): Promise<IJobSeeker | null> {
        // Unset isDefault on all resumes for this user
        await JobSeekerModel.updateOne(
            { _id: userId },
            { $set: { "resumes.$[].isDefault": false } }
        );
        // Set the chosen resume as default
        return await JobSeekerModel.findOneAndUpdate(
            { _id: userId, "resumes._id": new mongoose.Types.ObjectId(resumeId) },
            { $set: { "resumes.$.isDefault": true } },
            { returnDocument: "after" }
        );
    }

    async addSavedJob(userId: string, jobId: string): Promise<IJobSeeker | null> {
        return await JobSeekerModel.findByIdAndUpdate(
            userId,
            { $addToSet: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
            { returnDocument: "after" }
        );
    }

    async removeSavedJob(userId: string, jobId: string): Promise<IJobSeeker | null> {
        return await JobSeekerModel.findByIdAndUpdate(
            userId,
            { $pull: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
            { returnDocument: "after" }
        );
    }

    async getSavedJobs(userId: string): Promise<IJobSeeker | null> {
        return await JobSeekerModel.findById(userId).populate("savedJobs");
    }

}
