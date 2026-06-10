import Link from "next/link";
import { GraduationCap } from "lucide-react";

import StepIndicator from "../../../_components/StepIndicator";

interface ProfileSetupShellProps {
    currentStep: 1 | 2;
    serverError: string | null;
    children: React.ReactNode;
}

export default function ProfileSetupShell({
    currentStep,
    serverError,
    children,
}: ProfileSetupShellProps) {
    return (
        <main className="min-h-screen bg-background px-5 py-8 sm:px-8">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <header className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt-500 text-sm font-bold text-white font-display">
                            JF
                        </div>
                        <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
                            JobFlow
                        </span>
                    </Link>
                    <Link
                        href="/discover"
                        className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
                    >
                        Skip for now
                    </Link>
                </header>

                <section className="rounded-lg border border-ink-200 bg-surface p-6 shadow-card sm:p-8">
                    <div className="mb-8 flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cobalt-50 text-cobalt-600">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cobalt-600">
                                Profile setup
                            </p>
                            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                                Build your student profile
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-500">
                                Add your education history and skills so JobFlow can tune internships and entry-level roles to you.
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <StepIndicator
                            currentStep={currentStep}
                            steps={[{ label: "Education" }, { label: "Skills" }]}
                        />
                    </div>

                    {serverError && (
                        <div className="mb-5 rounded-md border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                            {serverError}
                        </div>
                    )}

                    {children}
                </section>
            </div>
        </main>
    );
}
