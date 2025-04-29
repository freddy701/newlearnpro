import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/student/groups - Groupes d'étude où l'utilisateur est membre
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            course: true,
            members: { include: { user: true } },
          },
        },
      },
    });
    const groups = memberships.map(m => m.group);
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes étudiant:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
