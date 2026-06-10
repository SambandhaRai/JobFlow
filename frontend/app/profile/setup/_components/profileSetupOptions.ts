export type EducationLevel = "see" | "+2" | "diploma" | "bachelor" | "master" | "phd" | "other";
export type EducationStatus = "currently-studying" | "completed";

export type EducationDraft = {
    level: EducationLevel;
    institutionName: string;
    status: EducationStatus;
    completionYear: string;
};

export type EducationEntry = EducationDraft & {
    id: string;
};

export type EducationError = Partial<Record<keyof EducationDraft | "form", string>>;

export const educationLevels: Array<{ value: EducationLevel; label: string }> = [
    { value: "see", label: "SEE" },
    { value: "+2", label: "+2 / Higher secondary" },
    { value: "diploma", label: "Diploma" },
    { value: "bachelor", label: "Bachelor" },
    { value: "master", label: "Master" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
];

export const educationStatuses: Array<{ value: EducationStatus; label: string }> = [
    { value: "currently-studying", label: "Currently studying" },
    { value: "completed", label: "Completed" },
];

export const fallbackInstitutionOptions = [
    "Budhanilkantha School",
    "GEMS School",
    "Galaxy Public School",
    "Little Angels' School",
    "Rato Bangala School",
    "St. Xavier's School Jawalakhel",
    "Tribhuvan University",
    "Kathmandu University",
    "Pokhara University",
    "Purbanchal University",
    "Nepal Engineering College",
    "Kathmandu Engineering College",
    "Kantipur Engineering College",
    "Islington College",
    "Herald College Kathmandu",
    "The British College",
    "Prime College",
    "St. Xavier's College Maitighar",
];

export const MAX_SKILLS = 20;
export const currentYear = new Date().getFullYear();
export const yearOptions = Array.from({ length: 51 }, (_, index) => {
    const year = String(currentYear - 30 + index);
    return { value: year, label: year };
});

export const createEmptyEducation = (): EducationDraft => ({
    level: "see",
    institutionName: "",
    status: "currently-studying",
    completionYear: "",
});

export const getEducationSummary = (education: EducationEntry) => {
    const level = educationLevels.find((item) => item.value === education.level)?.label ?? education.level;
    const status = education.status === "currently-studying" ? "Expected" : "Completed";

    return `${level} • ${status} ${education.completionYear}`;
};
