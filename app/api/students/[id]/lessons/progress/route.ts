import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
  }
  // On récupère tous les progrès de l'utilisateur pour toutes ses leçons
  const progresses = await prisma.progress.findMany({
    where: { userId },
    select: {
      lessonId: true,
      isCompleted: true,
      quizScore: true,
      videoProgress: true
    }
  });
  return NextResponse.json(progresses);
}
