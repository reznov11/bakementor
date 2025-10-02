import Link from "next/link";
import { ArrowRight, LayoutDashboard, Layers3, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Drag-and-drop builder",
      description: "Compose landing pages from reusable components with live preview and responsive controls.",
      icon: <Layers3 className="h-8 w-8 text-primary-500" />, 
    },
    {
      title: "Version control",
      description: "Track every iteration, compare drafts, and restore previous versions instantly.",
      icon: <LayoutDashboard className="h-8 w-8 text-primary-500" />, 
    },
    {
      title: "Secure publishing",
      description: "Role-based access with audit trails ensures only approved content goes live.",
      icon: <ShieldCheck className="h-8 w-8 text-primary-500" />, 
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-16 px-6 py-24">
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1 text-sm font-medium text-primary-600">
          Intranet tool
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-surface-900 sm:text-5xl">
          Build bespoke landing pages in minutes, no code required.
        </h1>
        <p className="mt-4 text-lg text-surface-600">
          BakeMentor empowers marketing teams to design, preview, and publish high-converting pages without developer
          handoffs. Keep everything on our infrastructure and push live with confidence.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 font-medium text-white shadow-subtle transition hover:bg-primary-700"
          >
            Sign in to Builder <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border border-surface-200 px-6 py-3 font-medium text-surface-700 transition hover:border-primary-200 hover:text-primary-600"
          >
            Platform docs
          </Link>
        </div>
      </section>

      <section className="grid w-full gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex h-full flex-col rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
              {feature.icon}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-surface-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-surface-600">{feature.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
