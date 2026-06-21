"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, type = "text", className = "", id, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-ink-700"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={[
                            "w-full h-10 px-3 text-sm text-ink-900 bg-surface border rounded-md outline-none transition-colors duration-150 placeholder:text-ink-400",
                            "focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100",
                            error
                                ? "border-danger-500 focus:border-danger-500 focus:ring-danger-50"
                                : "border-ink-200",
                            isPassword ? "pr-10" : "",
                            className,
                        ].join(" ")}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-danger-700">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-xs text-ink-500">{hint}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
