import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { rateLimits } from "./lib/rateLimits";
import { getSession } from "./lib/authSession";

// On envoie la requete a i8n pour qu'il choissisent la bonne langue pour user //
const handleI18n = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Pour le rateLimits on dois prendre une clé dans l'URL pour savoir quel endpoint est sollicité par User //

  let key: "login" | "auth" | "global" | "admin";
  if (pathname.startsWith("/api/auth")) {
    key = "auth";
    return NextResponse.next();
  } else if (pathname.endsWith("login") && request.method === "POST") {
    key = "login";
  } else if (pathname.startsWith("/admin")) {
    key = "admin";
  } else {
    key = "global";
  }

  // Ont utilise le bon RateLimits avec notré clé //
  const limiter = rateLimits[key];

  // On essaye d'avoir les info de User pour lui collé ce rateLimits //
  const session = await getSession();
  const idSession = session?.user.id;
  const ip = request.headers.get("x-forwarded-for");
  const visitorId = request.cookies.get("visitorId")?.value;
  const identifier = idSession ?? visitorId ?? ip;

  if (!identifier) {
    return NextResponse.json(
      {
        userMsg: `Requête rejetée : Impossible d'identifier la source.`,
      },
      { status: 400 },
    );
  }

  const { success, reset } = await limiter.limit(identifier!);
  // Erreur si limite attente //
  if (!success) {
    const diffMs = reset - Date.now();
    const seconds = Math.ceil(diffMs / (1000 * 60)).toFixed(1);
    return NextResponse.json(
      {
        ok: false,
        userMsg: `Vous avez effectué trop de requete, veuilleuez ressayé dans : ${seconds} min`,
      },
      { status: 429 },
    );
  }

  // Ici, on prends tout les headers de la request, ajoute le notre pour le renvoyez
  // C'est obligatoire car si on ajoutez un headers comme ça Next peut supprimé les anciens Headers
  // "Copier coller" les headers avec le notre nous permets de gardé a 100% tout les headers  //
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = handleI18n(request);
  const upstreamHeaders = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const [key, value] of upstreamHeaders.headers) {
    if (
      key === "x-middleware-override-headers" ||
      key.startsWith("x-middleware-request-")
    ) {
      response.headers.set(key, value);
    }
  }

  return response;
}

export const config = {
  // Tout les routes sur lequelle i18n ne doit pas etre appliqué //
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
