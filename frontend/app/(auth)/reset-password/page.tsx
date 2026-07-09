import type { Metadata } from "next";

import BackButton from "../../_components/BackButton";
import LeftPanel from "../login/_components/LeftPanel";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Reset Password | JobFlow",
    description: "Choose a new password for your JobFlow account.",
};

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string }>;
}) {
    const { email } = await searchParams;

    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/login" className="absolute left-6 top-6 z-10" />
                <ResetPasswordForm email={email ?? ""} />
            </main>
        </div>
    );
}
