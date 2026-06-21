"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: React.ReactNode;
    error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className = "", id, checked, ...props }, ref) => {
        const checkboxId = id ?? (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

        return (
            <div className="flex flex-col gap-1">
                <label
                    htmlFor={checkboxId}
                    className="flex items-start gap-2.5 cursor-pointer group"
                >
                    <div className="relative mt-0.5 shrink-0">
                        <input
                            ref={ref}
                            id={checkboxId}
                            type="checkbox"
                            checked={checked}
                            className="sr-only peer"
                            {...props}
                        />
                        <div
                            className={[
                                "w-4 h-4 rounded border transition-colors duration-150 flex items-center justify-center",
                                checked
                                    ? "bg-cobalt-500 border-cobalt-500"
                                    : "bg-surface border-ink-200 group-hover:border-cobalt-400",
                                error ? "border-danger-500" : "",
                                className,
                            ].join(" ")}
                        >
                            {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                        </div>
                    </div>
                    {label && (
                        <span className="text-sm text-ink-700 leading-snug">
                            {label}
                        </span>
                    )}
                </label>
                {error && (
                    <p className="text-xs text-danger-700 ml-6">{error}</p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
