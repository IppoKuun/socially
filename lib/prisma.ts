import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"


const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Adapter a placé dans le clients qui vas géré un pool de connexion dans une seul instance //
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

export const myPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"],
  })



// Propriété prisma dans l'objets global uniquement initialisé en dev //
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = myPrisma
}
