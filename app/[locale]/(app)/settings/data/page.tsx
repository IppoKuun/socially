"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingDataPage() {
  const t = useTranslations("settings");
  const [status, setStatus] = useState<"idle" | "pending" | "error" | "succes">(
    "idle",
  );

  const handleExport = async () => {
    setStatus("pending");

    try {
      const response = await fetch("/api/export");

      if (response.status === 429) {
        const data = (await response.json()) as { userMsg?: string };
        setStatus("error");
        toast.error(
          data.userMsg ?? t("dataExport.rateLimitFallback"),
        );
        return;
      }

      if (!response.ok) {
        setStatus("error");
        toast.error(t("dataExport.exportFailed"));
        return;
      }

      // Creation d'un blob pour pour pouvoir téléchargé le lien reçu
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ??
        "socially-export.json";

      // Creation d'un élément HTML téléchargable qui sera l'URL//
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      setStatus("succes");
      toast.success(t("dataExport.exportDownloaded"));
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error(t("dataExport.exportFailed"));
    }
  };
  return (
    <section className="space-y-4">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("dataExport.backToSettings")}
      </Link>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
            <Download className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="font-manrope text-xl font-semibold text-white">
              {t("dataExport.title")}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/55">
              {t("dataExport.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-white">
              {t("dataExport.archiveTitle")}
            </p>
            <p className="text-sm leading-6 text-white/50">
              {t("dataExport.archiveDescription")}
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={status === "pending"}
            className="shrink-0"
          >
            {status === "pending" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("dataExport.preparingShort")}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {t("dataExport.exportButton")}
              </>
            )}
          </Button>
        </div>
      </div>

      {status === "pending" && (
        <p className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          <Loader2 className="size-4 animate-spin" />
          {t("dataExport.preparing")}
        </p>
      )}
      {(status === "pending" || status === "succes") && (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-50/85">
          <h2 className="font-medium text-amber-50">
            {t("dataExport.warningTitle")}
          </h2>
          <p className="mt-2">{t("dataExport.warningRefresh")}</p>
          <p className="mt-1">{t("dataExport.warningUrls")}</p>
        </div>
      )}
    </section>
  );
}
