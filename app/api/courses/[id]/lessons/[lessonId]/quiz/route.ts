// Pour gérer le quiz d'une leçon

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id]/lessons/[lessonId]/quiz - Récupérer le quiz d'une leçon
export async function GET(
  req: NextRequest,
  context: { params: { id: string; lessonId: string } }
) {
  const params = await context.params;
  try {
    const courseId = params.id ? parseInt(params.id as string, 10) : NaN;
    const lessonId = params.lessonId ? parseInt(params.lessonId as string, 10) : NaN;

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
        { message: "Leçon non trouvée pour ce cours" },
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
      // Retourner une 404 propre si aucun quiz n'existe pour cette leçon
      return NextResponse.json(
        { message: "Quiz non trouvé pour cette leçon" },
        { status: 404 }
      );
    }

    // Adapter pour le frontend étudiant : retourner un tableau de questions
    const questions = [
      {
        id: quiz.id,
        question: quiz.question,
        options: JSON.parse(quiz.options),
        correctAnswer: quiz.correctAnswer,
      }
    ];
    return NextResponse.json({ questions });
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
  context: { params: { id: string; lessonId: string } }
) {
  const params = await context.params;
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    const courseId = params.id ? parseInt(params.id as string, 10) : NaN;
    const lessonId = params.lessonId ? parseInt(params.lessonId as string, 10) : NaN;

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
      where: { lessonId },
    });
    if (existingQuiz) {
      return NextResponse.json(
        { message: "Un quiz existe déjà pour cette leçon" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { question, options, correctAnswer } = body;

    if (!question || !options || !Array.isArray(options) || options.length < 2 || !correctAnswer) {
      return NextResponse.json(
        { message: "Données du quiz invalides" },
        { status: 400 }
      );
    }

    // --- Correction automatique de l'indice de la bonne réponse ---
    // Si correctAnswer est un nombre (ex: 1), on le convertit en string pour la BD
    // Si c'est déjà un string numérique, on le laisse tel quel
    // Si c'est un tableau (quiz multi-question), on stocke en JSON stringifié
    let correctAnswerToStore: string;
    if (Array.isArray(correctAnswer)) {
      correctAnswerToStore = JSON.stringify(correctAnswer.map(Number));
    } else if (typeof correctAnswer === 'number') {
      correctAnswerToStore = String(correctAnswer);
    } else if (typeof correctAnswer === 'string' && !isNaN(Number(correctAnswer))) {
      correctAnswerToStore = correctAnswer;
    } else {
      return NextResponse.json(
        { message: "Format de la bonne réponse invalide : il faut fournir l'indice (ex: 0, 1, ...) ou un tableau d'indices." },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        question,
        options: JSON.stringify(options),
        correctAnswer: correctAnswerToStore,
      },
    });

    return NextResponse.json(
      { message: "Quiz créé avec succès", quiz },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la création du quiz" },
      { status: 500 }
    );
  }
}
