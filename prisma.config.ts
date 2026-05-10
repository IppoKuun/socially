import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// CONFIG POUR LE CLI DE PRISMA //

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
