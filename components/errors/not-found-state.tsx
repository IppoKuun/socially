import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

type NotFoundAction = {
  href: "/feed" | "/search" | "/trending";
  label: string;
};

type NotFoundStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  primaryAction: NotFoundAction;
  secondaryAction?: NotFoundAction;
};

export default function NotFoundState({
  eyebrow,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
}: NotFoundStateProps) {
  return (
    <section className="mx-auto flex min-h-[55svh] w-full max-w-2xl items-center justify-center px-1 py-8">
      <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-8 text-center shadow-[0_26px_90px_-58px_rgba(0,0,0,0.95)] sm:px-8 sm:py-10">
        <span
          className="mx-auto flex size-13 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-primary-glow"
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-manrope text-3xl leading-none tracking-[-0.05em] text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/58">
          {description}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="rounded-full bg-[linear-gradient(180deg,#2f7cff_0%,#6e63ff_100%)] px-5 text-white shadow-[0_20px_40px_-24px_rgba(47,124,255,0.78)] hover:opacity-95"
          >
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>

          {secondaryAction ? (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 bg-transparent px-5 text-white hover:bg-white/[0.06]"
            >
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
