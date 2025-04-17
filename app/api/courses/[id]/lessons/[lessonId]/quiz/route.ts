// Pour gérer le quiz d'une leçon

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id]/lessons/[lessonId]/quiz - Récupérer le quiz d'une leçon
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const courseId = parseInt(params.id);
    const lessonId = parseInt(params.lessonId);

    if (isNaN(courseId) || isNaN(lessonId)) {
      return NextResponse.json(
        { message: "ID de cours ou de leçon invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la leçon existe et appartient au cours
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        courseId,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer le quiz
    const quiz = await prisma.quiz.findUnique({
      where: {
        lessonId,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz non trouvé pour cette leçon" },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération du quiz" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/lessons/[lessonId]/quiz - Créer un quiz pour une leçon
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const courseId = parseInt(params.id);
    const lessonId = parseInt(params.lessonId);

    if (isNaN(courseId) || isNaN(lessonId)) {
      return NextResponse.json(
        { message: "ID de cours ou de leçon invalide" },
        { status: 400 }
      );
    }

    // Récupérer le cours pour vérifier les droits
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        lessons: {
          where: {
            id: lessonId,
          },
        },
      },
    });

    if (!course || course.lessons.length === 0) {
      return NextResponse.json(
        { message: "Cours ou leçon non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du cours ou un administrateur
    if (
      course.teacherId !== parseInt(session.user.id) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Vous n'avez pas les droits pour ajouter un quiz à cette leçon" },
        { status: 403 }
      );
    }

    // Vérifier si un quiz existe déjà pour cette leçon
    const existingQuiz = await prisma.quiz.findUnique({
      where: {
        lessonId,
      },
    });
