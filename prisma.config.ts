import "dotenv/config";
import { defineConfig, env } from "prisma/config"


// CONFIG POUR LE CLI DE PRISMA //

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations : {
        path:  "prisma/migrations"
    },
    datasource: { url : env("DIRECT_URL")},

    // TABLES EXTERNE DE BETTER AUTH, PRISMA A BESOIN DE SAVOIR //
    experimental: {externalTables: true},
    tables: {
        external: ["auth.user", "auth.session", "auth.account", "auth.verification"]
    
    }
})