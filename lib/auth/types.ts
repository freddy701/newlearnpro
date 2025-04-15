import "next-auth";
import { RoleType } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: RoleType;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: RoleType;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleType;
  }
}
