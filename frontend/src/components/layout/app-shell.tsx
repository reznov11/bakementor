"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Moon, Plus, Settings, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useTranslations } from "@/i18n/provider";

interface AppShellProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, action, children }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const t = useTranslations();

  const navLinks = [
    { href: "/dashboard", label: t('dashboard.navbar.home') },
    { href: "/analytics", label: t('dashboard.navbar.analytics') },
    { href: "/media", label: t('dashboard.navbar.media') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-primary-600">
              BakeMentor
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition ${
                      isActive ? "text-primary-600" : "text-surface-500 hover:text-primary-500"
                    }`}
                  >
                    {t(link.label)}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/builder/new"
              className="hidden items-center gap-2 rounded-lg border border-dashed border-primary-300 px-3 py-2 text-sm font-medium text-primary-600 transition hover:border-primary-500 hover:text-primary-700 md:inline-flex"
            >
              <Plus className="h-4 w-4" /> {t("builder.createNew")}
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
              <Link href="/menu">
                <Menu className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? t("builder.switchToLight") : t("builder.switchToDark")}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-surface-800">{user?.first_name || user?.email}</span>
              <span className="text-xs text-surface-500">{user?.role?.toUpperCase()}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title={t("builder.signOut")}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900">{title}</h1>
            <p className="text-sm text-surface-500">{t("builder.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            {action}
            <Button variant="secondary" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
