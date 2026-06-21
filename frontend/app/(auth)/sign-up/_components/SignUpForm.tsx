"use client";

import { useMemo, useState } from "react";
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
import AuthLogo from "../../login/_components/AuthLogo";
import GoogleIcon from "../../login/_components/GoogleIcon";
import { handleRegister } from "../../../../lib/actions/auth-action";

const schema = z.object({
    firstName: z.string().min(1, "Enter your first name"),
    lastName: z.string().min(1, "Enter your last name"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    terms: z.boolean().refine((value) => value, {
        message: "You must agree before creating an account",
    }),
    recommendations: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

function getPasswordStrength(password = "") {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;

    if (!password) {
        return { label: "", score: 0, color: "bg-ink-100", textColor: "text-ink-400" };
    }

    if (score >= 4) {
        return { label: "Strong", score: 4, color: "bg-success-700", textColor: "text-success-700" };
    }

    if (score >= 3) {
        return { label: "Good", score: 3, color: "bg-warning-500", textColor: "text-warning-700" };
    }

    return { label: "Weak", score: 2, color: "bg-danger-500", textColor: "text-danger-700" };
}

export default function SignUpForm() {
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
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            terms: false,
            recommendations: true,
        },
    });

    const password = useWatch({ control, name: "password" });
    const terms = useWatch({ control, name: "terms" });
    const recommendations = useWatch({ control, name: "recommendations" });
    const strength = useMemo(() => getPasswordStrength(password), [password]);

    async function onSubmit(data: FormValues) {
        setServerError(null);
        const result = await handleRegister({
            role: "user",
            fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
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
        toast.success("Account created");
        router.push("/profile/setup");
    }

    return (
        <div className="flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-10 max-w-140 w-full mx-auto">
            <AuthLogo className="mb-10 lg:hidden" />

            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Create your job seeker account
            </h1>
            <p className="text-sm text-ink-500 mb-8">
                Start applying to verified internships and entry-level roles.
            </p>

            <button
                type="button"
                className="w-full h-11 flex items-center justify-center gap-3 border border-ink-200 rounded-md text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors mb-5"
            >
                <GoogleIcon />
                Sign up with Google
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="First name"
                        placeholder="Sneha"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                    />
                    <Input
                        label="Last name"
                        placeholder="Karki"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                    />
                </div>

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div className="space-y-2">
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={[
                                    "h-1 flex-1 rounded-full",
                                    index < strength.score ? strength.color : "bg-ink-100",
                                ].join(" ")}
                            />
                        ))}
                        <span className={["w-10 text-xs text-right", strength.textColor].join(" ")}>
                            {strength.label}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 pt-1">
                    <Checkbox
                        label={
                            <>
                                I agree to the{" "}
                                <Link href="/terms" className="font-medium text-cobalt-500 hover:text-cobalt-700">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="font-medium text-cobalt-500 hover:text-cobalt-700">
                                    Privacy Policy
                                </Link>
                            </>
                        }
                        checked={terms ?? false}
                        onChange={(event) => setValue("terms", event.target.checked, { shouldValidate: true })}
                        error={errors.terms?.message}
                    />
                    <Checkbox
                        label="Send me weekly job recommendations"
                        checked={recommendations ?? false}
                        onChange={(event) => setValue("recommendations", event.target.checked)}
                    />
                </div>

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isSubmitting}
                    className="mt-2"
                >
                    Create account &amp; continue
                </Button>
            </form>

            <p className="text-sm text-center text-ink-500 mt-6">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-cobalt-500 hover:text-cobalt-700 transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
