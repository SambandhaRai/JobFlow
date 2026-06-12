import BackButton from "../../_components/BackButton";
import LeftPanel from "../employer-login/_components/LeftPanel";
import EmployerSignUpForm from "./_components/EmployerSignUpForm";

export default function EmployerSignUpPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel
                eyebrow="Built for hiring teams"
                heading="Start hiring student talent today."
                body="Create an account, post your first role, and start reviewing applicants in minutes."
                variant="signup"
            />
            <main className="relative flex flex-1 lg:w-1/2">
                <BackButton fallbackHref="/employer-login" className="absolute left-6 top-6 z-10" />
                <EmployerSignUpForm />
            </main>
        </div>
    );
}
