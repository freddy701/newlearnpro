import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/teacher/groups - Groupes d'étude créés par l'enseignant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const userId = Number(session.user.id);
    const groups = await prisma.studyGroup.findMany({
      where: { createdBy: userId },
      include: {
        course: true,
        members: { include: { user: true } },
      },
    });
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes enseignant:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
