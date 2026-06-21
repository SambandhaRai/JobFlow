"use client";


export type NavCounts = {
    saved?: number;
    applications?: number;
};

type Listener = () => void;

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

const set = (next: NavCounts) => {
    counts = { ...counts, ...next };
    emit();
};

const adjust = (key: keyof NavCounts, delta: number) => {
    const current = counts[key];
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
