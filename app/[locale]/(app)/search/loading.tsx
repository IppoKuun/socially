import AppPageShell from "../_components/app-page-shell";

export default function SearchLoading() {
  return (
    <AppPageShell title="Search" description="Search profiles and posts.">
      <section className="space-y-5">
        <div className="h-16 rounded-lg border border-white/10 bg-white/[0.03]" />

        <section className="space-y-3">
          <div className="h-5 w-24 rounded bg-white/10" />
          <div className="h-20 rounded-lg bg-white/[0.04]" />
          <div className="h-20 rounded-lg bg-white/[0.04]" />
          <div className="h-20 rounded-lg bg-white/[0.04]" />
        </section>

        <section className="space-y-3">
          <div className="h-5 w-16 rounded bg-white/10" />
          <div className="h-44 rounded-lg bg-white/[0.04]" />
          <div className="h-44 rounded-lg bg-white/[0.04]" />
        </section>
      </section>
    </AppPageShell>
  );
}
