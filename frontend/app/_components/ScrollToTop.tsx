"use client";

import { useEffect, useLayoutEffect } from "react";

// Reset scroll before the browser paints on the client (so there's no visible
// jump), but fall back to useEffect during SSR to avoid React's
// "useLayoutEffect does nothing on the server" warning.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface ScrollToTopProps {
    /** Re-runs the reset whenever this changes (e.g. the job id). */
    trigger?: string;
}

export default function ScrollToTop({ trigger }: ScrollToTopProps) {
    useIsomorphicLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [trigger]);

    return null;
}
