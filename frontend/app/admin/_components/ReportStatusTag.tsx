import Badge, { type BadgeTone } from "../../_components/Badge";

const TONES: Record<string, { tone: BadgeTone; label: string }> = {
    open: { tone: "warning", label: "Open" },
    reviewed: { tone: "success", label: "Reviewed" },
    dismissed: { tone: "neutral", label: "Dismissed" },
};

export default function ReportStatusTag({ status }: { status?: string }) {
    const config = (status && TONES[status]) || { tone: "neutral" as BadgeTone, label: status ?? "—" };
    return <Badge tone={config.tone}>{config.label}</Badge>;
}
