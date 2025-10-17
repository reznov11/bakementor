"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/i18n/provider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const loginSchema = z.object({
    email: z.string().email(t("login_page.errors.invalidEmail")),
    password: z.string().min(8, t("login_page.errors.invalidPassword")),
  });
  type LoginValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      await login(values);
      const redirectTo = searchParams.get("next") || "/dashboard";
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setError("We could not sign you in. Please check your credentials and try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-50 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-surface-200 bg-white p-8 shadow-subtle">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-surface-900">{t('login_page.title')}</h1>
          <p className="mt-2 text-sm text-surface-600">{t('login_page.subtitle')}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">{t('login_page.emailLabel')}</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('login_page.emailPassword')}</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {error && <Alert variant="warning" message={error} />}

          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting ? t("login_page.loading") : t("login_page.signInButton")}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-surface-500">
          {t("login_page.helpText")}
          <Link href="mailto:it-support@company.com" className="text-primary-600">
            {t("login_page.adminTeam")}
          </Link>.
        </p>
      </div>
    </main>
  );
}
