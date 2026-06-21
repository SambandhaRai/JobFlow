import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
    currentLength?: number;
    maxLength?: number;
    showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            hint,
            currentLength,
            maxLength,
            showCount = false,
            className = "",
            id,
            ...props
        },
        ref
    ) => {
        const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor={textareaId}
                            className="text-sm font-medium text-ink-700"
                        >
                            {label}
                        </label>
                        {showCount && maxLength !== undefined && (
                            <span className="text-xs text-ink-400">
                                {currentLength ?? 0} / {maxLength} chars
                                {props.required === false && " · optional"}
                            </span>
                        )}
                    </div>
                )}
                <textarea
                    ref={ref}
                    id={textareaId}
                    maxLength={maxLength}
                    className={[
                        "w-full px-3 py-2.5 text-sm text-ink-900 bg-surface border rounded-md outline-none transition-colors duration-150 placeholder:text-ink-400 resize-none min-h-[100px]",
                        "focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100",
                        error
                            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-50"
                            : "border-ink-200",
                        className,
                    ].join(" ")}
                    {...props}
                />
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

Textarea.displayName = "Textarea";

export default Textarea;
