"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import AuthRequiredDialog from "@/components/auth/AuthRequiredDialog";
import { Button } from "@/components/ui/button";

type AuthRequiredPromptProps = {
  title?: string;
  description?: string;
};

export default function AuthRequiredPrompt({
  title,
  description,
}: AuthRequiredPromptProps) {
  const t = useTranslations("authRequiredDialog");
  const [open, setOpen] = useState(true);

  // On créer une page pour affiché un vrai bloc d'UI a la place de la page, ce composant sera dans les
  // page entierement privée, si user nas pas de session.
  // On ne peut pas mettre uniquement composant Dialog car c'est un Dialog
  // et pas un bloc d'UI qui peut remplacé le vrai contenu d'une page.//
  return (
    <>
      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-8 text-center shadow-[0_26px_90px_-58px_rgba(0,0,0,0.95)]">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary-glow"
          aria-hidden="true"
        >
          <LockKeyhole className="size-5" />
        </span>
        <h2 className="mt-4 font-manrope text-2xl leading-none tracking-[-0.04em] text-white">
          {title ?? t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/58">
          {description ?? t("description")}
        </p>
        <Button
          type="button"
          className="mt-5 rounded-full bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95"
          onClick={() => setOpen(true)}
        >
          <LogIn className="size-4" />
          {t("action")}
        </Button>
      </section>

      <AuthRequiredDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
      />
    </>
  );
}
