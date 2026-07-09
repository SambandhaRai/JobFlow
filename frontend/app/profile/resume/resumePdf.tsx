import {
    Circle,
    Document,
    Font,
    Image,
    Page,
    Path,
    Rect,
    StyleSheet,
    Svg,
    Text,
    View,
    pdf,
} from "@react-pdf/renderer";

import type { ProfileData, ProfileEducation, ProfileExperience } from "../_components/profileData";
import { educationLevels } from "../setup/_components/profileSetupOptions";
import { employmentTypes } from "../setup/_components/experienceOptions";

/* Palette mirrors the on-screen resume document. */
const COBALT = "#2e5bff";
const INK = "#0e1116";
const HEADING_INK = "#1a1f26";
const BODY = "#4a5160";
const MUTED = "#6b7280";
const LINE = "#d9dee8";
const HEADER_BG = "#f7f8fc";
const CHIP_BG = "#eef2ff";
const CHIP_TEXT = "#1535b8";
const INITIALS_BG = "#dde5ff";
const INITIALS_TEXT = "#1d45e5";

const FONT_BASE = typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    : window.location.origin;

Font.register({
    family: "Inter",
    fonts: [
        { src: `${FONT_BASE}/fonts/inter-regular.ttf`, fontWeight: 400 },
        { src: `${FONT_BASE}/fonts/inter-500.ttf`, fontWeight: 500 },
        { src: `${FONT_BASE}/fonts/inter-700.ttf`, fontWeight: 700 },
    ],
});

Font.register({
    family: "Bricolage Grotesque",
    fonts: [{ src: `${FONT_BASE}/fonts/bricolage-700.ttf`, fontWeight: 700 }],
});

Font.registerHyphenationCallback((word) => [word]);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const educationLabel = (education: ProfileEducation) => (
    educationLevels.find((item) => item.value === education.level)?.label ?? education.level
);

const employmentLabel = (experience: ProfileExperience) => (
    employmentTypes.find((item) => item.value === experience.employmentType)?.label ?? experience.employmentType
);

const monthYear = (month: string, year: string) => (
    [monthNames[Number(month) - 1], year].filter(Boolean).join(" ")
);

const experiencePeriod = (experience: ProfileExperience) => {
    const start = monthYear(experience.startMonth, experience.startYear);
    const end = experience.isCurrent ? "Present" : monthYear(experience.endMonth, experience.endYear);
    return [start, end].filter(Boolean).join(" – ");
};

/* Icons traced from lucide (24x24 stroke icons), same set as the on-screen document. */
const iconProps = (color: string) => ({
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
});

function GraduationCapIcon({ size, color }: { size: number; color: string }) {
    const props = iconProps(color);
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path {...props} d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <Path {...props} d="M22 10v6" />
            <Path {...props} d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </Svg>
    );
}

function BriefcaseIcon({ size, color }: { size: number; color: string }) {
    const props = iconProps(color);
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path {...props} d="M12 12h.01" />
            <Path {...props} d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <Path {...props} d="M22 13a18.15 18.15 0 0 1-20 0" />
            <Rect {...props} width={20} height={14} x={2} y={6} rx={2} />
        </Svg>
    );
}

function SparklesIcon({ size, color }: { size: number; color: string }) {
    const props = iconProps(color);
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path {...props} d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <Path {...props} d="M20 2v4" />
            <Path {...props} d="M22 4h-4" />
            <Circle {...props} cx={4} cy={20} r={2} />
        </Svg>
    );
}

function MailIcon({ size, color }: { size: number; color: string }) {
    const props = iconProps(color);
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path {...props} d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
            <Rect {...props} x={2} y={4} width={20} height={16} rx={2} />
        </Svg>
    );
}

function PhoneIcon({ size, color }: { size: number; color: string }) {
    const props = iconProps(color);
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path {...props} d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
        </Svg>
    );
}

