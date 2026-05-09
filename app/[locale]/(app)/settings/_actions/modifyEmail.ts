"use server";

import { getSession } from "@/lib/authSession";
import { captureAppException } from "@/lib/monitoring/sentry";
import { myPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type FormServ = {
  ok: boolean;
  userMsg: string;
};

export default async function modifyEmailActions(
  _prevstate: FormServ,
  email: string,
): Promise<FormServ> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { ok: false, userMsg: "Session expirée ou invalide" };
  }

  const user = await myPrisma.userProfile.findFirst({
    where: { userId: session.user.id, deletedAt: null },
    select: { id: true },
  });
  if (!user) {
    return { ok: false, userMsg: "Nous n'avons pas pu vous identifié" };
  }

  if (!email) {
    return { ok: false, userMsg: "Email est vide" };
  }

  const cleanEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return { ok: false, userMsg: "L'adresse email n'est pas valide" };
  }
  // modification email est faible pour l'instant c'est un choix assumé
  // Plus tard, a intégré : validationn mail //
  try {
    await myPrisma.user.update({
      where: { id: session.user.id },
      select: { email: true },
      data: { email: cleanEmail },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          ok: false,
          userMsg: "Cet email est déjà utilisé par un autre compte",
        };
      }
    }
    console.error(
      "Erreur server impossible de modifié email better auth",
      error,
    );
    captureAppException(error, {
      feature: "settings",
      action: "modify_email",
      extra: {
        userProfileId: user.id,
        authUserId: session.user.id,
      },
    });
    return {
      ok: false,
      userMsg: "Erreur serveur, impossible de modifié votre adresse mail",
    };
  }
  revalidatePath("/settings");
  return { ok: true, userMsg: "" };
}
