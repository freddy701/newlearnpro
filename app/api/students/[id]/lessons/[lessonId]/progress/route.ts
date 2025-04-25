import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest, { params }: { params: { id: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(params.id, 10);
  const lessonId = parseInt(params.lessonId, 10);
  if (isNaN(userId) || isNaN(lessonId)) {
    return NextResponse.json({ message: "ID utilisateur ou leçon invalide" }, { status: 400 });
  }
  // On marque la leçon comme complétée (ou on l'upsert si déjà existant)
  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { userId, lessonId, isCompleted: true, completedAt: new Date() }
  });
  return NextResponse.json(progress);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(params.id, 10);
  const lessonId = parseInt(params.lessonId, 10);
  if (isNaN(userId) || isNaN(lessonId)) {
    return NextResponse.json({ message: "ID utilisateur ou leçon invalide" }, { status: 400 });
  }
  const { progress } = await req.json();
  // On considère la leçon comme complétée si progress >= 95
  const isCompleted = progress >= 95;
  const progressRecord = await prisma.progress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { videoProgress: progress, isCompleted, completedAt: isCompleted ? new Date() : null },
    create: { userId, lessonId, videoProgress: progress, isCompleted, completedAt: isCompleted ? new Date() : null }
  });
  return NextResponse.json(progressRecord);
}
