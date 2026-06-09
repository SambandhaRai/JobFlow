import LeftPanel from "./_components/LeftPanel";
import SignUpForm from "./_components/SignUpForm";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="flex flex-1 lg:w-1/2">
                <SignUpForm />
            </main>
        </div>
    );
}
