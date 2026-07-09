"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import Button from "../../../_components/Button";
import Input from "../../../_components/Input";
import { requestPasswordReset } from "../../../../lib/api/auth";
import AuthLogo from "../../login/_components/AuthLogo";

const schema = z.object({
    email: z.email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data: FormValues) {
        try {
            await requestPasswordReset({ email: data.email });
            setSubmitted(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not send the reset link");
        }
    }

    return (
        <div className="flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-12 max-w-lg w-full mx-auto">
            <AuthLogo className="mb-10 lg:hidden" />

            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Forgot password
            </h1>
            <p className="text-sm text-ink-500 mb-8">
                Enter your email and we&apos;ll send you a link to reset it.
            </p>

            {submitted ? (
                <div className="space-y-4">
                    <div className="px-4 py-3 rounded-md bg-success-50 border border-success-500/30 text-sm text-success-700">
                        We&apos;ve sent a password reset link to your email.
                    </div>
                    <p className="text-sm text-ink-500">
                        Didn&apos;t get it? Check your spam folder, or try again in a few minutes.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={isSubmitting}
                        className="mt-2"
                    >
                        Send reset link
                    </Button>
                </form>
            )}

            <p className="text-sm text-center text-ink-500 mt-6">
                Remembered it?{" "}
                <Link
                    href="/login"
                    className="font-medium text-cobalt-500 hover:text-cobalt-700 transition-colors"
                >
                    Back to login
                </Link>
            </p>
        </div>
    );
}
