import LeftPanel from "./_components/LeftPanel";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex bg-surface">
            <LeftPanel />
            <main className="flex flex-1 lg:w-1/2">
                <LoginForm />
            </main>
        </div>
    );
}
