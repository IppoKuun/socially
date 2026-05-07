"use client";

import { useState, useTransition } from "react";
import softDeleteAction from "../../_actions/softDelete";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UserDeleteArea() {
  const t = useTranslations("settings");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await softDeleteAction();
      if (!result.ok) {
        toast.error(result.userMsg ?? t("account.delete.fallbackError"));
        return;
      }
      toast.success(result.userMsg);
      setOpen(false);
    });
  };
  return (
    <section className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-manrope text-xl font-semibold text-white">
            {t("account.delete.title")}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-white/55">
            {t("account.delete.description")}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="shrink-0">
              {t("account.delete.trigger")}
            </Button>
          </DialogTrigger>

          <DialogContent className="p-4">
            <DialogHeader>
              <DialogTitle>{t("account.delete.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("account.delete.dialogDescription")}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  {t("account.delete.cancel")}
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending
                  ? t("account.delete.pending")
                  : t("account.delete.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
