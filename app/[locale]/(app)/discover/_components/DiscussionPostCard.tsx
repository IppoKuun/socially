import { DiscoverPostCandidate } from "@/lib/discover/queries";

type discussionProps = {
  discussionPost: DiscoverPostCandidate[];
};

export default function DiscussionPostCard({
  discussionPost,
}: discussionProps) {
  return (
    <section className="flex flex-col">
      <section className="grid grid-cols-2">
        {discussionPost.map((post) => (
          <article className="flex flex-col" key={post.id}>
            <h2 className="">{post.title}</h2>
            <p className="truncate">{post.content}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
