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
import { handleRegister } from "../../../../lib/actions/auth-action";
import AuthLogo from "../../login/_components/AuthLogo";

const schema = z.object({
    fullName: z.string().min(2, "Enter your name"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function EmployerSignUpForm() {
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
        const result = await handleRegister({
            role: "employer",
            fullName: data.fullName.trim(),
            email: data.email,
            password: data.password,
            confirmPassword: data.password,
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
        toast.success("Employer account created");
        router.push("/employer/jobs");
    }

    return (
        <div className="flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-12 max-w-lg w-full mx-auto">
            <AuthLogo className="mb-10 lg:hidden" />

            <span className="self-start inline-flex items-center rounded-full bg-cobalt-50 px-2.5 py-0.5 text-xs font-medium text-cobalt-700 mb-3">
                For employers
            </span>
            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Create an employer account
            </h1>
            <p className="text-sm text-ink-500 mb-8">
                Post jobs and review applicants. Listings go live after admin review.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                    <div className="px-4 py-3 rounded-md bg-danger-50 border border-danger-500/30 text-sm text-danger-700">
                        {serverError}
                    </div>
                )}

                <Input
                    label="Full name"
                    placeholder="Your name"
                    error={errors.fullName?.message}
                    {...register("fullName")}
                />
                <Input
                    label="Work email"
                    type="email"
                    placeholder="you@company.com"
                    error={errors.email?.message}
                    {...register("email")}
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="At least 8 characters"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
                    Create account &amp; continue
                </Button>
            </form>

            <p className="text-sm text-center text-ink-500 mt-6">
                Already have an employer account?{" "}
                <Link href="/employer-login" className="font-medium text-cobalt-500 transition-colors hover:text-cobalt-700">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
