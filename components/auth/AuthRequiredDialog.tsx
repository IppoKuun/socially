"use client";

import { LogIn, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/routing";

type AuthRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  loginHref?: "/login";
};

export default function AuthRequiredDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  loginHref = "/login",
}: AuthRequiredDialogProps) {
  const t = useTranslations("authRequiredDialog");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border border-white/10 bg-[#11161f] p-0 text-white sm:max-w-md">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <DialogHeader className="gap-4">
            <span
              className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary-glow"
              aria-hidden="true"
            >
              <ShieldCheck className="size-5" />
            </span>
            <div className="space-y-2">
              <DialogTitle className="font-manrope text-2xl leading-none tracking-[-0.04em] text-white">
                {title ?? t("title")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/58">
                {description ?? t("description")}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className="border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            asChild
            className="bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95"
          >
            <Link href={loginHref}>
              <LogIn className="size-4" />
              {actionLabel ?? t("action")}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
