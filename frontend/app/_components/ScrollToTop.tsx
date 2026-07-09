"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface ScrollToTopProps {
    trigger?: string;
}

export default function ScrollToTop({ trigger }: ScrollToTopProps) {
    useIsomorphicLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [trigger]);

    return null;
}
