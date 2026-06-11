interface WelcomeBannerProps {
    firstName: string;
}

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

export default function WelcomeBanner({ firstName }: WelcomeBannerProps) {
    return (
        <section className="rounded-lg border border-cobalt-100 bg-cobalt-50 px-6 py-5">
            <p className="font-display text-2xl font-semibold tracking-tight text-cobalt-600">
                {getGreeting()}, {firstName} 👋
            </p>
            <p className="mt-1 text-sm text-cobalt-700/80">
                Every role below is verified — picked for students and early-career applicants.
            </p>
        </section>
    );
}
