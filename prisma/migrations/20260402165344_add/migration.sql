DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'Intent' AND n.nspname = 'app'
  ) THEN
    CREATE TYPE "app"."Intent" AS ENUM ('PUBLISH', 'READ', 'DEBATE', 'NETWORK');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'BUSINESS'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'BUSINESS';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'POLITICS'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'POLITICS';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'NEWS'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'NEWS';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'SCIENCE'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'SCIENCE';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'EDUCATION'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'EDUCATION';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'HEALTH'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'HEALTH';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'SPORTS'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'SPORTS';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'ENTERTAINMENT'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'ENTERTAINMENT';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'GAMING'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'GAMING';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'LIFESTYLE'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'LIFESTYLE';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'FOOD'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'FOOD';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'TRAVEL'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'TRAVEL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'FASHION_BEAUTY'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'FASHION_BEAUTY';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'CREATORS'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'CREATORS';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'FINANCE'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'FINANCE';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'Category' AND e.enumlabel = 'ENVIRONMENT'
  ) THEN
    ALTER TYPE "app"."Category" ADD VALUE 'ENVIRONMENT';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'language' AND e.enumlabel = 'ENGLISH'
  ) THEN
    ALTER TYPE "app"."language" ADD VALUE 'ENGLISH';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'app' AND t.typname = 'language' AND e.enumlabel = 'SPANISH'
  ) THEN
    ALTER TYPE "app"."language" ADD VALUE 'SPANISH';
  END IF;
END $$;

ALTER TABLE "app"."Post"
ALTER COLUMN "Category" DROP DEFAULT,
ALTER COLUMN "Category" TYPE "app"."Category"[]
USING ARRAY["Category"],
ALTER COLUMN "Category" SET DEFAULT ARRAY[]::"app"."Category"[];

ALTER TABLE "app"."UserProfile"
ADD COLUMN IF NOT EXISTS "intent" "app"."Intent",
ADD COLUMN IF NOT EXISTS "occupation" TEXT,
ADD COLUMN IF NOT EXISTS "categories" "app"."Category"[] NOT NULL DEFAULT ARRAY[]::"app"."Category"[];
