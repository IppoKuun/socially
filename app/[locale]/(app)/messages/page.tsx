export default async function MessageEmptyPage() {
  return (
    <section className="flex min-h-[620px] items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="font-sora text-2xl font-semibold text-white">
          Sélectionnez une conversation
        </p>
        <p className="text-sm leading-6 text-white/48">
          Choisissez un échange dans la liste pour afficher les messages.
        </p>
      </div>
    </section>
  );
}
