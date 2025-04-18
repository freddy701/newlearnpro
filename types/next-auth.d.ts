import NextAuth, { DefaultSession } from "next-auth";
import { RoleType } from "../generated/prisma";

// Étend les types NextAuth pour inclure le rôle utilisateur dans la session et le JWT

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleType;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: RoleType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleType;
  }
}
