"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { uploadProfilePicture } from "../../../lib/api/user/user";
import { setUserData } from "../../../lib/cookie";
import { useAuth } from "../../../context/AuthContext";
import { resolveAvatarUrl } from "./profileData";

interface AvatarUploaderProps {
    initials: string;
    name: string;
    profilePicture: string | null;
}

const ACCEPTED_FILES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function AvatarUploader({ initials, name, profilePicture }: AvatarUploaderProps) {
    const router = useRouter();
    const { user: authUser, setUser } = useAuth();
    const [src, setSrc] = useState<string | null>(profilePicture);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            toast.error("Image must be 5 MB or smaller");
            return;
        }

        const form = new FormData();
        form.append("profilePicture", file);

        setUploading(true);
        try {
            const response = await uploadProfilePicture(form);
            const fileName = (response as { data?: { profilePicture?: string } })?.data?.profilePicture;
            const next = resolveAvatarUrl(fileName);
            if (next) {
                setSrc(`${next}?t=${Date.now()}`);
            }
            if (fileName) {
                setUser((prev) => (prev ? { ...prev, profilePicture: fileName } : prev));
                void setUserData({ ...(authUser ?? {}), profilePicture: fileName });
            }
            toast.success("Profile picture updated");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not upload picture");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void handleUpload(file);
    };

    return (
        <div className="group relative -mt-12 h-24 w-24 shrink-0 sm:-mt-14">
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                onChange={onFileInputChange}
                className="hidden"
            />

            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={name}
                    className="h-24 w-24 rounded-2xl object-cover shadow-popover ring-4 ring-surface"
                />
            ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cobalt-500 to-cobalt-700 font-display text-2xl font-bold text-white shadow-popover ring-4 ring-surface">
                    {initials}
                </div>
            )}

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile picture"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-900/50 text-white opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed"
            >
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            </button>
        </div>
    );
}
