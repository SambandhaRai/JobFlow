import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-cobalt-500 text-white hover:bg-cobalt-600 active:bg-cobalt-700 disabled:bg-cobalt-300 disabled:cursor-not-allowed",
    secondary:
        "bg-transparent text-cobalt-600 border border-cobalt-500 hover:bg-cobalt-50 active:bg-cobalt-100 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
        "bg-transparent text-ink-600 hover:bg-ink-50 active:bg-ink-100 disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
        "bg-danger-500 text-white hover:bg-danger-700 active:bg-danger-700 disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm gap-1.5 rounded-[var(--radius-sm)]",
    md: "h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]",
    lg: "h-12 px-6 text-base gap-2 rounded-[var(--radius-md)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            iconLeft,
            iconRight,
            fullWidth = false,
            disabled,
            children,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={[
                    "inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-500",
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth ? "w-full" : "",
                    className,
                ].join(" ")}
                {...props}
            >
                {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    iconLeft
                )}
                {children}
                {!loading && iconRight}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
