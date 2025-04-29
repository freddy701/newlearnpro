import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/courses/[id]/study-group/message - Envoyer un message dans le groupe d'étude
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }
    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json({ message: "ID de cours invalide" }, { status: 400 });
    }
    const { content } = await req.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ message: "Message vide" }, { status: 400 });
    }
    // Trouver le groupe d'étude
    const studyGroup = await prisma.studyGroup.findFirst({ where: { courseId } });
    if (!studyGroup) {
      return NextResponse.json({ message: "Aucun groupe d'étude pour ce cours" }, { status: 404 });
    }
    // Vérifier que l'utilisateur est membre du groupe
    const member = await prisma.groupMember.findFirst({ where: { groupId: studyGroup.id, userId: parseInt(session.user.id) } });
    if (!member) {
      return NextResponse.json({ message: "Vous n'êtes pas membre de ce groupe" }, { status: 403 });
    }
    // Créer le message
    const message = await prisma.message.create({
      data: {
        groupId: studyGroup.id,
        senderId: parseInt(session.user.id),
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, fullName: true, profilePictureUrl: true } }
      }
    });
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de groupe:", error);
    return NextResponse.json({ message: "Erreur serveur lors de l'envoi du message" }, { status: 500 });
  }
}
