"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePage } from "@/features/pages/hooks";
import { useTranslations } from "@/i18n/provider";

export default function NewPage() {
  const router = useRouter();
  const createPage = useCreatePage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const t = useTranslations();

  const handleCreate = async () => {
    const page = await createPage.mutateAsync({
      title,
      description,
      tags: [],
      initial_version: {
        title,
        notes: "Initial draft",
        component_tree: { type: "hero", props: { heading: title, description } },
      },
    });
    router.push(`/builder/${page.id}`);
  };

  return (
    <AppShell title={t("builder.createNew")}>
      <div className="max-w-xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">{t("builder.pageTitle")}</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} 
          placeholder={t("builder.pageTitleText")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("builder.pageDescription")}</Label>
          <Input
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("builder.pageDesciptionText")}
          />
        </div>
        <Button onClick={handleCreate} disabled={!title || createPage.isPending}>
          {createPage.isPending ? t("builder.savingPage") : t("builder.savePage")}
        </Button>
      </div>
    </AppShell>
  );
}
