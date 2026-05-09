"use client";

import { cookiesResponseAction } from "../actions";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { captureAppException } from "@/lib/monitoring/sentry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  refere?: string | null;
  language?: string | null;
};
export default function CookiesConsentBanner({ refere, language }: Props) {
  const t = useTranslations("cookies");
  const sp = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(true);

  const sections = [
    {
      title: t("sections.whatChanges.title"),
      items: [
        t("sections.whatChanges.item1"),
        t("sections.whatChanges.item2"),
        t("sections.whatChanges.item3"),
      ],
    },
    {
      title: t("sections.ifYouDecline.title"),
      items: [
        t("sections.ifYouDecline.item1"),
        t("sections.ifYouDecline.item2"),
        t("sections.ifYouDecline.item3"),
      ],
    },
    {
      title: t("sections.commitment.title"),
      items: [
        t("sections.commitment.item1"),
        t("sections.commitment.item2"),
        t("sections.commitment.item3"),
      ],
    },
  ];

  const utm_source = sp.get("utm_source") as string | undefined;
  const utm_medium = sp.get("utm_medium") as string | undefined;
  const utm_campaign = sp.get("utm_campaign") as string | undefined;

  const payload = {
    utm_source,
    utm_medium,
    utm_campaign,
    refere,
    language,
  };

  async function handleConsent(consent: boolean) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await cookiesResponseAction(consent, consent ? payload : undefined);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save cookie consent", error);
      captureAppException(error, {
        feature: "privacy",
        action: "save_cookie_consent",
        level: "warning",
        extra: {
          consent,
          hasPayload: Boolean(consent ? payload : undefined),
        },
      });
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="w-full max-w-[calc(100%-1.25rem)]  overflow-hidden border  border-white/10 bg-[linear-gradient(180deg,rgba(18,21,28,0.98)_0%,rgba(11,15,22,0.98)_100%)] p-0 text-foreground shadow-[0_32px_90px_-38px_rgba(0,0,0,0.92)] sm:max-w-2xl lg:max-w-[880px]"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-glow">
            Socially
          </p>
          <DialogTitle className="mt-2 text-[1.55rem] leading-none text-white sm:text-[1.85rem]">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm leading-6 text-text-muted sm:text-[0.95rem]">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[min(52vh,34rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            {sections.map((s) => (
              <section
                key={s.title}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-primary-glow">
                  {s.title}
                </h3>
                <ul className="space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <p className="text-sm leading-6 text-text-muted">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
        <DialogFooter className="flex-row items-center justify-center gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-8 sm:justify-center sm:px-6">
          <Button
            variant="outline"
            className="h-11 min-w-32 cursor-pointer rounded-xl border-white/10 bg-white/[0.03] text-foreground hover:bg-white/[0.06] hover:text-white"
            onClick={() => handleConsent(false)}
            disabled={isSubmitting}
          >
            {t("decline")}
          </Button>
          <Button
            className="h-11 min-w-40 cursor-pointer rounded-xl bg-primary text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.8)] hover:bg-primary-glow"
            onClick={() => handleConsent(true)}
            disabled={isSubmitting}
          >
            {t("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
