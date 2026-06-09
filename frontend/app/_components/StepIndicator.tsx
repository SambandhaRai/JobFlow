import { Check } from "lucide-react";

interface Step {
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number; // 1-indexed
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-start w-full">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.label} className="flex items-start flex-1 last:flex-none">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={[
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-200",
                                    isCompleted
                                        ? "bg-cobalt-500 border-cobalt-500 text-white"
                                        : isActive
                                        ? "bg-surface border-cobalt-500 text-cobalt-600"
                                        : "bg-surface border-ink-200 text-ink-400",
                                ].join(" ")}
                            >
                                {isCompleted ? (
                                    <Check size={14} strokeWidth={2.5} />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            <span
                                className={[
                                    "text-xs font-medium whitespace-nowrap",
                                    isActive
                                        ? "text-ink-900"
                                        : "text-ink-400",
                                ].join(" ")}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div className="flex-1 h-0.5 mt-4 mx-2 transition-colors duration-200 rounded-full"
                                style={{
                                    backgroundColor: isCompleted
                                        ? "var(--color-cobalt-500)"
                                        : "var(--color-ink-200)",
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
