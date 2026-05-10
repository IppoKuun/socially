import { Category } from "@prisma/client";

export const DISCOVER_CATEGORIES = Object.values(Category);

export function getCategoryFromSlug(slug: string) {
  const category = slug.toUpperCase().replaceAll("-", "_") as Category;

  return DISCOVER_CATEGORIES.includes(category) ? category : null;
}

export function getCategorySlug(category: Category) {
  return category;
}

export function getCategoryLabel(category: Category) {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