/* Screen pixels translate to PDF points at 0.75 (96dpi -> 72dpi). */
const styles = StyleSheet.create({
    page: {
        fontFamily: "Inter",
        fontWeight: 400,
        color: BODY,
        backgroundColor: "#ffffff",
        paddingTop: 34,
        paddingBottom: 44,
        paddingHorizontal: 36,
    },
    header: {
        marginTop: -34,
        marginHorizontal: -36,
        paddingVertical: 30,
        paddingHorizontal: 36,
        backgroundColor: HEADER_BG,
        borderBottomWidth: 4.5,
        borderBottomColor: COBALT,
        borderBottomStyle: "solid",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 18,
    },
    name: {
        fontFamily: "Bricolage Grotesque",
        fontWeight: 700,
        fontSize: 26,
        color: INK,
        letterSpacing: -0.3,
    },
    contactRow: {
        marginTop: 12,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 15,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4.5,
    },
    contactText: {
        fontSize: 10,
        color: BODY,
    },
    photo: {
        width: 72,
        height: 72,
        borderRadius: 9,
        objectFit: "cover",
    },
    initialsBox: {
        width: 72,
        height: 72,
        borderRadius: 9,
        backgroundColor: INITIALS_BG,
        alignItems: "center",
        justifyContent: "center",
    },
    initialsText: {
        fontFamily: "Bricolage Grotesque",
        fontWeight: 700,
        fontSize: 15,
        color: INITIALS_TEXT,
    },
    body: {
        paddingTop: 30,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderBottomWidth: 0.75,
        borderBottomColor: LINE,
        borderBottomStyle: "solid",
        paddingBottom: 6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: HEADING_INK,
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    entry: {
        marginBottom: 15,
    },
    entryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    entryTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: INK,
    },
    entryOrganization: {
        marginTop: 2,
        fontSize: 10.5,
        fontWeight: 500,
        color: COBALT,
    },
    entryInstitution: {
        marginTop: 2,
        fontSize: 10.5,
        color: BODY,
    },
    entryMeta: {
        fontSize: 9,
        color: MUTED,
        textAlign: "right",
    },
    entryMetaSecond: {
        marginTop: 2,
        fontSize: 9,
        color: MUTED,
        textAlign: "right",
    },
    description: {
        marginTop: 6,
        fontSize: 10.5,
        color: BODY,
        lineHeight: 1.6,
    },
    skillsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    skillChip: {
        backgroundColor: CHIP_BG,
        borderRadius: 4.5,
        paddingVertical: 4.5,
        paddingHorizontal: 9,
    },
    skillText: {
        fontSize: 9,
        fontWeight: 700,
        color: CHIP_TEXT,
    },
    pageNumber: {
        position: "absolute",
        bottom: 20,
        right: 36,
        fontSize: 8,
        color: MUTED,
    },
});

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <View style={styles.sectionHeading}>
            {icon}
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );
}

export function ResumePdfDocument({ profile, photo }: { profile: ProfileData; photo: string | null }) {
    const displayName = profile.fullName.trim() || "Your name";
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U";

    return (
        <Document title={`${displayName} — Resume`} author={displayName} creator="JobFlow">
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={{ flexShrink: 1 }}>
                        <Text style={styles.name}>{displayName}</Text>
                        <View style={styles.contactRow}>
                            {profile.email ? (
                                <View style={styles.contactItem}>
                                    <MailIcon size={10} color={BODY} />
                                    <Text style={styles.contactText}>{profile.email}</Text>
                                </View>
                            ) : null}
                            {profile.phone ? (
                                <View style={styles.contactItem}>
                                    <PhoneIcon size={10} color={BODY} />
                                    <Text style={styles.contactText}>{profile.phone}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                    {photo ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image src={photo} style={styles.photo} />
                    ) : (
                        <View style={styles.initialsBox}>
                            <Text style={styles.initialsText}>{initials}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.body}>
                    {profile.experiences.length > 0 && (
                        <View style={styles.section}>
                            <SectionHeading icon={<BriefcaseIcon size={12} color={COBALT} />} title="Experience" />
                            {profile.experiences.map((experience) => (
                                <View key={experience.id} style={styles.entry} wrap={false}>
                                    <View style={styles.entryRow}>
                                        <View style={{ flexShrink: 1 }}>
                                            <Text style={styles.entryTitle}>{experience.title}</Text>
                                            <Text style={styles.entryOrganization}>{experience.organization}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.entryMeta}>{experiencePeriod(experience)}</Text>
                                            <Text style={styles.entryMetaSecond}>{employmentLabel(experience)}</Text>
                                        </View>
                                    </View>
                                    {experience.description ? (
                                        <Text style={styles.description}>{experience.description}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    )}

                    {profile.educations.length > 0 && (
                        <View style={styles.section}>
                            <SectionHeading icon={<GraduationCapIcon size={12} color={COBALT} />} title="Education" />
                            {profile.educations.map((education) => (
                                <View key={education.id} style={styles.entry} wrap={false}>
                                    <View style={styles.entryRow}>
                                        <View style={{ flexShrink: 1 }}>
                                            <Text style={styles.entryTitle}>{educationLabel(education)}</Text>
                                            <Text style={styles.entryInstitution}>{education.institutionName}</Text>
                                        </View>
                                        {education.completionYear ? (
                                            <Text style={styles.entryMeta}>
                                                {education.status === "currently-studying" ? "Expected" : "Completed"} {education.completionYear}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {profile.skills.length > 0 && (
                        <View style={styles.section}>
                            <SectionHeading icon={<SparklesIcon size={12} color={COBALT} />} title="Skills" />
                            <View style={styles.skillsRow}>
                                {profile.skills.map((skill) => (
                                    <View key={skill} style={styles.skillChip} wrap={false}>
                                        <Text style={styles.skillText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                <Text
                    style={styles.pageNumber}
                    fixed
                    render={({ pageNumber, totalPages }) => (totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : "")}
                />
            </Page>
        </Document>
    );
}

const loadPhoto = async (url: string | null): Promise<string | null> => {
    if (!url) return null;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        if (!/^image\/(png|jpe?g)$/i.test(blob.type)) return null;

        return await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

export const downloadResumePdf = async (profile: ProfileData) => {
    const photo = await loadPhoto(profile.profilePicture);
    const blob = await pdf(<ResumePdfDocument profile={profile} photo={photo} />).toBlob();

    const name = profile.fullName.trim() || "jobflow";
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jobflow";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
