"use client";
import {
  FieldDescription,
  FieldSet,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { stepFormState, stepThreeValidOnboarding } from "../_actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  MessageSquareMore,
  PenSquare,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useState, useActionState } from "react";
import { useTranslations } from "next-intl";

export default function StepFinal() {
  const t = useTranslations("onboarding.stepThree");

  // Array sert a dire tableau d'objets //
  const intentOptions: Array<{
    id: string;
    name: string;
    label: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      id: "publish",
      name: "PUBLISH",
      label: t("options.publish.label"),
      description: t("options.publish.description"),
      icon: PenSquare,
    },
    {
      id: "debate",
      name: "DEBATE",
      label: t("options.debate.label"),
      description: t("options.debate.description"),
      icon: MessageSquareMore,
    },
    {
      id: "network",
      name: "NETWORK",
      label: t("options.network.label"),
      description: t("options.network.description"),
      icon: UsersRound,
    },
    {
      id: "read",
      name: "READ",
      label: t("options.read.label"),
      description: t("options.read.description"),
      icon: BookOpen,
    },
  ];

  const [intent, setIntent] = useState<string | null>(null);

  const initialState: stepFormState = { ok: false, userMsg: "" };

  const [state, formAction, isPending] = useActionState(
    stepThreeValidOnboarding,
    initialState,
  );

  return (
    <main className=" flex w-full  h-full p-4 flex-col items-center">
      <form
        action={formAction}
        className="flex min-h-[530px] relative h-full w-full max-w-[520px] flex-col justify-center items-center rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 py-12 backdrop-blur-md"
      >
        {intent && <input type="hidden" name="intent" value={intent} />}
        <div className="flex w-full max-w-[480px] flex-col items-center">
          <FieldDescription className="max-w-[38ch] absolute top-5 text-center text-sm text-white/55">
            {t("description")}
          </FieldDescription>

          <FieldSet className="mt-8 w-full">
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              {intentOptions.map(
                // Ici ont prends chaque objet dans le tableau et on extrait ces propriété car ont vas les manipuler  //

                ({ id, name, label, description, icon: Icon }) => {
                  const isSelected = intent === name;
                  const hasError = Boolean(state.errors?.intent) && !isSelected;

                  // Obligé de mettre un return car on a fait du JS pur //
                  return (
                    <FieldLabel
                      key={name}
                      htmlFor={id}
                      className={`w-full cursor-pointer rounded-[20px] border p-0 transition-all duration-200 ${
                        isSelected
                          ? "border-sky-400/70 bg-[linear-gradient(180deg,rgba(41,88,170,0.28),rgba(10,17,30,0.9))] shadow-[0_20px_45px_-28px_rgba(56,189,248,0.85)]"
                          : "border-white/8 bg-[linear-gradient(180deg,rgba(18,24,38,0.78),rgba(8,11,18,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_35px_-30px_rgba(0,0,0,0.85)] hover:border-sky-300/20 hover:bg-[linear-gradient(180deg,rgba(23,31,49,0.92),rgba(8,11,18,0.96))]"
                      } ${hasError ? "border-destructive/50" : ""}`}
                    >
                      <div className="flex w-full items-start gap-4 p-4">
                        <Checkbox
                          id={id}
                          name={name}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setIntent(checked === true ? name : null);
                          }}
                          className={`mt-1 size-5 rounded-md border transition-colors ${
                            isSelected
                              ? "border-sky-300 bg-sky-400 text-slate-950"
                              : "border-white/15 bg-white/5 text-white"
                          }`}
                        />

                        <div className="flex min-w-0 flex-1 gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                              isSelected
                                ? "border-sky-300/35 bg-sky-400/15 text-sky-100"
                                : "border-white/10 bg-white/5 text-white/70"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>

                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="text-sm font-semibold leading-tight text-white">
                              {label}
                            </span>
                            <span className="text-sm leading-5 text-white/55">
                              {description}
                            </span>
                          </div>
                        </div>
                      </div>
                    </FieldLabel>
                  );
                },
              )}
            </FieldGroup>
          </FieldSet>

          {state.errors?.intent && (
            <p className="form-error mt-4 self-start">
              {state.errors.intent?.[0]}
            </p>
          )}
          {state.userMsg ? (
            <p className="form-error mt-4">{state.userMsg}</p>
          ) : null}
        </div>
        <button
          type="submit"
          formAction={formAction}
          className="btn-primary mt-8 w-full justify-center sm:w-auto lg:absolute lg:-right-80 lg:bottom-0"
          disabled={isPending || !intent}
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
