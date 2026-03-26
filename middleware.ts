import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/authSession";
import { myPrisma } from "./lib/prisma";
import { createId } from "@paralleldrive/cuid2";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Si user est connecté, rien se passe //
  const session = await getSession();
  if (session) {
    return NextResponse.next();
  }
  // Si il ne l'est pas, on regarde dans le cookies si il a une session active //

  const sessionActive = req.cookies.get("is_session_active");

  if (!sessionActive) {
    res.cookies.set("is_session_active", "true", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      // Vu qu'on ne mets pas maxAge, le cookies se reset a chaque fois qu'il est déconnecté //
    });

    // Si user a visitor_ID, c'est pas la premiere fois qu'il se connecte avec son naviguateur.
    const Post_It = req.headers.get("Post_It");
    const anonymousId = await myPrisma.anonymousVisitor.update({
      where: { visitorId: Post_It ?? "unknown" },
      data: { visitCount: { increment: 1 } },
    });

    // S'il en a pas on lui en créer une + On enregistre tout ce dont ont a besoin //
    if (!anonymousId) {
      const newId = createId();
      res.headers.set("Post_It", newId);
      const anonymousLanguage = res.headers.get("accept-language");
      const searchParams = req.nextUrl.searchParams;
      const utm_source = searchParams.get("utm_source");
      const utm_campaign = searchParams.get("utm_campaign");
      const utm_medium = searchParams.get("utm_medium");

      const referer = req.headers.get("referer");

      await myPrisma.anonymousVisitor.create({
        data: {
          visitorId: newId,
          language: anonymousLanguage ?? "unknown",
          utm_source: utm_source,
          utm_campaign: utm_campaign,
          utm_medium: utm_medium,
          referrer_domain: referer,
        },
      });
    }
  }

  // OPTIONNEL : FAIRE UNE CONFIG POUR LIMITER MIDDLEWARE A CERTAINES ROUTES //

  return NextResponse.next();
}
