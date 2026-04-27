import { Link } from "@/i18n/routing";
import { Category } from "@prisma/client";
import {
  BriefcaseBusiness,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Landmark,
  Palette,
  Radio,
  Trophy,
  Cpu,
  Icon,
} from "lucide-react";

export const categoriesCard = [
  {
    category: Category.TECH,
    label: "Tech",
    href: `/discover/${Category.TECH}`,
    Icon: Cpu,
  },
  {
    category: Category.BUSINESS,
    label: "Business",
    href: `/discover/${Category.BUSINESS}`,
    Icon: BriefcaseBusiness,
  },
  {
    category: Category.SOCIETY,
    label: "Société",
    href: `/discover/${Category.SOCIETY}`,
    Icon: Radio,
  },
  {
    category: Category.POLITICS,
    label: "Politique",
    href: `/discover/${Category.POLITICS}`,
    Icon: Landmark,
  },
  {
    category: Category.EDUCATION,
    label: "Éducation",
    href: `/discover/${Category.EDUCATION}`,
    Icon: GraduationCap,
  },
  {
    category: Category.HEALTH,
    label: "Santé",
    href: `/discover/${Category.HEALTH}`,
    Icon: HeartPulse,
  },
  {
    category: Category.SPORTS,
    label: "Sport",
    href: `/discover/${Category.SPORTS}`,
    Icon: Trophy,
  },
  {
    category: Category.ENTERTAINMENT,
    label: "Divertissement",
    href: `/discover/${Category.ENTERTAINMENT}`,
    Icon: Clapperboard,
  },
  {
    category: Category.CULTURE_ARTS,
    label: "Culture & arts",
    href: `/discover/${Category.CULTURE_ARTS}`,
    Icon: Palette,
  },
] as const;

export default function CategoryCard() {
  return (
    <div className=" grid grid-cols-3 gap-3">
      {categoriesCard.map((cat) => {
        const Icon = cat.Icon;

        return (
          <Link href={cat.href} className="w-full h-full" key={cat.category}>
            <div
              className="flex flex-col items-center  border border-white/10   shadow-[0_18px_45px_-32px_rgba(0,0,0,0.9)]
  transition duration-200 ease-out w-full h-[112px]

  hover:border-primary/40 hover:bg-white/[0.07]
  hover:shadow-[0_22px_55px_-34px_rgba(47,124,255,0.35)]  justify-center gap-2 rounded-xl bg-white/[0.04] cursor-pointer"
            >
              <Icon size={35} />
              <p className="font-manrope text-white/60">{cat.category}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
