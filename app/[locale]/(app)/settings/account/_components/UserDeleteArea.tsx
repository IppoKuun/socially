"use client";

import { useState, useTransition } from "react";
import softDeleteAction from "../../_actions/softDelete";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await softDeleteAction();
      if (!result.ok) {
        toast.error(result.userMsg ?? "Impossible d'effectuer l'action.");
        return;
      }
      toast.success(result.userMsg);
      setOpen(false);
    });
  };
  return (
    <section>
      <h1 className="">Suppression</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Supprimer mon compte</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voulez-vous supprimer votre compte ?</DialogTitle>
            <DialogDescription>
              Votre compte sera désactivé. Vous pourrez annuler la suppression
              pendant 30 jours avant la suppression définitive.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleSubmit}
            >
              {isPending ? "Suppression..." : "Oui, supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
