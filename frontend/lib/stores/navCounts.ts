"use client";

// Tiny client-side store for the sidebar's nav badges (saved jobs, applications).
//
// The sidebar fetches these counts once on mount, so an action taken elsewhere
// on the same page — saving a job, applying — used to leave the badge stale
// until a full page reload. Actions now push a delta in here and the sidebar,
// subscribed via useSyncExternalStore, re-renders instantly. The next time the
// sidebar mounts it re-fetches and overwrites this with the server's truth, so
// optimistic deltas can never drift for long.

export type NavCounts = {
    saved?: number;
    applications?: number;
};

type Listener = () => void;

// Stable empty reference: both the server snapshot and the initial client
// snapshot return this so useSyncExternalStore sees no change on hydration.
const EMPTY: NavCounts = {};

let counts: NavCounts = EMPTY;
const listeners = new Set<Listener>();

const emit = () => {
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const getSnapshot = () => counts;

// Replace counts with freshly fetched values (sidebar mount).
const set = (next: NavCounts) => {
    counts = { ...counts, ...next };
    emit();
};

const adjust = (key: keyof NavCounts, delta: number) => {
    const current = counts[key];
    // Skip until the first real fetch lands — we don't want to invent a count.
    if (typeof current !== "number") return;
    counts = { ...counts, [key]: Math.max(0, current + delta) };
    emit();
};

export const navCountsStore = {
    subscribe,
    getSnapshot,
    getServerSnapshot: () => EMPTY,
    set,
    adjustSaved: (delta: number) => adjust("saved", delta),
    adjustApplications: (delta: number) => adjust("applications", delta),
};
