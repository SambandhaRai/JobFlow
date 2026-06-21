import BackButton from "../../_components/BackButton";
import LeftPanel from "./_components/LeftPanel";
import SignUpForm from "./_components/SignUpForm";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/" className="absolute left-6 top-6 z-10" />
                <SignUpForm />
            </main>
        </div>
    );
}
