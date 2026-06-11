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
        // pb leaves room for the absolutely-positioned labels below each circle.
        <div className="flex w-full items-start pb-6">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div
                        key={step.label}
                        className={[
                            "flex items-center",
                            isLast ? "flex-none" : "flex-1",
                        ].join(" ")}
                    >
                        {/* Node: fixed-width circle with the label centered beneath it.
                            Keeping the label absolute means every node is exactly the
                            circle's width, so the circles distribute evenly and the
                            middle step stays centered regardless of label length. */}
                        <div className="relative flex shrink-0 flex-col items-center">
                            <div
                                className={[
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-200",
                                    isCompleted
                                        ? "border-cobalt-500 bg-cobalt-500 text-white"
                                        : isActive
                                        ? "border-cobalt-500 bg-surface text-cobalt-600"
                                        : "border-ink-200 bg-surface text-ink-400",
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
                                    "absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-xs font-medium",
                                    isActive ? "text-ink-900" : "text-ink-400",
                                ].join(" ")}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line, vertically centered on the circle */}
                        {!isLast && (
                            <div
                                className="mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200"
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
