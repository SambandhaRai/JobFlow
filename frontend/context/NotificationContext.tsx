"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { toast } from "react-toastify";

import { useAuth } from "./AuthContext";
import { API } from "../lib/api/endpoints";
import {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationItem,
} from "../lib/api/notification/notification";

interface NotificationContextValue {
    notifications: NotificationItem[];
    unreadCount: number;
    connected: boolean;
    loaded: boolean;
    lastEvent: NotificationItem | null;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const getToken = (): string | null => {
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem("jobflow_token");
    if (stored) return stored;

    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("auth_token="));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const MAX_PANEL_NOTIFICATIONS = 30;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [lastEvent, setLastEvent] = useState<NotificationItem | null>(null);
    const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);
    const eventSourceRef = useRef<EventSource | null>(null);

    if (wasAuthenticated !== isAuthenticated) {
        setWasAuthenticated(isAuthenticated);
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            setConnected(false);
            setLoaded(false);
            setLastEvent(null);
        }
    }

    const refresh = useCallback(async () => {
        try {
            const response = await getNotifications({ page: 1, size: MAX_PANEL_NOTIFICATIONS });
            setNotifications(response.data ?? []);
            setUnreadCount(response.unreadCount ?? 0);
        } catch {}
    }, []);

    const markRead = useCallback(async (id: string) => {
        let wasUnread = false;
        setNotifications((current) =>
            current.map((item) => {
                if (item._id === id && !item.isRead) wasUnread = true;
                return item._id === id ? { ...item, isRead: true } : item;
            }),
        );
        if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));

        try {
            await markNotificationRead(id);
        } catch {
            void refresh();
        }
    }, [refresh]);

    const markAllRead = useCallback(async () => {
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);

        try {
            await markAllNotificationsRead();
        } catch {
            void refresh();
        }
    }, [refresh]);

    useEffect(() => {
        if (!isAuthenticated) return;

        void (async () => {
            try {
                const response = await getNotifications({ page: 1, size: MAX_PANEL_NOTIFICATIONS });
                setNotifications(response.data ?? []);
                setUnreadCount(response.unreadCount ?? 0);
            } catch {} finally {
                setLoaded(true);
            }
        })();

        const token = getToken();
        if (!token) return;

        const eventSource = new EventSource(API.NOTIFICATION.STREAM(token));
        eventSourceRef.current = eventSource;

        eventSource.addEventListener("connected", () => setConnected(true));

        eventSource.addEventListener("unread", (event) => {
            try {
                const data = JSON.parse((event as MessageEvent).data);
                if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
            } catch {}
        });

        eventSource.addEventListener("notification", (event) => {
            try {
                const incoming = JSON.parse((event as MessageEvent).data) as NotificationItem;
                setNotifications((current) =>
                    [incoming, ...current.filter((item) => item._id !== incoming._id)]
                        .slice(0, MAX_PANEL_NOTIFICATIONS),
                );
                setLastEvent(incoming);
                toast.info(incoming.title);
            } catch {}
        });

        eventSource.onerror = () => {
            setConnected(false);
        };

        return () => {
            eventSource.close();
            eventSourceRef.current = null;
            setConnected(false);
        };
    }, [isAuthenticated]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, connected, loaded, lastEvent, markRead, markAllRead, refresh }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
