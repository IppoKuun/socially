"use client";
import FollowingFeed from "@/components/feed/followingFeed";
import ForYouFeedClient from "@/components/feed/for-you-feed-client";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

type FeedTabClientProps = {
  isAuthenticated: boolean;
};

export default function FeedTabClient({ isAuthenticated }: FeedTabClientProps) {
  const [activeTab, setActiveTab] = useState<"for-you" | "following">(
    "for-you",
  );
  const isForYouActive = activeTab === "for-you";
  const isFollowingActive = activeTab === "following";

  return (
    <main className=" flex flex-col w-full space-y-4">
      <div className="h-10 rounded-lg w-50 flex self-center flex-row border-[0.1px] overflow-hidden border-slate-600  justify-center items-center text-center bg-surface-light ">
        <button
          type="button"
          onClick={() => setActiveTab("for-you")}
          aria-pressed={isForYouActive}
          className={cn(
            "feed-button relative text-sm font-medium text-white/60",
            isForYouActive &&
              "bg-[var(--primary-alpha)] text-white shadow-[inset_0_-2px_0_var(--primary)]",
          )}
        >
          For You
        </button>
        <Separator
          orientation="vertical"
          className="h-10 bg flex self-center shrink-0"
        />
        <button
          type="button"
          onClick={() => setActiveTab("following")}
          aria-pressed={isFollowingActive}
          className={cn(
            "feed-button relative text-sm font-medium text-white/60",
            isFollowingActive &&
              "bg-[var(--primary-alpha)] text-white shadow-[inset_0_-2px_0_var(--primary)]",
          )}
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
