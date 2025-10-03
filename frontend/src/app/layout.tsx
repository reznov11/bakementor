import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | BakeMentor",
    default: "BakeMentor Builder",
  },
  description: "Internal page builder platform for creating and publishing marketing pages.",
  icons: {
    icon: "/favicon.svg",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
  params?: { locale?: string };
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const locale = (params?.locale as string) ?? "ru";

  let messages: Record<string, unknown> = {};
  try {
    // load messages for the selected locale
    messages = await import(`../locales/${locale}.json`).then((m) => m.default || m);
  } catch {
    // fall back to Russian if locale not found
    messages = await import("../locales/ru.json").then((m) => m.default || m);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-50 text-surface-900`}>
        <Providers locale={locale} messages={messages}>{children}</Providers>
      </body>
    </html>
  );
}
