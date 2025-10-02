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

const loginSchema = z.object({
  email: z.string().email("Enter a valid corporate email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
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
          <h1 className="text-2xl font-semibold text-surface-900">Sign in to BakeMentor</h1>
          <p className="mt-2 text-sm text-surface-600">Use your company credentials to access the builder.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {error && <Alert variant="warning" message={error} />}

          <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-surface-500">
          Need access? Contact the <Link href="mailto:it-support@company.com" className="text-primary-600">admin team</Link>.
        </p>
      </div>
    </main>
  );
}
