import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobFlow",
  description: "Find your next opportunity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <ToastContainer position="top-right" autoClose={2500} />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
