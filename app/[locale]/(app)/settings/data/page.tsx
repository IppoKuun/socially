"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingDataPage() {
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
          data.userMsg ?? "Vous avez atteint la limite d'export de données.",
        );
        return;
      }

      if (!response.ok) {
        setStatus("error");
        toast.error("Export échoué");
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
      toast.success("Export téléchargé");
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error("Export échoué");
    }
  };
  return (
    <section className="">
      <h1 className="">Exportez mes données</h1>
      <p className="">Attention, disponible uniquement 1 fois par semaines</p>
      {status === "pending" && (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Préparation de votre archive...
        </>
      )}
      <Button onClick={handleExport} disabled={status === "pending"} />
      {status === "pending" ||
        (status === "succes" && (
          <>
            <h2 className="">Attention:</h2>
            <p className="">
              - Veuillez a ne pas rafraichir la page pour ne pas perdre les
              donnèes Vous ne pouvez effectuez cette action quune fois par
              semaine
            </p>
            <p className="">- Certains URL ne peuvent plus etre dispo car s</p>
          </>
        ))}
    </section>
  );
}
