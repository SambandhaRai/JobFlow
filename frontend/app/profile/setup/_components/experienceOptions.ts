export type EmploymentType = "internship" | "part-time" | "full-time" | "freelance" | "volunteer";

export type ExperienceDraft = {
    title: string;
    organization: string;
    employmentType: EmploymentType;
    startMonth: string;
    startYear: string;
    isCurrent: boolean;
    endMonth: string;
    endYear: string;
    description: string;
};

export type ExperienceEntry = ExperienceDraft & {
    id: string;
};

export type ExperienceError = Partial<Record<keyof ExperienceDraft | "form", string>>;

export const employmentTypes: Array<{ value: EmploymentType; label: string }> = [
    { value: "internship", label: "Internship" },
    { value: "part-time", label: "Part-time" },
    { value: "full-time", label: "Full-time" },
    { value: "freelance", label: "Freelance" },
    { value: "volunteer", label: "Volunteer" },
];

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const shortMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const monthOptions: Array<{ value: string; label: string }> = monthNames.map((label, index) => ({
    value: String(index + 1),
    label,
}));

export const createEmptyExperience = (): ExperienceDraft => ({
    title: "",
    organization: "",
    employmentType: "internship",
    startMonth: "1",
    startYear: "",
    isCurrent: false,
    endMonth: "1",
    endYear: "",
    description: "",
});

const formatMonthYear = (month: string, year: string) => {
    const monthLabel = shortMonthNames[Number(month) - 1] ?? "";
    return [monthLabel, year].filter(Boolean).join(" ");
};

export const getExperienceSummary = (experience: ExperienceEntry) => {
    const type = employmentTypes.find((item) => item.value === experience.employmentType)?.label
        ?? experience.employmentType;
    const start = formatMonthYear(experience.startMonth, experience.startYear);
    const end = experience.isCurrent ? "Present" : formatMonthYear(experience.endMonth, experience.endYear);

    return `${type} • ${start} – ${end}`;
};

export const validateExperience = (draft: ExperienceDraft): ExperienceError => {
    const errors: ExperienceError = {};

    if (!draft.title.trim()) {
        errors.title = "Enter your role or job title";
    }

    if (!draft.organization.trim()) {
        errors.organization = "Enter the company or organization";
    }

    if (!/^\d{4}$/.test(draft.startYear.trim())) {
        errors.startYear = "Enter a valid 4-digit year";
    }

    if (!draft.isCurrent) {
        if (!/^\d{4}$/.test(draft.endYear.trim())) {
            errors.endYear = "Enter a valid 4-digit year";
        } else if (/^\d{4}$/.test(draft.startYear.trim())) {
            const start = Number(draft.startYear) * 100 + Number(draft.startMonth);
            const end = Number(draft.endYear) * 100 + Number(draft.endMonth);
            if (end < start) {
                errors.endYear = "End date cannot be before the start date";
            }
        }
    }

    return errors;
};
