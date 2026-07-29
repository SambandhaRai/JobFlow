"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

/**
 * The Google sign-in callback redirects here with ?signed_in=1 after setting
 * the auth cookies server-side. Unlike the email login (which toasts from the
 * form before navigating), the OAuth flow never renders a client component on
 * success — so we surface the confirmation here, then strip the param so a
 * refresh doesn't re-toast.
 */
export default function LoginSuccessToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const shown = useRef(false);

    useEffect(() => {
        if (shown.current || !searchParams.get("signed_in")) return;
        shown.current = true;
        toast.success("Login successful");

        const params = new URLSearchParams(searchParams.toString());
        params.delete("signed_in");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
    }, [searchParams, router, pathname]);

    return null;
}
