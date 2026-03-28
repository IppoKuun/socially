import { auth } from "@/lib/auth";
import { myPrisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function createProfile(
  prevState: any,
  FormData: FormData,
) {
  const c = await cookies();
  const visitorId = c.get("visitorId")?.value;
  try {
    // variable null comme ça si prisma le trouve pas, il reste null et renvoie pas  une erreur pour ça. //
    let visitor = null;

    visitor = await myPrisma.anonymousVisitor
      .findUnique({
        where: { visitorId },
      })
      .catch(() => null);

    const user = await auth.api.signUpEmail({
      body: {
        email: FormData.get("email") as string,
        password: FormData.get("password") as string,
        name: FormData.get("name") as string,
        accountType: "public",
        trackingData: {
          utm_source: visitor?.utm_source,
          utm_campaign: visitor?.utm_campaign,
          utm_medium: visitor?.utm_medium,
          referrer_domain: visitor?.referrer_domain,
          // AJOUTEZ LES AUTRES CHAMPS //
        },
      },
    });
  } catch (error: any) {
    console.error(error.message);
    return { ok: false, userMsg: error.message };
  }

  redirect("/onboarding");
}
