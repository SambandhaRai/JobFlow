import Link from "next/link";
import Image from "next/image";

import AuthLogo from "../../login/_components/AuthLogo";

export default function LeftPanel() {
    return (
        <aside className="hidden lg:flex flex-col w-1/2 bg-[#2E5BFF] relative overflow-hidden">
            <Image
                src="/images/signup-left.png"
                alt=""
                fill
                priority
                sizes="50vw"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0A1A60]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-linear-to-br from-[#0A1A60]/75 via-[#1535B8]/25 to-[#0E1116]/65 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-[#0E1116]/85 via-[#0E1116]/35 to-transparent pointer-events-none" />

            <div className="relative z-10 p-10">
                <AuthLogo inverted />
            </div>

            <div className="relative z-10 flex-1 flex items-end px-12 pb-10">
                <div className="max-w-md">
                    <p className="text-white/70 text-sm font-medium mb-3">
                        Built for job seekers
                    </p>
                    <h1 className="text-white text-5xl font-display font-bold leading-none tracking-tight">
                        Find your first role without the noise.
                    </h1>
                    <p className="text-white/75 text-base leading-relaxed mt-5 max-w-sm">
                        Join verified opportunities, beginner-friendly matches, and
                        faster applications in one place.
                    </p>
                </div>
            </div>

            <div className="relative z-10 px-12 pb-10">
                <Link
                    href="/employer-signup"
                    className="flex w-full flex-col rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                    <span className="text-xs font-mono text-white/65 mb-1">
                        Are you an employer?
                    </span>
                    <span className="text-sm font-semibold">
                        Create an employer account -&gt;
                    </span>
                </Link>
            </div>
        </aside>
    );
}
