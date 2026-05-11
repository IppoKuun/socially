"use client";
import { useState, useActionState } from "react";
import { stepTwoValidOnboarding, stepFormState } from "../_actions/actions";
import { Category } from "@prisma/client";
import { useTranslations } from "next-intl";
import {
  Cpu,
  BriefcaseBusiness,
  UsersRound,
  Landmark,
  GraduationCap,
  HeartPulse,
  Trophy,
  Film,
  Palette,
  LucideIcon,
} from "lucide-react";
import { ToggleGroupItem, ToggleGroup } from "@/components/ui/toggle-group";

const categoryIcons = {
  TECH: Cpu,
  BUSINESS: BriefcaseBusiness,
  SOCIETY: UsersRound,
  POLITICS: Landmark,
  EDUCATION: GraduationCap,
  HEALTH: HeartPulse,
  SPORTS: Trophy,
  ENTERTAINMENT: Film,
  CULTURE_ARTS: Palette,
} as Record<Category, LucideIcon>;

export default function StepTwo() {
  const [categories, setCategories] = useState<string[]>([]);

  const t = useTranslations("onboarding.stepTwo");

  const initialState: stepFormState = { ok: false, userMsg: "" };
  const [state, formAction, isPending] = useActionState(
    stepTwoValidOnboarding,
    initialState,
  );

  return (
    <main className="flex flex-col  items-center py-4 px-4">
      <form
        action={formAction}
        className="flex min-h-[450px] h-full w-full max-w-[520px] flex-col items-center rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-2 pb-8 backdrop-blur-md lg:relative"
      >
        <div className="flex flex-row">
          <div className="flex flex-col items-center w-full max-w-[480px]">
            <p className="text-xl text-center">{t("intro")}</p>

            {categories?.map((c) => (
              <input key={c} type="hidden" name="categories" value={c} />
            ))}
            <ToggleGroup
              type="multiple"
              value={categories}
              onValueChange={(val) => {
                // 'val' est le tableau des éléments sélectionnés
                if (val) setCategories(val);
              }}
              className="w-full"
            >
              <section className="mt-5 grid w-full grid-cols-2 gap-3 py-2 sm:grid-cols-3 sm:gap-6">
                {" "}
                {Object.entries(categoryIcons).map(([key, CatIcons]) => (
                  <ToggleGroupItem
                    key={key}
                    value={key}
                    className={`flex flex-col items-center justify-center cursor-pointer 
  rounded-2xl px-2 py-12 sm:py-8 transition-all duration-300 group ${
    categories.includes(key)
      ? "bg-blue-600/20 ring-2 ring-blue-500 shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] scale-105 z-10"
      : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:scale-102"
  }`}
                  >
                    <CatIcons className="size-10" />
                    <p className="">{key}</p>
                  </ToggleGroupItem>
                ))}
              </section>
            </ToggleGroup>
          </div>
        </div>

        {state.errors?.categories && (
          <p className="form-error">{state.errors.categories?.[0]} </p>
        )}
        <button
          type="submit"
          formAction={formAction}
          className="btn-primary mt-8 w-full justify-center sm:w-auto lg:absolute lg:-right-80 lg:bottom-0"
          disabled={isPending || categories.length === 0}
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
