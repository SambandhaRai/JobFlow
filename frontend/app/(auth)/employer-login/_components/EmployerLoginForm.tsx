"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import Button from "../../../_components/Button";
import Input from "../../../_components/Input";
import { useAuth } from "../../../../context/AuthContext";
import { handleLogin } from "../../../../lib/actions/auth-action";
import AuthLogo from "../../login/_components/AuthLogo";

const schema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const getRedirectPath = (role?: string) => {
    if (role === "employer") return "/employer/jobs";
    if (role === "admin") return "/admin";
    if (role === "user") return "/discover";
    return "/";
};

export default function EmployerLoginForm() {
    const router = useRouter();
    const { checkAuth } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    async function onSubmit(data: FormValues) {
        setServerError(null);
        const result = await handleLogin({
            email: data.email,
            password: data.password,
            acceptedRoles: ["employer", "admin"],
            roleMismatchMessage: "Job seeker accounts cannot log in from the employer portal. Please use the job seeker login page instead.",
        });

        if (!result.success) {
            setServerError(result.message);
            toast.error(result.message);
            return;
        }

        if (result.token) {
            window.localStorage.setItem("jobflow_token", result.token);
        }

        await checkAuth();
        toast.success("Login successful");
        router.replace(getRedirectPath(result.data?.role));
    }

    return (
        <div className="flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-12 max-w-lg w-full mx-auto">
            <AuthLogo className="mb-10 lg:hidden" />

            <span className="self-start inline-flex items-center rounded-full bg-cobalt-50 px-2.5 py-0.5 text-xs font-medium text-cobalt-700 mb-3">
                For employers
            </span>
            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Welcome back
            </h1>
            <p className="text-sm text-ink-500 mb-8">
                Sign in to post jobs and manage applicants.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                    <div className="px-4 py-3 rounded-md bg-danger-50 border border-danger-500/30 text-sm text-danger-700">
                        {serverError}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-ink-700">Password</label>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-cobalt-500 hover:text-cobalt-700 transition-colors"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <Input
                        type="password"
                        placeholder="Password"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                </div>

                <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
                    Login
                </Button>
            </form>

            <p className="text-sm text-center text-ink-500 mt-6">
                New employer?{" "}
                <Link href="/employer-signup" className="font-medium text-cobalt-500 transition-colors hover:text-cobalt-700">
                    Create an employer account
                </Link>
            </p>
            <p className="text-xs text-center text-ink-400 mt-8">
                JobFlow Nepal /{" "}
                <Link href="mailto:support@jobflow.np" className="hover:text-ink-600 transition-colors">
                    support@jobflow.np
                </Link>
            </p>
        </div>
    );
}
