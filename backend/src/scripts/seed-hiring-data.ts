import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

import { connectDatabase } from "../database/mongoose";
import { CompanyModel } from "../models/company.model";
import { JobModel } from "../models/job.model";
import { EmployerModel, UserModel } from "../models/user.model";

const SEED_TAG = "jobflow-hiring-seed";
const DEFAULT_PASSWORD = "Demo@1234";

type HiringType = "company" | "small-business" | "individual";
type JobType = "internship" | "full-time" | "part-time";
type WorkMode = "on-site" | "remote" | "hybrid";
type ExperienceLevel = "no-experience" | "entry-level" | "junior" | "mid-level" | "senior-level";
type JobCategory =
    | "IT & Software"
    | "Design & Creative"
    | "Marketing & Social Media"
    | "Writing & Content"
    | "Sales & Customer Service"
    | "Business & Administration"
    | "Finance & Accounting"
    | "Education & Tutoring"
    | "Hospitality & Tourism"
    | "Retail & Store Jobs"
    | "Data & Research"
    | "Media & Communication"
    | "Other";

type SeedEmployer = {
    fullName: string;
    email: string;
    phone: string;
};

type SeedCompany = {
    ownerEmail: string;
    name: string;
    slug: string;
    website: string;
    description: string;
    industry: string;
    location: string;
    email: string;
    phone: string;
    isVerified: boolean;
    contacts: Array<{
        name: string;
        email: string;
        phone: string;
        role: string;
    }>;
};

type SeedJob = {
    key: string;
    postedByEmail: string;
    hiringType: HiringType;
    companySlug?: string;
    hiringName: string;
    hiringEmail?: string;
    hiringPhone?: string;
    hiringWebsite?: string;
    hiringLocation?: string;
    isHiringVerified?: boolean;
    title: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceLevel: ExperienceLevel;
    category: JobCategory;
    salary?: { min: number; max: number; currency: string };
    duration?: string;
    skills: string[];
    description: string;
    responsibilities: string[];
    requirements: string[];
    isVerified: boolean;
    isBeginnerFriendly: boolean;
    deadlineDays: number;
};

const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const slugify = (value: string) => (
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
);

const employers: SeedEmployer[] = [
    { fullName: "Anisha Shrestha", email: "hr@cloudmandu.com.np", phone: "9801001101" },
    { fullName: "Pratik Manandhar", email: "careers@pixelpasal.com.np", phone: "9801001102" },
    { fullName: "Roshani Thapa", email: "talent@sajiloaccounts.com.np", phone: "9801001103" },
    { fullName: "Kiran Adhikari", email: "jobs@learnmandu.edu.np", phone: "9801001104" },
    { fullName: "Maya Gurung", email: "people@himalayatrails.com.np", phone: "9801001105" },
    { fullName: "Sagar Rai", email: "recruitment@freshbasket.com.np", phone: "9801001106" },
    { fullName: "Nisha Karki", email: "hr@insightnepal.org.np", phone: "9801001107" },
    { fullName: "Bibek Pandey", email: "careers@radiokantipur-lite.com.np", phone: "9801001108" },
    { fullName: "Pemba Lama", email: "hello@beanstreetcafe.com.np", phone: "9801001109" },
    { fullName: "Srijana Basnet", email: "contact@basnettutoring.com.np", phone: "9801001110" },
    { fullName: "Arjun Bista", email: "jobs@citymartktm.com.np", phone: "9801001111" },
    { fullName: "Milan Tamang", email: "milan.tamang@gmail.com", phone: "9801001112" },
];

