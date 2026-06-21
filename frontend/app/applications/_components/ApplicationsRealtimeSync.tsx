"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useNotifications } from "../../../context/NotificationContext";

export default function ApplicationsRealtimeSync() {
    const router = useRouter();
    const { lastEvent } = useNotifications();

    useEffect(() => {
        if (!lastEvent) return;
        router.refresh();
    }, [lastEvent, router]);

    return null;
}
