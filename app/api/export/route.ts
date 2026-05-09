import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";
import { rateLimits } from "@/lib/rateLimits";
import { captureAppException } from "@/lib/monitoring/sentry";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const userId = session.user.id;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  try {
    const rateLimitResult = await rateLimits.dataExport.limit(userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "DATA_EXPORT_RATE_LIMITED",
          userMsg: "Vous avez déjà exporté vos données cette semaine.",
          resetAt: new Date(rateLimitResult.reset).toISOString(),
        },
        { status: 429 },
      );
    }

    const viewer = await myPrisma.userProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        username: true,
        displayname: true,
        bio: true,
        language: true,
        createdAt: true,
        isPro: true,
        hasAcceptedCookies: true,
        last_login_at: true,
        last_seen_at: true,
        utm_source: true,
        utm_medium: true,
        utm_campaign: true,
        referrer_domain: true,
        visitCountBeforeLogin: true,
        anonymeCreatedAt: true,
      },
    });

    if (!viewer) {
      return new NextResponse("Profil introuvable", { status: 404 });
    }

    const [posts, postLikes, commentLikes, comments] = await Promise.all([
      myPrisma.post.findMany({
        where: { userId: viewer.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          createdAt: true,
          deletedAt: true,
        },
      }),
      myPrisma.postLike.findMany({
        where: { user_id: viewer.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              slug: true,
              deletedAt: true,
            },
          },
        },
      }),
      myPrisma.commentLike.findMany({
        where: { user_id: viewer.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          comment: {
            select: {
              id: true,
              deletedAt: true,
              post: {
                select: {
                  slug: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      }),
      myPrisma.comment.findMany({
        where: { authorId: viewer.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          deletedAt: true,
          post: {
            select: {
              slug: true,
              deletedAt: true,
            },
          },
        },
      }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: {
        username: viewer.username,
        displayName: viewer.displayname,
        bio: viewer.bio,
        language: viewer.language,
        createdAt: viewer.createdAt.toISOString(),
        isPro: viewer.isPro,
      },
      posts: posts.map((post) => ({
        id: post.id,
        url: `${baseUrl}/post/${post.slug}`,
        createdAt: post.createdAt.toISOString(),
        deletedAt: post.deletedAt?.toISOString() ?? null,
      })),
      likes: [
        ...postLikes.map((like) => ({
          id: like.id,
          type: "post" as const,
          url: `${baseUrl}/post/${like.post.slug}`,
          likedAt: like.createdAt.toISOString(),
          targetDeletedAt: like.post.deletedAt?.toISOString() ?? null,
        })),
        ...commentLikes.map((like) => ({
          id: like.id,
          type: "comment" as const,
          url: `${baseUrl}/post/${like.comment.post.slug}/c/${like.comment.id}`,
          likedAt: like.createdAt.toISOString(),
          targetDeletedAt: like.comment.deletedAt?.toISOString() ?? null,
          parentPostDeletedAt:
            like.comment.post.deletedAt?.toISOString() ?? null,
        })),
      ],
      comments: comments.map((comment) => ({
        id: comment.id,
        url: `${baseUrl}/post/${comment.post.slug}/c/${comment.id}`,
        postUrl: `${baseUrl}/post/${comment.post.slug}`,
        createdAt: comment.createdAt.toISOString(),
        deletedAt: comment.deletedAt?.toISOString() ?? null,
        parentPostDeletedAt: comment.post.deletedAt?.toISOString() ?? null,
      })),
      tracking: {
        hasAcceptedCookies: viewer.hasAcceptedCookies,
        lastLoginAt: viewer.last_login_at?.toISOString() ?? null,
        lastSeenAt: viewer.last_seen_at?.toISOString() ?? null,
        utmSource: viewer.utm_source,
        utmMedium: viewer.utm_medium,
        utmCampaign: viewer.utm_campaign,
        referrerDomain: viewer.referrer_domain,
        visitCountBeforeLogin: viewer.visitCountBeforeLogin,
        anonymousCreatedAt: viewer.anonymeCreatedAt?.toISOString() ?? null,
      },
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="socially-export-${viewer.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Impossible d'exportez tout les données", error);
    captureAppException(error, {
      feature: "data_export",
      action: "export_user_data",
      extra: {
        authUserId: userId,
      },
    });
    return new NextResponse("Impossible d'exporter vos données", {
      status: 500,
    });
  }
}
