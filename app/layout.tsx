import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "@/lib/store/Provider";
import { Notification } from "@/components/Notification";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Craft CRM - Business Management System",
  description: "A comprehensive business management system with sales, inventory, and financial tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-secondary`}
      >
        <Provider>
          <ThemeProvider>
            {children}
            <Notification />
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
