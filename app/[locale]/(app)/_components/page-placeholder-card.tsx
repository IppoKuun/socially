type PagePlaceholderCardProps = {
  message: string;
};

export default function PagePlaceholderCard({
  message,
}: PagePlaceholderCardProps) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.96),rgba(18,20,27,0.96))] p-6 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.95)]">
      <div className="rounded-[22px] border border-dashed border-white/10 bg-black/18 px-5 py-8 text-sm leading-6 text-white/60">
        {message}
      </div>
    </section>
  );
}
