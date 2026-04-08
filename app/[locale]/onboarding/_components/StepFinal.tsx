"use client";
import {
  Field,
  FieldDescription,
  FieldSet,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { stepFormState, stepThreeValidOnboarding } from "../_actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useActionState } from "react";
import { useTranslations } from "next-intl";

export default function StepFinal() {
  const t = useTranslations("onboarding.stepThree");

  const [intent, setIntent] = useState<string[]>();

  const initialState: stepFormState = { ok: false, userMsg: "" };

  const [state, formAction, isPending] = useActionState(
    stepThreeValidOnboarding,
    initialState,
  );
  return (
    <div className="flex flex-col items-center  w-full max-w-[480px] ">
      <h1 className="text-3xl mb-6">Quels est la raison de votre venue ?</h1>
      <form action={formAction}>
        <FieldSet className="">
          <FieldDescription>Dites le motif de votre venue</FieldDescription>
          <FieldGroup className=" flex flex-col">
            <Field className="flex flex-col gap-5" orientation="horizontal">
              <div className="flex flex-row gap-2 ">
                <Checkbox id="publish" name="publish" defaultChecked />
                <FieldLabel htmlFor="publish">Créer du contenu</FieldLabel>
              </div>
              <div className="flex flex-row gap-2">
                <Checkbox id="debate" name="debate" />
                <FieldLabel htmlFor="debate">Échanger des idées</FieldLabel>
              </div>

              <div className="flex flex-row gap-2">
                <Checkbox id="network" name="network" />
                <FieldLabel htmlFor="network">Développer mon réseau</FieldLabel>
              </div>
              <div className="flex flex-row gap-2">
                <Checkbox id="read" name="read" />
                <FieldLabel htmlFor="read">Publié</FieldLabel>
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>
        <button
          type="submit"
          formAction={formAction}
          className="btn-primary mt-4 self-center md:absolute md:bottom-3 md:-right-80"
        >
          {t("submit")}
        </button>
      </form>
    </div>
  );
}
