"use client";

import { ToastContainer } from "react-toastify";

import { useTheme } from "../../context/ThemeContext";

export default function Toaster() {
    const { theme } = useTheme();
    return <ToastContainer position="top-right" autoClose={2500} theme={theme} />;
}
