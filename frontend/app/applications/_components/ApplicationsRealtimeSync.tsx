"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useNotifications } from "../../../context/NotificationContext";

// Re-fetches the (server-rendered) applications page whenever a status
// notification arrives live over SSE, so the table rows and stat cards stay in
// sync without a manual reload. Renders nothing.
export default function ApplicationsRealtimeSync() {
    const router = useRouter();
    const { lastEvent } = useNotifications();

    useEffect(() => {
        if (!lastEvent) return;
        router.refresh();
    }, [lastEvent, router]);

    return null;
}
