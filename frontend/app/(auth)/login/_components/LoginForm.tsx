"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import Button from "../../../_components/Button";
import Checkbox from "../../../_components/Checkbox";
import Input from "../../../_components/Input";
import { useAuth } from "../../../../context/AuthContext";
import { handleLogin } from "../../../../lib/actions/auth-action";
import AuthLogo from "./AuthLogo";
import GoogleIcon from "./GoogleIcon";

const schema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const getRedirectPath = (role?: string) => {
    if (role === "user") return "/discover";
    return "/";
};

export default function LoginForm() {
    const router = useRouter();
    const { checkAuth } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { remember: false },
    });

    const remember = useWatch({ control, name: "remember" });

    async function onSubmit(data: FormValues) {
        setServerError(null);
        const result = await handleLogin({
            email: data.email,
            password: data.password,
            acceptedRoles: ["user"],
            roleMismatchMessage: "Only job seeker accounts can log in here. Employers should use the employer login page.",
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

            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Welcome back
            </h1>
            <p className="text-sm text-ink-500 mb-8">
                Login to continue your job search.
            </p>

            <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-3 border border-ink-200 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-5"
            >
                <GoogleIcon />
                Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-ink-100" />
                <span className="text-xs text-ink-400">or with email</span>
                <div className="flex-1 h-px bg-ink-100" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                    <div className="px-4 py-3 rounded-md bg-danger-50 border border-danger-500/30 text-sm text-danger-700">
                        {serverError}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
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

                <Checkbox
                    label="Keep me signed in for 30 days"
                    checked={remember ?? false}
                    onChange={(event) => setValue("remember", event.target.checked)}
                />

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    className="mt-2"
                >
                    Login
                </Button>
            </form>

            <p className="text-sm text-center text-ink-500 mt-6">
                New to JobFlow?{" "}
                <Link
                    href="/sign-up"
                    className="font-medium text-cobalt-500 hover:text-cobalt-700 transition-colors"
                >
                    Create an account
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
