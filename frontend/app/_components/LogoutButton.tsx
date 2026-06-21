"use client";

import { LogOut } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface LogoutButtonProps {
    className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
    const { logout } = useAuth();

    return (
        <button
            type="button"
            onClick={() => void logout()}
            className={[
                "inline-flex items-center gap-2 rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-danger-500/30 hover:bg-danger-50 hover:text-danger-700",
                className,
            ].join(" ")}
        >
            <LogOut size={15} />
            Log out
        </button>
    );
}
