-- Deduplicate existing follow notifications before adding the partial unique index.
-- PostgreSQL unique indexes allow multiple NULL values, so the regular
-- actor/user/type/postId unique constraint does not protect FOLLOW rows.
WITH duplicate_groups AS (
    SELECT
        "actorId",
        "userId",
        "type",
        MAX("createdAt") AS "latestCreatedAt",
        BOOL_AND("isRead") AS "mergedIsRead"
    FROM "app"."Notifications"
    WHERE "type" = 'FOLLOW'
      AND "postId" IS NULL
    GROUP BY "actorId", "userId", "type"
    HAVING COUNT(*) > 1
),
keepers AS (
    SELECT DISTINCT ON (notification."actorId", notification."userId", notification."type")
        notification."id",
        duplicate_groups."latestCreatedAt",
        duplicate_groups."mergedIsRead"
    FROM "app"."Notifications" notification
    INNER JOIN duplicate_groups
        ON duplicate_groups."actorId" = notification."actorId"
       AND duplicate_groups."userId" = notification."userId"
       AND duplicate_groups."type" = notification."type"
    WHERE notification."postId" IS NULL
    ORDER BY
        notification."actorId",
        notification."userId",
        notification."type",
        notification."createdAt" DESC,
        notification."id" DESC
)
UPDATE "app"."Notifications" notification
SET
    "createdAt" = keepers."latestCreatedAt",
    "isRead" = keepers."mergedIsRead"
FROM keepers
WHERE notification."id" = keepers."id";

WITH ranked_follow_notifications AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "actorId", "userId", "type"
            ORDER BY "createdAt" DESC, "id" DESC
        ) AS "rank"
    FROM "app"."Notifications"
    WHERE "type" = 'FOLLOW'
      AND "postId" IS NULL
)
DELETE FROM "app"."Notifications"
WHERE "id" IN (
    SELECT "id"
    FROM ranked_follow_notifications
    WHERE "rank" > 1
);

CREATE UNIQUE INDEX "Notifications_follow_unique"
ON "app"."Notifications"("actorId", "userId", "type")
WHERE "postId" IS NULL AND "type" = 'FOLLOW';
