import type { Metadata } from "next";

import BackButton from "../../_components/BackButton";
import LeftPanel from "../login/_components/LeftPanel";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Forgot Password | JobFlow",
    description: "Request a link to reset your JobFlow password.",
};

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/login" className="absolute left-6 top-6 z-10" />
                <ForgotPasswordForm />
            </main>
        </div>
    );
}
