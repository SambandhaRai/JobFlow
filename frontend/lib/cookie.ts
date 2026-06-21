"use server";

import { cookies } from "next/headers";

const AUTH_TOKEN_COOKIE = "auth_token";
const USER_DATA_COOKIE = "user_data";
const USER_LOCATION_COOKIE = "user_location";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: AUTH_TOKEN_COOKIE,
        value: token,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
    });
};

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
    return token || null;
};

export const setUserData = async (userData: unknown) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: USER_DATA_COOKIE,
        value: JSON.stringify(userData),
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
    });
};

export const getUserData = async () => {
    const cookieStore = await cookies();
    const userData = cookieStore.get(USER_DATA_COOKIE)?.value;

    if (!userData) return null;

    try {
        return JSON.parse(userData);
    } catch {
        return null;
    }
};

export type UserLocationCookie = {
    lat: number;
    lng: number;
    ts: number;
};

export const setUserLocation = async (lat: number, lng: number) => {
    const cookieStore = await cookies();
    const payload: UserLocationCookie = {
        lat,
        lng,
        ts: Date.now(),
    };

    cookieStore.set({
        name: USER_LOCATION_COOKIE,
        value: JSON.stringify(payload),
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
    });
};

export const getUserLocation = async (): Promise<UserLocationCookie | null> => {
    const cookieStore = await cookies();
    const raw = cookieStore.get(USER_LOCATION_COOKIE)?.value;

    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as UserLocationCookie;

        if (
            typeof parsed.lat !== "number" ||
            typeof parsed.lng !== "number"
        ) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};

export const clearUserLocation = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(USER_LOCATION_COOKIE);
};

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE);
    cookieStore.delete(USER_DATA_COOKIE);
    cookieStore.delete(USER_LOCATION_COOKIE);
};
