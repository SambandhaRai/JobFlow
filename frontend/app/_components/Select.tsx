import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, placeholder, error, hint, className = "", id, ...props }, ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-ink-700"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={[
                            "w-full h-10 pl-3 pr-9 text-sm text-ink-900 bg-surface border rounded-md outline-none appearance-none transition-colors duration-150 cursor-pointer",
                            "focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100",
                            error
                                ? "border-danger-500"
                                : "border-ink-200",
                            className,
                        ].join(" ")}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                    />
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

Select.displayName = "Select";

export default Select;
