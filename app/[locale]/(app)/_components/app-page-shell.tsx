import { cn } from "@/lib/utils";

type AppPageShellProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export default function AppPageShell({
  title,
  description,
  children,
  className,
}: AppPageShellProps) {
  return (
    <main className={cn("flex flex-col gap-6", className)}>
      <header className="space-y-2 px-1">
        <h1 className="font-manrope text-[2rem] leading-none tracking-[-0.04em] text-white sm:text-[2.2rem]">
          {title}
        </h1>
        <p className="max-w-xl text-sm leading-6 text-white/50 sm:text-[0.95rem]">
          {description}
        </p>
      </header>

      {children}
    </main>
  );
}
