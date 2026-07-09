"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";

import Button from "../../../_components/Button";
import Input from "../../../_components/Input";
import { resetPassword } from "../../../../lib/api/auth";
import AuthLogo from "../../login/_components/AuthLogo";

const schema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm({ email }: { email: string }) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data: FormValues) {
        try {
            await resetPassword({
                email,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });
            toast.success("Password reset. Login with your new password");
            router.push("/login");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Password reset failed");
        }
    }

    return (
        <div className="flex flex-col justify-center flex-1 px-8 sm:px-12 lg:px-16 py-12 max-w-lg w-full mx-auto">
            <AuthLogo className="mb-10 lg:hidden" />

            <h1 className="text-2xl font-bold font-display text-ink-900 tracking-tight mb-1">
                Reset password
            </h1>

            {email ? (
                <>
                    <p className="text-sm text-ink-500 mb-8">
                        Choose a new password for <span className="font-medium text-ink-700">{email}</span>.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="New password"
                            type="password"
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />

                        <Input
                            label="Confirm new password"
                            type="password"
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            loading={isSubmitting}
                            className="mt-2"
                        >
                            Reset password
                        </Button>
                    </form>
                </>
            ) : (
                <div className="space-y-4 mt-7">
                    <div className="px-4 py-3 rounded-md bg-danger-50 border border-danger-500/30 text-sm text-danger-700">
                        This reset link is invalid or incomplete.
                    </div>
                    <p className="text-sm text-ink-500">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-cobalt-500 hover:text-cobalt-700 transition-colors"
                        >
                            Request a new reset link
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}
