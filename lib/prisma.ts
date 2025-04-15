import { PrismaClient } from "../generated/prisma";

// PrismaClient est attaché au global object dans les environnements de développement pour éviter
// d'épuiser la limite de connexions à la base de données.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
