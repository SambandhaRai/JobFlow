/**
 * Seeds historical applications for the requested test user using jobs created
 * by seed-fresh-jobs.ts.
 *
 * Run: npm run seed:applications
 */
import mongoose from "mongoose";
import { MONGODB_URI } from "../config";
import { ApplicationModel } from "../models/application.model";
import { JobModel } from "../models/job.model";
import { UserModel } from "../models/user.model";
import { ApplicationStatusType } from "../types/application.type";

const USER_EMAIL = "sambandharai30@gmail.com";
const JOB_SEED_TAG = "jobflow-fresh-jobs-seed";

const applicationSeeds: Array<{
    title: string;
    status: ApplicationStatusType;
    daysAgo: number;
    updatedDaysAgo: number;
    note: string;
}> = [
    {
        title: "Junior Frontend Developer",
        status: "shortlisted",
        daysAgo: 18,
        updatedDaysAgo: 6,
        note: "I am excited to contribute my React and TypeScript experience to the Cloudmandu product team.",
    },
    {
        title: "QA Testing Intern",
        status: "viewed_by_employer",
        daysAgo: 13,
        updatedDaysAgo: 9,
        note: "I enjoy finding edge cases and documenting issues clearly, and I would love to grow with the QA team.",
    },
    {
        title: "Graphic Design Intern",
        status: "submitted",
        daysAgo: 8,
        updatedDaysAgo: 8,
        note: "I am interested in bringing my visual design skills and willingness to learn to this internship.",
    },
    {
        title: "Content Writing Intern",
        status: "interview_scheduled",
        daysAgo: 4,
        updatedDaysAgo: 2,
        note: "I would be glad to contribute clear, engaging content while learning from the editorial team.",
    },
];

const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

async function seedUserApplications() {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    console.log("Database connected.");

    const user = await UserModel.findOne({ email: USER_EMAIL }).lean();
    if (!user) {
        throw new Error(`No user found with email "${USER_EMAIL}".`);
    }

    if (user.role !== "user") {
        throw new Error(`"${USER_EMAIL}" is not a job-seeker account.`);
    }

    const jobTitles = applicationSeeds.map(({ title }) => title);
    const jobs = await JobModel.find({
        seedTag: JOB_SEED_TAG,
        title: { $in: jobTitles },
    }).lean();
    const jobsByTitle = new Map(jobs.map((job) => [job.title, job]));

    const userWithProfile = user as typeof user & {
        resumes?: Array<{ fileUrl: string; isDefault?: boolean }>;
    };
    const resume =
        userWithProfile.resumes?.find((item) => item.isDefault) ??
        userWithProfile.resumes?.[0];
    const resumeUrl = resume?.fileUrl ?? "/uploads/sample-resume.pdf";
    const phone = user.phone && user.phone.length >= 10 ? user.phone : "9800000000";

    let created = 0;
    let updated = 0;

    for (const seed of applicationSeeds) {
        const job = jobsByTitle.get(seed.title);
        if (!job) {
            console.warn(`Skipped "${seed.title}" because its seeded job was not found.`);
            continue;
        }

        const existing = await ApplicationModel.exists({
            userId: user._id,
            jobId: job._id,
        });
        const appliedAt = daysAgo(seed.daysAgo);
        const updatedAt = daysAgo(seed.updatedDaysAgo);

        await ApplicationModel.updateOne(
            { userId: user._id, jobId: job._id },
            {
                $set: {
                    postedByUserId: job.postedByUserId,
                    companyId: job.companyId,
                    resumeUrl,
                    fullName: user.fullName,
                    email: user.email,
                    phone,
                    applicationNote: seed.note,
                    status: seed.status,
                    appliedAt,
                    updatedAt,
                },
                $setOnInsert: {
                    userId: user._id,
                    jobId: job._id,
                    createdAt: appliedAt,
                },
            },
            { upsert: true, timestamps: false },
        );

        if (existing) updated += 1;
        else created += 1;
    }

    console.log(`Applications created: ${created}`);
    console.log(`Applications refreshed: ${updated}`);
    console.log(`Seeded applications for: ${USER_EMAIL}`);
}

seedUserApplications()
    .catch((error) => {
        console.error("Failed to seed user applications:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