const companies: SeedCompany[] = [
    {
        ownerEmail: "hr@cloudmandu.com.np",
        name: "Cloudmandu Technologies",
        slug: "cloudmandu-technologies",
        website: "https://cloudmandu.com.np",
        description: "Cloudmandu builds web, mobile, and cloud products for Nepali startups and regional businesses.",
        industry: "IT & Software",
        location: "Kathmandu",
        email: "hr@cloudmandu.com.np",
        phone: "01-4520101",
        isVerified: true,
        contacts: [{ name: "Anisha Shrestha", email: "hr@cloudmandu.com.np", phone: "9801001101", role: "HR Manager" }],
    },
    {
        ownerEmail: "careers@pixelpasal.com.np",
        name: "Pixel Pasal Studio",
        slug: "pixel-pasal-studio",
        website: "https://pixelpasal.com.np",
        description: "Pixel Pasal is a Lalitpur design studio working on brand, packaging, and digital campaigns.",
        industry: "Design & Creative",
        location: "Lalitpur",
        email: "careers@pixelpasal.com.np",
        phone: "01-5452102",
        isVerified: true,
        contacts: [{ name: "Pratik Manandhar", email: "careers@pixelpasal.com.np", phone: "9801001102", role: "Studio Lead" }],
    },
    {
        ownerEmail: "talent@sajiloaccounts.com.np",
        name: "Sajilo Accounts Pvt. Ltd.",
        slug: "sajilo-accounts",
        website: "https://sajiloaccounts.com.np",
        description: "Sajilo Accounts provides bookkeeping, tax, and payroll services to SMEs across Nepal.",
        industry: "Finance & Accounting",
        location: "Kathmandu",
        email: "talent@sajiloaccounts.com.np",
        phone: "01-4103103",
        isVerified: true,
        contacts: [{ name: "Roshani Thapa", email: "talent@sajiloaccounts.com.np", phone: "9801001103", role: "People Operations" }],
    },
    {
        ownerEmail: "jobs@learnmandu.edu.np",
        name: "Learnmandu Academy",
        slug: "learnmandu-academy",
        website: "https://learnmandu.edu.np",
        description: "Learnmandu Academy delivers online and classroom learning for SEE, +2, and bridge-course students.",
        industry: "Education & Tutoring",
        location: "Bhaktapur",
        email: "jobs@learnmandu.edu.np",
        phone: "01-6612104",
        isVerified: true,
        contacts: [{ name: "Kiran Adhikari", email: "jobs@learnmandu.edu.np", phone: "9801001104", role: "Academic Coordinator" }],
    },
    {
        ownerEmail: "people@himalayatrails.com.np",
        name: "Himalaya Trails Travel",
        slug: "himalaya-trails-travel",
        website: "https://himalayatrails.com.np",
        description: "Himalaya Trails Travel organizes trekking, cultural tours, and hospitality experiences around Nepal.",
        industry: "Hospitality & Tourism",
        location: "Pokhara",
        email: "people@himalayatrails.com.np",
        phone: "061-530105",
        isVerified: true,
        contacts: [{ name: "Maya Gurung", email: "people@himalayatrails.com.np", phone: "9801001105", role: "Operations Manager" }],
    },
    {
        ownerEmail: "recruitment@freshbasket.com.np",
        name: "FreshBasket Nepal",
        slug: "freshbasket-nepal",
        website: "https://freshbasket.com.np",
        description: "FreshBasket Nepal runs grocery retail and last-mile delivery operations in major cities.",
        industry: "Retail & Store Jobs",
        location: "Chitwan",
        email: "recruitment@freshbasket.com.np",
        phone: "056-520106",
        isVerified: true,
        contacts: [{ name: "Sagar Rai", email: "recruitment@freshbasket.com.np", phone: "9801001106", role: "Recruitment Lead" }],
    },
    {
        ownerEmail: "hr@insightnepal.org.np",
        name: "Insight Nepal Research",
        slug: "insight-nepal-research",
        website: "https://insightnepal.org.np",
        description: "Insight Nepal Research supports surveys, field studies, and data projects for NGOs and businesses.",
        industry: "Data & Research",
        location: "Biratnagar",
        email: "hr@insightnepal.org.np",
        phone: "021-520107",
        isVerified: true,
        contacts: [{ name: "Nisha Karki", email: "hr@insightnepal.org.np", phone: "9801001107", role: "Research Admin" }],
    },
    {
        ownerEmail: "careers@radiokantipur-lite.com.np",
        name: "Radio Kantipur Lite",
        slug: "radio-kantipur-lite",
        website: "https://radiokantipur-lite.com.np",
        description: "Radio Kantipur Lite is a local media and communication team producing radio and social-first stories.",
        industry: "Media & Communication",
        location: "Dharan",
        email: "careers@radiokantipur-lite.com.np",
        phone: "025-520108",
        isVerified: false,
        contacts: [{ name: "Bibek Pandey", email: "careers@radiokantipur-lite.com.np", phone: "9801001108", role: "Station Manager" }],
    },
];

