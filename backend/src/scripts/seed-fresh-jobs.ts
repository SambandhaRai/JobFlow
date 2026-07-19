/**
 * Seeds a fresh batch of job listings onto the companies and employers that
 * already exist in the database. Nothing is created or deleted here: companies
 * are looked up by slug and each job is posted by that company's owner.
 *
 * Deadlines are computed relative to run time, so re-running this script also
 * refreshes them if the previous batch has expired.
 *
 * Run:  npm run seed:jobs
 */
import mongoose from "mongoose";
import { MONGODB_URI } from "../config";
import { CompanyModel } from "../models/company.model";
import { JobModel } from "../models/job.model";
import {
    ExperienceLevelType,
    JobCategoryType,
    JobTypeEnumType,
    WorkModeType,
} from "../types/job.type";

const SEED_TAG = "jobflow-fresh-jobs-seed";

const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

type SeedJob = {
    companySlug: string;
    title: string;
    jobType: JobTypeEnumType;
    workMode: WorkModeType;
    experienceLevel: ExperienceLevelType;
    category: JobCategoryType;
    salary: { min: number; max: number; currency: string };
    duration?: string;
    skills: string[];
    description: string;
    responsibilities: string[];
    requirements: string[];
    isBeginnerFriendly: boolean;
    /** Days until applications close. Always in the future. */
    deadlineDays: number;
    /** Days since the listing went up, for a realistic "posted Xd ago". */
    postedDaysAgo: number;
};

