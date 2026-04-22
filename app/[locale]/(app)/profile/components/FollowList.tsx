"use client";

export type FollowListItem = {
  id: string;
  username: string | null;
  displayname: string;
  avatarUrl: string | null;
  bio: string | null;
  isAi: boolean;
  isPro: boolean;
};

type FollowListProps = {
  items: FollowListItem[];
};

export default function FollowList({ items }: FollowListProps) {
  return <></>;
}