const baseJobs: SeedJob[] = [
    {
        key: "cloudmandu-frontend-intern",
        postedByEmail: "hr@cloudmandu.com.np",
        hiringType: "company",
        companySlug: "cloudmandu-technologies",
        hiringName: "Cloudmandu Technologies",
        title: "Frontend Developer Intern",
        location: "Kathmandu",
        jobType: "internship",
        workMode: "hybrid",
        experienceLevel: "no-experience",
        category: "IT & Software",
        salary: { min: 12000, max: 18000, currency: "NPR" },
        duration: "3 months",
        skills: ["React", "TypeScript", "Tailwind CSS", "Git"],
        description: "Support the frontend team on dashboards and customer-facing web apps.",
        responsibilities: ["Build UI components", "Fix responsive layout issues", "Write basic component tests"],
        requirements: ["React basics", "Comfort with HTML/CSS", "Portfolio or class project preferred"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 25,
    },
    {
        key: "cloudmandu-backend-engineer",
        postedByEmail: "hr@cloudmandu.com.np",
        hiringType: "company",
        companySlug: "cloudmandu-technologies",
        hiringName: "Cloudmandu Technologies",
        title: "Backend Engineer",
        location: "Kathmandu",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "junior",
        category: "IT & Software",
        salary: { min: 45000, max: 75000, currency: "NPR" },
        skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
        description: "Develop and maintain backend services for SaaS products used by Nepali businesses.",
        responsibilities: ["Build APIs", "Optimize database queries", "Review pull requests"],
        requirements: ["1+ year backend experience", "Good Git workflow", "Understanding of API security"],
        isVerified: true,
        isBeginnerFriendly: false,
        deadlineDays: 35,
    },
    {
        key: "pixel-pasal-graphic-designer",
        postedByEmail: "careers@pixelpasal.com.np",
        hiringType: "company",
        companySlug: "pixel-pasal-studio",
        hiringName: "Pixel Pasal Studio",
        title: "Graphic Designer",
        location: "Lalitpur",
        jobType: "full-time",
        workMode: "hybrid",
        experienceLevel: "entry-level",
        category: "Design & Creative",
        salary: { min: 28000, max: 45000, currency: "NPR" },
        skills: ["Illustrator", "Photoshop", "Branding", "Typography"],
        description: "Create brand assets, campaign visuals, and social media graphics for studio clients.",
        responsibilities: ["Design campaign creatives", "Prepare print-ready files", "Work with account managers"],
        requirements: ["Design portfolio", "Adobe Creative Suite skills", "Strong visual sense"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 20,
    },
    {
        key: "pixel-pasal-content-writer",
        postedByEmail: "careers@pixelpasal.com.np",
        hiringType: "company",
        companySlug: "pixel-pasal-studio",
        hiringName: "Pixel Pasal Studio",
        title: "Content Writer",
        location: "Lalitpur",
        jobType: "part-time",
        workMode: "remote",
        experienceLevel: "entry-level",
        category: "Writing & Content",
        salary: { min: 18000, max: 30000, currency: "NPR" },
        skills: ["Copywriting", "SEO", "Nepali Writing", "English Writing"],
        description: "Write short-form and long-form content for brands in education, retail, and hospitality.",
        responsibilities: ["Draft captions and blogs", "Research topics", "Edit content from designers and clients"],
        requirements: ["Clear writing samples", "Good grammar", "Ability to follow brand voice"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 18,
    },
    {
        key: "sajilo-accounts-trainee",
        postedByEmail: "talent@sajiloaccounts.com.np",
        hiringType: "company",
        companySlug: "sajilo-accounts",
        hiringName: "Sajilo Accounts Pvt. Ltd.",
        title: "Finance Trainee",
        location: "Kathmandu",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Finance & Accounting",
        salary: { min: 10000, max: 15000, currency: "NPR" },
        duration: "4 months",
        skills: ["Excel", "Tally", "Bookkeeping", "VAT"],
        description: "Learn practical bookkeeping, VAT filing, and payroll support for SME clients.",
        responsibilities: ["Enter vouchers", "Reconcile ledgers", "Assist with monthly reports"],
        requirements: ["BBS/BBA student or graduate", "Excel basics", "Detail-oriented"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 22,
    },
    {
        key: "learnmandu-math-tutor",
        postedByEmail: "jobs@learnmandu.edu.np",
        hiringType: "company",
        companySlug: "learnmandu-academy",
        hiringName: "Learnmandu Academy",
        title: "SEE Math Tutor",
        location: "Bhaktapur",
        jobType: "part-time",
        workMode: "hybrid",
        experienceLevel: "entry-level",
        category: "Education & Tutoring",
        salary: { min: 20000, max: 32000, currency: "NPR" },
        skills: ["Mathematics", "Tutoring", "Lesson Planning", "Nepali"],
        description: "Teach SEE mathematics to small batches and support students with weekly practice sets.",
        responsibilities: ["Conduct classes", "Prepare assignments", "Track student progress"],
        requirements: ["Strong SEE math knowledge", "Patient teaching style", "Prior tutoring preferred"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 16,
    },
    {
        key: "himalaya-trails-guide",
        postedByEmail: "people@himalayatrails.com.np",
        hiringType: "company",
        companySlug: "himalaya-trails-travel",
        hiringName: "Himalaya Trails Travel",
        title: "Junior Travel Coordinator",
        location: "Pokhara",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Hospitality & Tourism",
        salary: { min: 28000, max: 42000, currency: "NPR" },
        skills: ["Customer Support", "Itinerary Planning", "English", "Google Sheets"],
        description: "Coordinate trip bookings, guide schedules, and guest communication for trekking groups.",
        responsibilities: ["Handle booking inquiries", "Prepare itineraries", "Coordinate with guides and hotels"],
        requirements: ["Good spoken English", "Organized", "Interest in tourism"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 21,
    },
    {
        key: "freshbasket-store-supervisor",
        postedByEmail: "recruitment@freshbasket.com.np",
        hiringType: "company",
        companySlug: "freshbasket-nepal",
        hiringName: "FreshBasket Nepal",
        title: "Store Supervisor",
        location: "Chitwan",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "junior",
        category: "Retail & Store Jobs",
        salary: { min: 30000, max: 45000, currency: "NPR" },
        skills: ["Inventory", "POS", "Team Supervision", "Customer Service"],
        description: "Lead daily store operations, inventory checks, and customer service quality.",
        responsibilities: ["Manage shifts", "Track stock", "Train cashiers"],
        requirements: ["Retail experience", "Basic computer skills", "Good communication"],
        isVerified: true,
        isBeginnerFriendly: false,
        deadlineDays: 28,
    },
    {
        key: "insight-nepal-field-researcher",
        postedByEmail: "hr@insightnepal.org.np",
        hiringType: "company",
        companySlug: "insight-nepal-research",
        hiringName: "Insight Nepal Research",
        title: "Field Research Assistant",
        location: "Biratnagar",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Data & Research",
        salary: { min: 18000, max: 28000, currency: "NPR" },
        duration: "2 months",
        skills: ["Survey", "Data Collection", "KoBoToolbox", "Nepali"],
        description: "Collect survey responses for community research projects in eastern Nepal.",
        responsibilities: ["Conduct interviews", "Enter field data", "Submit daily progress notes"],
        requirements: ["Comfort speaking with people", "Smartphone access", "Travel within assigned areas"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 12,
    },
    {
        key: "radio-kantipur-lite-producer",
        postedByEmail: "careers@radiokantipur-lite.com.np",
        hiringType: "company",
        companySlug: "radio-kantipur-lite",
        hiringName: "Radio Kantipur Lite",
        title: "Radio Production Assistant",
        location: "Dharan",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Media & Communication",
        salary: { min: 16000, max: 24000, currency: "NPR" },
        skills: ["Audio Editing", "Script Writing", "Interviewing", "Social Media"],
        description: "Assist hosts with scripts, audio editing, and short social clips for local shows.",
        responsibilities: ["Edit audio segments", "Prepare interview briefs", "Post clips online"],
        requirements: ["Interest in media", "Basic audio editing", "Clear communication"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 19,
    },
];

const smallBusinessJobs: SeedJob[] = [
    {
        key: "bean-street-barista",
        postedByEmail: "hello@beanstreetcafe.com.np",
        hiringType: "small-business",
        hiringName: "Bean Street Cafe",
        hiringEmail: "hello@beanstreetcafe.com.np",
        hiringPhone: "9801001109",
        hiringLocation: "Kathmandu",
        title: "Part-Time Barista",
        location: "Kathmandu",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Hospitality & Tourism",
        salary: { min: 12000, max: 18000, currency: "NPR" },
        skills: ["Coffee", "Customer Service", "Cash Handling", "Cleaning"],
        description: "Prepare coffee, serve customers, and keep the cafe counter running smoothly.",
        responsibilities: ["Prepare drinks", "Handle POS billing", "Maintain hygiene"],
        requirements: ["Friendly attitude", "Can work morning shifts", "Training provided"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 10,
    },
    {
        key: "citymart-cashier",
        postedByEmail: "jobs@citymartktm.com.np",
        hiringType: "small-business",
        hiringName: "CityMart KTM",
        hiringEmail: "jobs@citymartktm.com.np",
        hiringPhone: "9801001111",
        hiringLocation: "Kathmandu",
        title: "Cashier",
        location: "Kathmandu",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Retail & Store Jobs",
        salary: { min: 18000, max: 25000, currency: "NPR" },
        skills: ["POS", "Customer Service", "Basic Math", "Inventory"],
        description: "Operate the billing counter and help customers at a neighborhood retail store.",
        responsibilities: ["Bill purchases", "Handle cash and QR payments", "Restock small items"],
        requirements: ["Basic computer use", "Polite communication", "Reliable attendance"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 14,
    },
    {
        key: "basnet-tutoring-science",
        postedByEmail: "contact@basnettutoring.com.np",
        hiringType: "small-business",
        hiringName: "Basnet Tutoring Center",
        hiringEmail: "contact@basnettutoring.com.np",
        hiringPhone: "9801001110",
        hiringLocation: "Lalitpur",
        title: "Science Tutor",
        location: "Lalitpur",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Education & Tutoring",
        salary: { min: 18000, max: 30000, currency: "NPR" },
        skills: ["Science", "Tutoring", "Classroom Management", "Nepali"],
        description: "Teach grade 8-10 science in small evening batches.",
        responsibilities: ["Teach lessons", "Prepare quizzes", "Update guardians on progress"],
        requirements: ["Strong school-level science", "Patient teaching style", "Evening availability"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 17,
    },
];

const individualJobs: SeedJob[] = [
    {
        key: "milan-wordpress-setup",
        postedByEmail: "milan.tamang@gmail.com",
        hiringType: "individual",
        hiringName: "Milan Tamang",
        hiringEmail: "milan.tamang@gmail.com",
        hiringPhone: "9801001112",
        hiringLocation: "Butwal",
        title: "WordPress Website Setup",
        location: "Butwal",
        jobType: "part-time",
        workMode: "remote",
        experienceLevel: "entry-level",
        category: "IT & Software",
        salary: { min: 7000, max: 15000, currency: "NPR" },
        duration: "2 weeks",
        skills: ["WordPress", "Elementor", "CSS", "cPanel"],
        description: "Set up a simple service website with contact form and WhatsApp button.",
        responsibilities: ["Install WordPress", "Customize theme", "Add basic pages"],
        requirements: ["WordPress experience", "Can share previous work", "Fast communication"],
        isVerified: false,
        isBeginnerFriendly: true,
        deadlineDays: 9,
    },
    {
        key: "milan-event-photographer",
        postedByEmail: "milan.tamang@gmail.com",
        hiringType: "individual",
        hiringName: "Milan Tamang",
        hiringEmail: "milan.tamang@gmail.com",
        hiringPhone: "9801001112",
        hiringLocation: "Pokhara",
        title: "Event Photographer",
        location: "Pokhara",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "junior",
        category: "Media & Communication",
        salary: { min: 8000, max: 18000, currency: "NPR" },
        duration: "Per event",
        skills: ["Photography", "Lightroom", "Event Coverage", "Editing"],
        description: "Cover a family event and deliver edited photos within one week.",
        responsibilities: ["Shoot event photos", "Edit best images", "Deliver online gallery"],
        requirements: ["Camera gear", "Portfolio", "Available on weekends"],
        isVerified: false,
        isBeginnerFriendly: false,
        deadlineDays: 8,
    },
];

const extraCompanyJobs: SeedJob[] = [
    {
        key: "cloudmandu-qa-intern",
        postedByEmail: "hr@cloudmandu.com.np",
        hiringType: "company",
        companySlug: "cloudmandu-technologies",
        hiringName: "Cloudmandu Technologies",
        title: "QA Tester Intern",
        location: "Kathmandu",
        jobType: "internship",
        workMode: "hybrid",
        experienceLevel: "no-experience",
        category: "IT & Software",
        salary: { min: 10000, max: 16000, currency: "NPR" },
        duration: "3 months",
        skills: ["Manual Testing", "Bug Reports", "Jira", "Web Apps"],
        description: "Test web applications, report issues clearly, and support release checks with the product team.",
        responsibilities: ["Run test cases", "Document bugs", "Verify fixes before release"],
        requirements: ["Attention to detail", "Basic web app knowledge", "Clear written communication"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 24,
    },
    {
        key: "pixel-pasal-uiux-intern",
        postedByEmail: "careers@pixelpasal.com.np",
        hiringType: "company",
        companySlug: "pixel-pasal-studio",
        hiringName: "Pixel Pasal Studio",
        title: "UI/UX Design Intern",
        location: "Lalitpur",
        jobType: "internship",
        workMode: "hybrid",
        experienceLevel: "no-experience",
        category: "Design & Creative",
        salary: { min: 12000, max: 18000, currency: "NPR" },
        duration: "3 months",
        skills: ["Figma", "Wireframing", "User Research", "Design Systems"],
        description: "Assist designers with app screens, wireframes, and usability improvements for client products.",
        responsibilities: ["Create wireframes", "Organize Figma files", "Support user flow reviews"],
        requirements: ["Figma basics", "Interest in product design", "Portfolio or coursework preferred"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 23,
    },
    {
        key: "pixel-pasal-digital-marketing",
        postedByEmail: "careers@pixelpasal.com.np",
        hiringType: "company",
        companySlug: "pixel-pasal-studio",
        hiringName: "Pixel Pasal Studio",
        title: "Digital Marketing Assistant",
        location: "Lalitpur",
        jobType: "full-time",
        workMode: "hybrid",
        experienceLevel: "entry-level",
        category: "Marketing & Social Media",
        salary: { min: 25000, max: 38000, currency: "NPR" },
        skills: ["Meta Ads", "Content Calendar", "Analytics", "Canva"],
        description: "Support campaign planning, reporting, and social media publishing for local brand accounts.",
        responsibilities: ["Schedule posts", "Prepare weekly reports", "Coordinate with designers"],
        requirements: ["Marketing basics", "Comfort with spreadsheets", "Good written English"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 26,
    },
    {
        key: "sajilo-accounts-junior-accountant",
        postedByEmail: "talent@sajiloaccounts.com.np",
        hiringType: "company",
        companySlug: "sajilo-accounts",
        hiringName: "Sajilo Accounts Pvt. Ltd.",
        title: "Junior Accountant",
        location: "Kathmandu",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Finance & Accounting",
        salary: { min: 28000, max: 42000, currency: "NPR" },
        skills: ["Accounting", "Excel", "Tax Filing", "Reconciliation"],
        description: "Handle day-to-day accounting entries and assist senior accountants with monthly closing work.",
        responsibilities: ["Record transactions", "Prepare reconciliations", "Support tax filing"],
        requirements: ["BBS/BBA completed or final year", "Excel confidence", "Detail-oriented"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 29,
    },
    {
        key: "sajilo-accounts-admin-intern",
        postedByEmail: "talent@sajiloaccounts.com.np",
        hiringType: "company",
        companySlug: "sajilo-accounts",
        hiringName: "Sajilo Accounts Pvt. Ltd.",
        title: "Admin Intern",
        location: "Kathmandu",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Business & Administration",
        salary: { min: 10000, max: 15000, currency: "NPR" },
        duration: "3 months",
        skills: ["MS Office", "Documentation", "Scheduling", "Communication"],
        description: "Support office coordination, document filing, and meeting schedules for the operations team.",
        responsibilities: ["Maintain documents", "Coordinate appointments", "Assist front-desk tasks"],
        requirements: ["Organized working style", "Basic computer skills", "Punctuality"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 18,
    },
    {
        key: "freshbasket-sales-intern",
        postedByEmail: "recruitment@freshbasket.com.np",
        hiringType: "company",
        companySlug: "freshbasket-nepal",
        hiringName: "FreshBasket Nepal",
        title: "Sales Intern",
        location: "Chitwan",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Sales & Customer Service",
        salary: { min: 12000, max: 17000, currency: "NPR" },
        duration: "3 months",
        skills: ["Sales", "Customer Service", "Product Knowledge", "Reporting"],
        description: "Support store sales, customer queries, and product promotions during busy retail hours.",
        responsibilities: ["Assist customers", "Promote offers", "Track daily sales notes"],
        requirements: ["Friendly communication", "Interest in retail", "Can work weekends"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 15,
    },
    {
        key: "insight-nepal-data-entry",
        postedByEmail: "hr@insightnepal.org.np",
        hiringType: "company",
        companySlug: "insight-nepal-research",
        hiringName: "Insight Nepal Research",
        title: "Research Data Entry Intern",
        location: "Biratnagar",
        jobType: "internship",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Data & Research",
        salary: { min: 10000, max: 16000, currency: "NPR" },
        duration: "2 months",
        skills: ["Data Entry", "Excel", "Quality Check", "Nepali Typing"],
        description: "Enter survey data, check responses for completeness, and help prepare clean datasets.",
        responsibilities: ["Input survey forms", "Flag missing fields", "Maintain daily logs"],
        requirements: ["Typing accuracy", "Excel basics", "Patient and careful work style"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 13,
    },
    {
        key: "radio-kantipur-lite-social",
        postedByEmail: "careers@radiokantipur-lite.com.np",
        hiringType: "company",
        companySlug: "radio-kantipur-lite",
        hiringName: "Radio Kantipur Lite",
        title: "Newsroom Social Media Assistant",
        location: "Dharan",
        jobType: "part-time",
        workMode: "hybrid",
        experienceLevel: "entry-level",
        category: "Media & Communication",
        salary: { min: 15000, max: 23000, currency: "NPR" },
        skills: ["Social Media", "Caption Writing", "Basic Video Editing", "News Awareness"],
        description: "Turn radio segments into short social posts and support the newsroom's digital presence.",
        responsibilities: ["Write captions", "Clip short audio/video", "Monitor comments and messages"],
        requirements: ["Interest in current affairs", "Good Nepali writing", "Basic editing skills"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 16,
    },
];

const extraSmallBusinessJobs: SeedJob[] = [
    {
        key: "bean-street-kitchen-helper",
        postedByEmail: "hello@beanstreetcafe.com.np",
        hiringType: "small-business",
        hiringName: "Bean Street Cafe",
        hiringEmail: "hello@beanstreetcafe.com.np",
        hiringPhone: "9801001109",
        hiringLocation: "Kathmandu",
        title: "Kitchen Helper",
        location: "Kathmandu",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Hospitality & Tourism",
        salary: { min: 11000, max: 16000, currency: "NPR" },
        skills: ["Food Prep", "Cleaning", "Teamwork", "Time Management"],
        description: "Help with basic food prep, cleaning, and kitchen support during breakfast and lunch service.",
        responsibilities: ["Prepare ingredients", "Clean kitchen stations", "Support cooks during rush hours"],
        requirements: ["Can stand for shifts", "Willing to learn", "Morning availability"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 11,
    },
    {
        key: "citymart-merchandiser",
        postedByEmail: "jobs@citymartktm.com.np",
        hiringType: "small-business",
        hiringName: "CityMart KTM",
        hiringEmail: "jobs@citymartktm.com.np",
        hiringPhone: "9801001111",
        hiringLocation: "Kathmandu",
        title: "Store Merchandiser",
        location: "Kathmandu",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Retail & Store Jobs",
        salary: { min: 20000, max: 28000, currency: "NPR" },
        skills: ["Merchandising", "Inventory", "Shelf Display", "Customer Help"],
        description: "Arrange shelves, check product labels, and keep store displays tidy and easy to shop.",
        responsibilities: ["Update shelf displays", "Check stock dates", "Help customers find products"],
        requirements: ["Organized", "Basic inventory awareness", "Can lift light cartons"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 14,
    },
    {
        key: "basnet-tutoring-english",
        postedByEmail: "contact@basnettutoring.com.np",
        hiringType: "small-business",
        hiringName: "Basnet Tutoring Center",
        hiringEmail: "contact@basnettutoring.com.np",
        hiringPhone: "9801001110",
        hiringLocation: "Lalitpur",
        title: "English Tutor",
        location: "Lalitpur",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "Education & Tutoring",
        salary: { min: 16000, max: 26000, currency: "NPR" },
        skills: ["English Grammar", "Tutoring", "Speaking Practice", "Lesson Planning"],
        description: "Teach school-level English grammar and speaking practice to small evening groups.",
        responsibilities: ["Lead classes", "Prepare worksheets", "Give feedback to students"],
        requirements: ["Strong English basics", "Comfort teaching groups", "Evening availability"],
        isVerified: true,
        isBeginnerFriendly: true,
        deadlineDays: 19,
    },
];

const extraIndividualJobs: SeedJob[] = [
    {
        key: "milan-resume-copyedit",
        postedByEmail: "milan.tamang@gmail.com",
        hiringType: "individual",
        hiringName: "Milan Tamang",
        hiringEmail: "milan.tamang@gmail.com",
        hiringPhone: "9801001112",
        hiringLocation: "Remote",
        title: "Resume Copy Editor",
        location: "Remote",
        jobType: "part-time",
        workMode: "remote",
        experienceLevel: "entry-level",
        category: "Writing & Content",
        salary: { min: 5000, max: 9000, currency: "NPR" },
        duration: "1 week",
        skills: ["Editing", "English Writing", "Formatting", "Google Docs"],
        description: "Edit several student resumes for grammar, formatting, and clearer achievement statements.",
        responsibilities: ["Edit resume text", "Improve formatting", "Share revision notes"],
        requirements: ["Strong English", "Attention to detail", "Can meet a short deadline"],
        isVerified: false,
        isBeginnerFriendly: true,
        deadlineDays: 7,
    },
    {
        key: "milan-event-coordinator",
        postedByEmail: "milan.tamang@gmail.com",
        hiringType: "individual",
        hiringName: "Milan Tamang",
        hiringEmail: "milan.tamang@gmail.com",
        hiringPhone: "9801001112",
        hiringLocation: "Pokhara",
        title: "Event Coordination Helper",
        location: "Pokhara",
        jobType: "part-time",
        workMode: "on-site",
        experienceLevel: "no-experience",
        category: "Business & Administration",
        salary: { min: 6000, max: 10000, currency: "NPR" },
        duration: "2 days",
        skills: ["Coordination", "Guest Support", "Checklist Management", "Communication"],
        description: "Help coordinate guest arrivals, vendor checklists, and basic event logistics for a weekend event.",
        responsibilities: ["Check guest lists", "Coordinate vendor timing", "Support event setup"],
        requirements: ["Available on event day", "Calm under pressure", "Clear phone communication"],
        isVerified: false,
        isBeginnerFriendly: true,
        deadlineDays: 6,
    },
];

const categoryFillers: Array<{
    category: JobCategory;
    title: string;
    skills: string[];
    companySlug: string;
    postedByEmail: string;
    location: string;
}> = [
    { category: "Sales & Customer Service", title: "Customer Support Associate", skills: ["Customer Support", "CRM", "Phone Etiquette"], companySlug: "freshbasket-nepal", postedByEmail: "recruitment@freshbasket.com.np", location: "Chitwan" },
    { category: "Business & Administration", title: "Office Administration Assistant", skills: ["MS Office", "Filing", "Scheduling"], companySlug: "sajilo-accounts", postedByEmail: "talent@sajiloaccounts.com.np", location: "Kathmandu" },
    { category: "Marketing & Social Media", title: "Social Media Intern", skills: ["Instagram", "Canva", "Content Calendar"], companySlug: "pixel-pasal-studio", postedByEmail: "careers@pixelpasal.com.np", location: "Lalitpur" },
    { category: "Other", title: "Operations Runner", skills: ["Errands", "Coordination", "Documentation"], companySlug: "himalaya-trails-travel", postedByEmail: "people@himalayatrails.com.np", location: "Pokhara" },
];

const fillerJobs: SeedJob[] = categoryFillers.map((item, index) => ({
    key: `filler-${slugify(item.title)}`,
    postedByEmail: item.postedByEmail,
    hiringType: "company",
    companySlug: item.companySlug,
    hiringName: companies.find((company) => company.slug === item.companySlug)?.name ?? "Hiring company",
    title: item.title,
    location: item.location,
    jobType: index % 2 === 0 ? "internship" : "full-time",
    workMode: index % 2 === 0 ? "hybrid" : "on-site",
    experienceLevel: "entry-level",
    category: item.category,
    salary: { min: 18000 + index * 3000, max: 30000 + index * 4000, currency: "NPR" },
    skills: item.skills,
    description: `${item.title} role for candidates who want practical work experience in ${item.category.toLowerCase()}.`,
    responsibilities: ["Support daily operations", "Coordinate with the team", "Maintain clear records"],
    requirements: ["Good communication", "Basic computer skills", "Reliable and eager to learn"],
    isVerified: true,
    isBeginnerFriendly: true,
    deadlineDays: 20 + index,
}));

const seedJobs: SeedJob[] = [
    ...baseJobs,
    ...smallBusinessJobs,
    ...individualJobs,
    ...extraCompanyJobs,
    ...extraSmallBusinessJobs,
    ...extraIndividualJobs,
    ...fillerJobs,
];

const forbiddenEmailFragments = ["jobflow-demo", "@jobflow."];

function assertSeedDataIsClean() {
    const seedJson = JSON.stringify({ employers, companies, seedJobs }).toLowerCase();
    const forbiddenFragment = forbiddenEmailFragments.find((fragment) => seedJson.includes(fragment));

    if (forbiddenFragment) {
        throw new Error(`Seed data contains forbidden demo email fragment: ${forbiddenFragment}`);
    }
}

const getCompanyEmail = (companySlug?: string) => (
    companies.find((company) => company.slug === companySlug)?.email
);

const getCompanyWebsite = (companySlug?: string) => (
    companies.find((company) => company.slug === companySlug)?.website
);

async function resetSeededData() {
    await JobModel.deleteMany({ seedTag: SEED_TAG });
    await CompanyModel.deleteMany({ seedTag: SEED_TAG });
    await UserModel.deleteMany({ seedTag: SEED_TAG, role: "employer" });
}

async function seedEmployerUsers() {
    const password = await bcryptjs.hash(DEFAULT_PASSWORD, 10);
    const employerMap = new Map<string, mongoose.Types.ObjectId>();

    for (const employer of employers) {
        const user = await EmployerModel.findOneAndUpdate(
            { email: employer.email.toLowerCase() },
            {
                $set: {
                    ...employer,
                    email: employer.email.toLowerCase(),
                    password,
                    role: "employer",
                    seedTag: SEED_TAG,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        employerMap.set(employer.email.toLowerCase(), user._id);
    }

    return employerMap;
}

async function seedCompanies(employerMap: Map<string, mongoose.Types.ObjectId>) {
    const companyMap = new Map<string, mongoose.Types.ObjectId>();

    for (const company of companies) {
        const ownerId = employerMap.get(company.ownerEmail.toLowerCase());
        if (!ownerId) {
            throw new Error(`Missing employer for company owner ${company.ownerEmail}`);
        }

        const savedCompany = await CompanyModel.findOneAndUpdate(
            { slug: company.slug },
            {
                $set: {
                    ...company,
                    ownerId,
                    members: [{ userId: ownerId, role: "owner" }],
                    seedTag: SEED_TAG,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        companyMap.set(company.slug, savedCompany._id);
    }

    return companyMap;
}

async function seedJobListings(
    employerMap: Map<string, mongoose.Types.ObjectId>,
    companyMap: Map<string, mongoose.Types.ObjectId>,
) {
    for (const job of seedJobs) {
        const postedByUserId = employerMap.get(job.postedByEmail.toLowerCase());
        if (!postedByUserId) {
            throw new Error(`Missing employer for job poster ${job.postedByEmail}`);
        }

        const companyId = job.companySlug ? companyMap.get(job.companySlug) : undefined;
        if (job.hiringType === "company" && !companyId) {
            throw new Error(`Missing company ${job.companySlug} for job ${job.key}`);
        }

        const company = companies.find((item) => item.slug === job.companySlug);
        const hiringEmail = job.hiringType === "company"
            ? getCompanyEmail(job.companySlug)
            : job.hiringEmail;
        const hiringWebsite = job.hiringType === "company"
            ? getCompanyWebsite(job.companySlug)
            : job.hiringWebsite;

        await JobModel.findOneAndUpdate(
            { seedTag: SEED_TAG, title: job.title, postedByUserId },
            {
                $set: {
                    postedByUserId,
                    hiringType: job.hiringType,
                    companyId,
                    company: job.hiringName,
                    hiringName: job.hiringName,
                    hiringEmail,
                    hiringPhone: job.hiringType === "company" ? company?.phone : job.hiringPhone,
                    hiringWebsite,
                    hiringLocation: job.hiringLocation ?? company?.location ?? job.location,
                    isHiringVerified: job.isHiringVerified ?? company?.isVerified ?? false,
                    title: job.title,
                    location: job.location,
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
                    isVerified: job.isVerified,
                    isBeginnerFriendly: job.isBeginnerFriendly,
                    deadline: daysFromNow(job.deadlineDays),
                    postedAt: new Date(),
                    seedTag: SEED_TAG,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );
    }
}

function countBy<T extends string>(items: SeedJob[], getKey: (item: SeedJob) => T) {
    return items.reduce<Record<T, number>>((counts, item) => {
        const key = getKey(item);
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
    }, {} as Record<T, number>);
}

async function main() {
    const shouldReset = process.argv.includes("--reset");

    assertSeedDataIsClean();
    await connectDatabase();

    if (shouldReset) {
        await resetSeededData();
        console.log("Reset seeded hiring data.");
    }

    const employerMap = await seedEmployerUsers();
    const companyMap = await seedCompanies(employerMap);
    await seedJobListings(employerMap, companyMap);

    console.log(`Seeded ${employers.length} employers.`);
    console.log(`Seeded ${companies.length} companies.`);
    console.log(`Seeded ${seedJobs.length} jobs.`);
    console.log("Jobs by hiring type:", countBy(seedJobs, (job) => job.hiringType));
    console.log("Jobs by category:", countBy(seedJobs, (job) => job.category));
}

main()
    .catch((error) => {
        console.error("Failed to seed hiring data:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
