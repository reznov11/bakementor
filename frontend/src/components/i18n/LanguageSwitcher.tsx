"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LOCALES = [
  { code: "en", label: "English", flag: "/icons/us.svg" },
  { code: "ru", label: "Русский", flag: "/icons/ru.svg" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("ru");

  useEffect(() => {
    // try to infer locale from pathname first: assume leading segment is locale
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0 && (parts[0] === "en" || parts[0] === "ru")) {
      setCurrent(parts[0]);
      return;
    }
    // fallback to saved preference
    try {
      const pref = localStorage.getItem("locale");
      if (pref) setCurrent(pref);
    } catch { }
  }, [pathname]);

  const changeLocale = (locale: string) => {
    // persist
    try {
      localStorage.setItem("locale", locale);
    } catch { }

    // compute new path: if pathname starts with /en or /ru, replace it; otherwise prefix
    const parts = pathname.split("/").filter(Boolean);
    let newPath = "";
    if (parts.length > 0 && (parts[0] === "en" || parts[0] === "ru")) {
      parts[0] = locale;
      newPath = "/" + parts.join("/");
    } else {
      newPath = "/" + locale + pathname;
    }

    // append search params
    const sp = searchParams ? searchParams.toString() : "";
    if (sp) newPath = `${newPath}?${sp}`;

    // set cookie so server-side RootLayout can read it immediately (fallback)
    try {
      document.cookie = `locale=${locale}; path=/`;
    } catch { }

    setCurrent(locale);
    setOpen(false);
    // Use full page navigation to force server-side RootLayout to re-run and load messages for the new locale
    // This avoids relying on client-only routing which may not rehydrate server-loaded translations.
    if (typeof window !== "undefined") {
      window.location.href = newPath;
    } else {
      router.push(newPath);
    }
  };

  return (
    <div className="relative">
      <div className="inline-flex items-center cursor-pointer" onClick={() => setOpen((v) => !v)} title="Change language">
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
        <div className="hidden md:block text-sm hover:text-blue-600">
          {LOCALES.find((l) => l.code === current)?.label}
        </div>
      </div>

      {open && (
        <div className="absolute mt-2 w-40 rounded-md border bg-white shadow-lg">
          <div className="flex flex-col">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                className={`flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-100 ${l.code === current ? "font-semibold" : ""}`}
                onClick={() => changeLocale(l.code)}
              >
                <Image
                  src={l.flag}
                  alt={l.label}
                  width={25}
                  height={25}
                  className="rounded-sm"
                />
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
