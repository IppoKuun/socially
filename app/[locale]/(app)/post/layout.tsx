"use client";
//app/local/(app)/post/layout.tsx//
import QueryProvider from "@/components/providers/query-provider";

export default function PostRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
