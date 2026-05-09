"use client";
import FollowingFeed from "@/components/feed/followingFeed";
import ForYouFeedClient from "@/components/feed/for-you-feed-client";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

type FeedTabClientProps = {
  isAuthenticated: boolean;
};

export default function FeedTabClient({ isAuthenticated }: FeedTabClientProps) {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">(
    "for-you",
  );

  return (
    <main className=" flex flex-col w-full space-y-4">
      <div className="h-10 rounded-lg w-50 flex self-center flex-row border-[0.1px] overflow-hidden border-slate-600  justify-center items-center text-center bg-surface-light ">
        <button
          onClick={() => setActiveTab("for-you")}
          className="feed-button "
        >
          For You
        </button>
        <Separator
          orientation="vertical"
          className="h-10 bg flex self-center shrink-0"
        />
        <button
          onClick={() => setActiveTab("following")}
          className="feed-button "
        >
          Following
        </button>
      </div>

      {activeTab === "following" ? (
        <FollowingFeed isAuthenticated={isAuthenticated} />
      ) : (
        <ForYouFeedClient isAuthenticated={isAuthenticated} />
      )}
    </main>
  );
}
