import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id]/study-group - Récupérer le groupe d'étude d'un cours
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { message: "ID de cours invalide" },
        { status: 400 }
      );
    }

    const studyGroup = await prisma.studyGroup.findFirst({
      where: { courseId },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullName: true, profilePictureUrl: true } }
          }
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 20,
          include: {
            sender: { select: { id: true, fullName: true, profilePictureUrl: true } }
          }
        }
      }
    });

    if (!studyGroup) {
      return NextResponse.json(
        { message: "Aucun groupe d'étude trouvé pour ce cours" },
        { status: 404 }
      );
    }

    return NextResponse.json({ studyGroup });
  } catch (error) {
    console.error("Erreur lors de la récupération du groupe d'étude:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération du groupe d'étude" },
      { status: 500 }
    );
  }
}
