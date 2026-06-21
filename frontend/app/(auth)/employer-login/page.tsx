import Link from "next/link";

import BackButton from "../../_components/BackButton";
import EmployerLoginForm from "./_components/EmployerLoginForm";
import LeftPanel from "./_components/LeftPanel";

export default function EmployerLoginPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel
                eyebrow="Hiring made simple"
                heading="Find your next hire faster."
                body="Post roles, review applicants, and reach verified student talent from one dashboard."
                variant="login"
            />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/" className="absolute left-6 top-6 z-10" />
                <Link
                    href="/login"
                    className="group absolute right-6 top-6 z-10 text-sm text-ink-400 transition-colors hover:text-ink-600"
                >
                    Looking for a job?{" "}
                    <span className="font-medium text-cobalt-500 transition-colors group-hover:text-cobalt-700">
                        Job seeker login
                    </span>
                </Link>
                <EmployerLoginForm />
            </main>
        </div>
    );
}
