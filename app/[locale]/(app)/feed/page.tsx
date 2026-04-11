import { getTranslations } from "next-intl/server";

import AppPageShell from "../_components/app-page-shell";

const previewPosts = [
  {
    author: "Sarah Chen",
    handle: "@sarahdesigns",
    title: "Modern Architecture Concept",
    excerpt:
      "A calm placeholder feed card to keep the new shell visually grounded while the real feed is built.",
  },
  {
    author: "Marcus Rivera",
    handle: "@marcustech",
    title: "Morning Productivity Setup",
    excerpt:
      "The authenticated shell is now live. Real post queries and interactions will replace these previews in a later ticket.",
  },
  {
    author: "Emma Watson",
    handle: "@emmawanders",
    title: "Into the Wild Mountains",
    excerpt:
      "This route stays usable right away, which lets the navigation shell be validated end to end on desktop and mobile.",
  },
];

export default async function FeedPage() {
  const t = await getTranslations("appShell.pages.feed");

  return (
    <AppPageShell title={t("title")} description={t("description")}>
      <section className="space-y-4">
        {previewPosts.map((post) => (
          <article
            key={post.title}
            className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,26,33,0.98),rgba(20,22,29,0.98))] px-5 py-5 shadow-[0_28px_80px_-54px_rgba(0,0,0,0.98)]"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-11 w-11 rounded-full bg-[linear-gradient(180deg,#3a7cff,#8746ff)]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {post.author}
                </p>
                <p className="truncate text-xs text-white/38">{post.handle}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <h2 className="font-manrope text-[1.35rem] tracking-[-0.03em] text-white">
                {post.title}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/52">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </section>
    </AppPageShell>
  );
}
