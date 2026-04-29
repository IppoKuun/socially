"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 50;

function normalizeSearchQuery(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, SEARCH_MAX_LENGTH);
}

export default async function submitSearch(formData: FormData) {
  const locale = await getLocale();
  const session = await getSession();
  const query = normalizeSearchQuery(formData.get("query"));

  if (!session) {
    redirect({ href: "/login", locale });
    return;
  }

  if (!query || query.length < SEARCH_MIN_LENGTH) {
    redirect({ href: "/search", locale });
  }

  const user = await myPrisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (user) {
    await myPrisma.$transaction(async (tx) => {
      await tx.searchHistory.deleteMany({
        where: { userId: user.id, query },
      });

      await tx.searchHistory.create({
        data: { userId: user.id, query },
      });

      const oldSearches = await tx.searchHistory.findMany({
        where: { userId: user.id },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        skip: 10,
      });

      if (oldSearches.length > 0) {
        await tx.searchHistory.deleteMany({
          where: { id: { in: oldSearches.map((search) => search.id) } },
        });
      }
    });
  }

  redirect({
    href: `/search?q=${encodeURIComponent(query)}`,
    locale,
  });
}
