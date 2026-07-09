const AVATAR_COLORS = [
    { bg: "bg-cobalt-50", text: "text-cobalt-700" },
    { bg: "bg-success-50", text: "text-success-700" },
    { bg: "bg-warning-50", text: "text-warning-700" },
    { bg: "bg-danger-50", text: "text-danger-700" },
    { bg: "bg-ink-50", text: "text-ink-700" },
    { bg: "bg-cobalt-100", text: "text-cobalt-800" },
    { bg: "bg-ink-100", text: "text-ink-800" },
];

function getColorIndex(initials: string): number {
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
        hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % AVATAR_COLORS.length;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeStyles: Record<AvatarSize, string> = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
};

interface CompanyAvatarProps {
    name: string;
    size?: AvatarSize;
    className?: string;
    imageUrl?: string | null;
    fallbackTone?: "auto" | "brand";
}

export default function CompanyAvatar({
    name,
    size = "md",
    className = "",
    imageUrl,
    fallbackTone = "auto",
}: CompanyAvatarProps) {
    const initials = getInitials(name);
    const { bg, text } = AVATAR_COLORS[getColorIndex(initials)];
    const fallbackColors = fallbackTone === "brand"
        ? "bg-cobalt-500 text-white"
        : `${bg} ${text}`;

    if (imageUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={imageUrl}
                alt={name}
                aria-label={name}
                className={[
                    "rounded-md object-cover shrink-0",
                    sizeStyles[size],
                    className,
                ].join(" ")}
            />
        );
    }

    return (
        <div
            className={[
                "rounded-md flex items-center justify-center font-semibold shrink-0 font-mono",
                sizeStyles[size],
                fallbackColors,
                className,
            ].join(" ")}
            aria-label={name}
        >
            {initials}
        </div>
    );
}
