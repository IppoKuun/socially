// components/onboarding/StepAnimator.tsx
"use client"; // INDISPENSABLE pour Framer Motion

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  step: number | undefined;
  children: React.ReactNode;
}

export function StepAnimator({ step, children }: Props) {
  return (
    // mode="wait" attend que l'ancienne page soit sortie avant de faire entrer la nouvelle
    <AnimatePresence mode="wait">
      <motion.div
        key={step} // LE SECRET EST ICI : Quand la clé change, Framer Motion lance l'animation
        initial={{ opacity: 0, x: 20 }} // Départ : un peu à droite et invisible
        animate={{ opacity: 1, x: 0 }} // Arrivée : au centre et visible
        exit={{ opacity: 0, x: -20 }} // Sortie : glisse vers la gauche et disparaît
        transition={{ duration: 0.3, ease: "easeInOut" }} // Rapide et fluide
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
