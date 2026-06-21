import Link from "next/link";

import BackButton from "../../_components/BackButton";
import LeftPanel from "./_components/LeftPanel";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/" className="absolute left-6 top-6 z-10" />
                <Link
                    href="/employer-login"
                    className="group absolute right-6 top-6 z-10 text-sm text-ink-400 transition-colors hover:text-ink-600"
                >
                    Hiring talent?{" "}
                    <span className="font-medium text-cobalt-500 transition-colors group-hover:text-cobalt-700">
                        Employer login
                    </span>
                </Link>
                <LoginForm />
            </main>
        </div>
    );
}
