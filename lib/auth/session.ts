import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { RoleType } from "@prisma/client";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  return user;
}

export async function requireRole(allowedRoles: RoleType[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "TEACHER") {
      redirect("/teacher/dashboard");
    } else if (user.role === "STUDENT") {
      redirect("/student/dashboard");
    } else {
      redirect("/admin/dashboard");
    }
  }
  
  return user;
}
