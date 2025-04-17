// gérer la récupération des leçons d'un cours

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id]/lessons - Récupérer toutes les leçons d'un cours
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { message: "ID de cours invalide" },
        { status: 400 }
      );
    }

    // Vérifier que le cours existe
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Cours non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les leçons
    const lessons = await prisma.lesson.findMany({
      where: {
        courseId,
      },
      orderBy: {
        lessonOrder: "asc",
      },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transformer les données pour le client
    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      lessonOrder: lesson.lessonOrder,
      hasQuiz: !!lesson.quiz,
    }));

    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error("Erreur lors de la récupération des leçons:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération des leçons" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/lessons - Ajouter une leçon à un cours
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    if (isNaN(courseId)) {
      return NextResponse.json(
        { message: "ID de cours invalide" },
        { status: 400 }
      );
    }

    // Récupérer le cours pour vérifier les droits
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Cours non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du cours ou un administrateur
    if (
      course.teacherId !== parseInt(session.user.id) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Vous n'avez pas les droits pour ajouter une leçon à ce cours" },
        { status: 403 }
      );
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { title, videoUrl, duration } = body;

    // Validation des données
    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: "Le titre et l'URL de la vidéo sont obligatoires" },
        { status: 400 }
      );
    }

    // Déterminer l'ordre de la leçon (dernière leçon + 1)
    const lastLesson = await prisma.lesson.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        lessonOrder: "desc",
      },
    });

    const lessonOrder = lastLesson ? lastLesson.lessonOrder + 1 : 1;

    // Créer la leçon
    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        lessonOrder,
      },
    });

    return NextResponse.json({
      message: "Leçon ajoutée avec succès",
      lesson,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la leçon:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'ajout de la leçon" },
      { status: 500 }
    );
  }
}