const jobs: SeedJob[] = [
    {
        companySlug: "cloudmandu-technologies",
        title: "Junior Frontend Developer",
        jobType: "full-time",
        workMode: "hybrid",
        experienceLevel: "junior",
        category: "IT & Software",
        salary: { min: 45000, max: 65000, currency: "NPR" },
        skills: ["React", "TypeScript", "CSS", "Git"],
        description:
            "Join the Cloudmandu product team building dashboards used by logistics companies across Nepal. You will work alongside senior engineers on features that ship weekly, with code review and pairing built into the process.",
        responsibilities: [
            "Build and maintain React components against agreed designs",
            "Fix bugs reported by the support team and reproduce them with tests",
            "Take part in code review and weekly sprint planning",
        ],
        requirements: [
            "Comfortable with JavaScript fundamentals and at least one framework",
            "Some exposure to Git-based team workflows",
            "Willing to work from the Kathmandu office three days a week",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 28,
        postedDaysAgo: 2,
    },
    {
        companySlug: "cloudmandu-technologies",
        title: "QA Testing Intern",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "IT & Software",
        salary: { min: 12000, max: 18000, currency: "NPR" },
        duration: "4 months",
        skills: ["Attention to detail", "Test cases", "Documentation"],
        description:
            "A starting point for students who want to get into software quality. You will learn how release testing works on a real product and write the test cases that protect each deployment.",
        responsibilities: [
            "Run through manual test checklists before each release",
            "Write clear, reproducible bug reports",
            "Help maintain the regression test spreadsheet",
        ],
        requirements: [
            "Currently studying IT, computing or a related subject",
            "Careful and methodical when following steps",
            "Available at least 4 days a week",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 21,
        postedDaysAgo: 5,
    },
    {
        companySlug: "pixel-pasal-studio",
        title: "Graphic Design Intern",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Design & Creative",
        salary: { min: 10000, max: 16000, currency: "NPR" },
        duration: "6 months",
        skills: ["Figma", "Adobe Illustrator", "Typography"],
        description:
            "Work with the Pixel Pasal team on branding and social campaigns for Nepali businesses. You will get direct feedback on your work from senior designers every week.",
        responsibilities: [
            "Produce social media assets from existing brand kits",
            "Support senior designers on client presentations",
            "Keep the studio asset library organised",
        ],
        requirements: [
            "A portfolio of any kind, including coursework",
            "Working knowledge of Figma or the Adobe suite",
            "Open to feedback and revisions",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 34,
        postedDaysAgo: 1,
    },
    {
        companySlug: "pixel-pasal-studio",
        title: "Motion Graphics Designer",
        jobType: "part-time",
        workMode: "remote",
        experienceLevel: "entry-level",
        category: "Design & Creative",
        salary: { min: 25000, max: 40000, currency: "NPR" },
        skills: ["After Effects", "Animation", "Storyboarding"],
        description:
            "Produce short animated pieces for client campaigns, mostly 15 to 30 second social cuts. Remote and flexible, with a weekly check-in call.",
        responsibilities: [
            "Animate supplied designs into short promotional clips",
            "Storyboard concepts before production",
            "Deliver files in the formats each platform needs",
        ],
        requirements: [
            "Showreel demonstrating motion work",
            "Confident in After Effects or equivalent",
            "Reliable internet for remote collaboration",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 19,
        postedDaysAgo: 6,
    },
    {
        companySlug: "sajilo-accounts",
        title: "Accounts Assistant",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Finance & Accounting",
        salary: { min: 30000, max: 42000, currency: "NPR" },
        skills: ["Bookkeeping", "Excel", "Attention to detail"],
        description:
            "Support the bookkeeping team handling accounts for small and medium businesses in the Kathmandu valley. Training on our internal systems is provided in the first month.",
        responsibilities: [
            "Enter and reconcile daily transactions",
            "Prepare supporting documents for monthly filings",
            "Coordinate with clients on missing paperwork",
        ],
        requirements: [
            "Bachelor's in accounting, management or similar",
            "Solid spreadsheet skills",
            "Accurate with numbers under deadline",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 25,
        postedDaysAgo: 3,
    },
    {
        companySlug: "sajilo-accounts",
        title: "Data Entry Assistant",
        jobType: "part-time",
        workMode: "hybrid",
        experienceLevel: "no-experience",
        category: "Business & Administration",
        salary: { min: 14000, max: 20000, currency: "NPR" },
        skills: ["Typing", "Excel", "Accuracy"],
        description:
            "A flexible part-time role suited to students. You will digitise client records and keep our ledgers tidy, with hours that fit around class schedules.",
        responsibilities: [
            "Digitise paper records into the accounting system",
            "Cross-check entries against source documents",
            "Flag inconsistencies to the accounts team",
        ],
        requirements: [
            "Comfortable typing for extended periods",
            "Basic Excel knowledge",
            "Available for at least 20 hours a week",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 16,
        postedDaysAgo: 4,
    },
    {
        companySlug: "learnmandu-academy",
        title: "Mathematics Tutor",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Education & Tutoring",
        salary: { min: 20000, max: 32000, currency: "NPR" },
        skills: ["Teaching", "Mathematics", "Communication"],
        description:
            "Teach secondary level mathematics in small groups of six to ten students. Lesson plans and materials are provided; you bring the explanation.",
        responsibilities: [
            "Run scheduled tutoring sessions for SEE-level students",
            "Mark practice papers and give written feedback",
            "Track and report each student's progress",
        ],
        requirements: [
            "Strong grasp of secondary school mathematics",
            "Patient and clear when explaining concepts",
            "Available on weekday evenings",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 30,
        postedDaysAgo: 2,
    },
    {
        companySlug: "learnmandu-academy",
        title: "Content Writing Intern",
        jobType: "internship",
        workMode: "remote",
        experienceLevel: "no-experience",
        category: "Writing & Content",
        salary: { min: 10000, max: 15000, currency: "NPR" },
        duration: "3 months",
        skills: ["Writing", "Research", "Editing"],
        description:
            "Write study notes and short explainer articles for the Learnmandu student portal. Fully remote, with editorial feedback on everything you submit.",
        responsibilities: [
            "Draft study guides on assigned syllabus topics",
            "Research and fact-check against curriculum material",
            "Revise drafts based on editor feedback",
        ],
        requirements: [
            "Clear written English and Nepali",
            "Able to explain concepts simply",
            "Two short writing samples",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 23,
        postedDaysAgo: 7,
    },
    {
        companySlug: "himalaya-trails-travel",
        title: "Travel Desk Coordinator",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Hospitality & Tourism",
        salary: { min: 28000, max: 38000, currency: "NPR" },
        skills: ["Customer service", "Itinerary planning", "English"],
        description:
            "Be the first point of contact for trekkers planning trips through Pokhara. You will handle enquiries, build itineraries and coordinate with guides.",
        responsibilities: [
            "Respond to booking enquiries by phone and email",
            "Prepare itineraries and cost breakdowns",
            "Coordinate guides, permits and transport",
        ],
        requirements: [
            "Confident spoken and written English",
            "Organised when juggling several bookings",
            "Based in or willing to relocate to Pokhara",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 27,
        postedDaysAgo: 3,
    },
    {
        companySlug: "himalaya-trails-travel",
        title: "Social Media Assistant",
        jobType: "part-time",
        workMode: "remote",
        experienceLevel: "no-experience",
        category: "Marketing & Social Media",
        salary: { min: 15000, max: 22000, currency: "NPR" },
        skills: ["Instagram", "Canva", "Copywriting"],
        description:
            "Help share trekking stories with a growing audience. You will schedule posts, write captions and reply to comments across our channels.",
        responsibilities: [
            "Schedule and publish posts across Instagram and Facebook",
            "Write short captions in English and Nepali",
            "Report on engagement each month",
        ],
        requirements: [
            "Active understanding of social platforms",
            "Basic Canva or similar design skills",
            "Around 15 hours a week",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 18,
        postedDaysAgo: 8,
    },
    {
        companySlug: "freshbasket-nepal",
        title: "Store Operations Trainee",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Retail & Store Jobs",
        salary: { min: 18000, max: 25000, currency: "NPR" },
        skills: ["Inventory", "Customer service", "Teamwork"],
        description:
            "A structured entry point into retail operations. You will rotate through stock, floor and checkout over six months and learn how the store runs end to end.",
        responsibilities: [
            "Support daily stock counts and restocking",
            "Assist customers on the shop floor",
            "Learn checkout and returns procedures",
        ],
        requirements: [
            "+2 completed or equivalent",
            "Comfortable on your feet during shifts",
            "Willing to work weekend rotations",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 20,
        postedDaysAgo: 4,
    },
    {
        companySlug: "freshbasket-nepal",
        title: "Delivery Operations Assistant",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Business & Administration",
        salary: { min: 16000, max: 24000, currency: "NPR" },
        skills: ["Route planning", "Coordination", "Record keeping"],
        description:
            "Keep last-mile deliveries running on time across Chitwan. You will assign routes, track riders and resolve delivery issues as they come up.",
        responsibilities: [
            "Plan and assign daily delivery routes",
            "Track deliveries and follow up on delays",
            "Maintain daily dispatch records",
        ],
        requirements: [
            "Organised and calm under time pressure",
            "Familiar with the Chitwan area",
            "Basic computer literacy",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 15,
        postedDaysAgo: 9,
    },
    {
        companySlug: "insight-nepal-research",
        title: "Field Survey Enumerator",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Data & Research",
        salary: { min: 15000, max: 23000, currency: "NPR" },
        duration: "5 months",
        skills: ["Survey tools", "Communication", "Data accuracy"],
        description:
            "Collect survey responses in the field for NGO and business research projects. Full training on our data collection tools is provided before deployment.",
        responsibilities: [
            "Conduct household and business surveys on assigned routes",
            "Record responses accurately using mobile survey tools",
            "Report daily progress to the field supervisor",
        ],
        requirements: [
            "Comfortable approaching and interviewing strangers",
            "Fluent in Nepali",
            "Able to travel within the Biratnagar area",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 32,
        postedDaysAgo: 1,
    },
    {
        companySlug: "insight-nepal-research",
        title: "Research Data Analyst",
        jobType: "full-time",
        workMode: "hybrid",
        experienceLevel: "junior",
        category: "Data & Research",
        salary: { min: 40000, max: 60000, currency: "NPR" },
        skills: ["Excel", "SPSS", "Data cleaning", "Reporting"],
        description:
            "Turn raw survey data into the tables and charts that go into client reports. You will own the cleaning and analysis for two or three concurrent studies.",
        responsibilities: [
            "Clean and validate incoming survey datasets",
            "Run descriptive analysis and build report tables",
            "Write short methodology notes for each study",
        ],
        requirements: [
            "Degree in statistics, economics or a related field",
            "Confident with Excel; SPSS, R or Python a plus",
            "Careful documentation habits",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 38,
        postedDaysAgo: 2,
    },
    {
        companySlug: "radio-kantipur-lite",
        title: "Radio Production Intern",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Media & Communication",
        salary: { min: 9000, max: 14000, currency: "NPR" },
        duration: "4 months",
        skills: ["Audio editing", "Scripting", "Research"],
        description:
            "Learn how a daily radio show comes together, from research through to broadcast. You will sit in on production meetings and edit segments for air.",
        responsibilities: [
            "Research topics and guests for upcoming shows",
            "Edit recorded segments to time",
            "Support the studio team during live broadcasts",
        ],
        requirements: [
            "Interest in media, journalism or communication",
            "Any audio editing experience is welcome but not required",
            "Available for early morning shifts",
        ],
        isBeginnerFriendly: true,
        deadlineDays: 22,
        postedDaysAgo: 5,
    },
    {
        companySlug: "radio-kantipur-lite",
        title: "News Content Writer",
        jobType: "part-time",
        workMode: "hybrid",
        experienceLevel: "entry-level",
        category: "Writing & Content",
        salary: { min: 18000, max: 28000, currency: "NPR" },
        skills: ["News writing", "Editing", "Nepali", "English"],
        description:
            "Write and adapt short news pieces for broadcast and our website. Suited to someone who can turn a story around quickly without losing accuracy.",
        responsibilities: [
            "Write daily news briefs for broadcast",
            "Adapt wire copy for a local audience",
            "Fact-check claims before publication",
        ],
        requirements: [
            "Strong writing in both Nepali and English",
            "Able to work to same-day deadlines",
            "Journalism coursework or equivalent experience",
        ],
        isBeginnerFriendly: false,
        deadlineDays: 26,
        postedDaysAgo: 6,
    },
];

async function seedFreshJobs() {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected.\n");

    let created = 0;
    let updated = 0;
    const skipped: string[] = [];

    for (const job of jobs) {
        // Reuse whatever is already in the database — never create a company.
        const company = await CompanyModel.findOne({ slug: job.companySlug });

        if (!company) {
            skipped.push(`${job.title} (no company with slug "${job.companySlug}")`);
            continue;
        }

        if (!company.ownerId) {
            skipped.push(`${job.title} (company "${company.name}" has no owner)`);
            continue;
        }

        const existing = await JobModel.findOne({
            seedTag: SEED_TAG,
            title: job.title,
            postedByUserId: company.ownerId,
        });

        await JobModel.findOneAndUpdate(
            { seedTag: SEED_TAG, title: job.title, postedByUserId: company.ownerId },
            {
                $set: {
                    postedByUserId: company.ownerId,
                    hiringType: "company",
                    companyId: company._id,
                    company: company.name,
                    hiringName: company.name,
                    hiringEmail: company.email,
                    hiringPhone: company.phone,
                    hiringWebsite: company.website,
                    hiringLocation: company.location,
                    isHiringVerified: Boolean(company.isVerified),
                    title: job.title,
                    location: company.location,
                    jobType: job.jobType,
                    workMode: job.workMode,
                    experienceLevel: job.experienceLevel,
                    category: job.category,
                    salary: job.salary,
                    duration: job.duration,
                    skills: job.skills,
                    description: job.description,
                    responsibilities: job.responsibilities,
                    requirements: job.requirements,
                    isVerified: Boolean(company.isVerified),
                    isBeginnerFriendly: job.isBeginnerFriendly,
                    deadline: daysFromNow(job.deadlineDays),
                    postedAt: daysAgo(job.postedDaysAgo),
                    seedTag: SEED_TAG,
                },
            },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
        );

        if (existing) updated += 1;
        else created += 1;
    }

    console.log(`Created: ${created}`);
    console.log(`Refreshed: ${updated}`);

    if (skipped.length) {
        console.log(`\nSkipped ${skipped.length}:`);
        skipped.forEach((entry) => console.log(`  - ${entry}`));
    }

    const now = new Date();
    const openTotal = await JobModel.countDocuments({
        $or: [
            { deadline: { $exists: false } },
            { deadline: null },
            { deadline: { $gte: now } },
        ],
    });
    console.log(`\nJobs currently open across the whole database: ${openTotal}`);

    await mongoose.disconnect();
    console.log("Done.");
}

seedFreshJobs().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
