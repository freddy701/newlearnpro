// gérer la récupération d'une leçon

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id]/lessons/[lessonId] - Récupérer une leçon spécifique
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

    // Vérification de l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est le créateur du cours (enseignant)
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
      select: { teacherId: true },
    });

    let isTeacher = false;
    if (course && course.teacherId === Number(session.user.id)) {
      isTeacher = true;
    }

    if (!isTeacher) {
      // Vérification de l'inscription et du paiement (pour les étudiants)
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: Number(session.user.id),
          courseId: Number(courseId),
          paymentStatus: 'paid',
        },
      });
      if (!enrollment) {
        return NextResponse.json(
          { accessDenied: true, message: "Vous devez vous inscrire et payer ce cours pour accéder à la leçon." },
          { status: 403 }
        );
      }
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },
      include: {
        quiz: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { message: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    // Correction robustesse : parser options si quiz existe
    let quiz = null;
    if (lesson.quiz) {
      let parsedOptions = lesson.quiz.options;
      try {
        if (typeof parsedOptions === "string") {
          parsedOptions = JSON.parse(parsedOptions);
        }
      } catch (parseErr) {
        console.error("Erreur de parsing du champ options du quiz:", parseErr, lesson.quiz.options);
        parsedOptions = null;
      }
      quiz = {
        ...lesson.quiz,
        options: parsedOptions,
      };
    }

    console.log("Réponse lesson:", {
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      lessonOrder: lesson.lessonOrder,
      quiz,
    });

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      lessonOrder: lesson.lessonOrder,
      quiz,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la leçon:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération de la leçon", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]/lessons/[lessonId] - Mettre à jour une leçon
export async function PUT(
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
        { message: "Vous n'avez pas les droits pour modifier cette leçon" },
        { status: 403 }
      );
    }

    // Vérifier que la leçon existe
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { message: "Leçon non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { title, videoUrl, duration, lessonOrder } = body;

    // Validation des données
    if (!title || !videoUrl) {
      return NextResponse.json(
        { message: "Le titre et l'URL de la vidéo sont obligatoires" },
        { status: 400 }
      );
    }

    // Mettre à jour la leçon
    const updatedLesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        lessonOrder: lessonOrder !== undefined ? lessonOrder : existingLesson.lessonOrder,
      },
    });

    return NextResponse.json({
      message: "Leçon mise à jour avec succès",
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la leçon:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la mise à jour de la leçon" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/lessons/[lessonId] - Supprimer une leçon
export async function DELETE(
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
        { message: "Vous n'avez pas les droits pour supprimer cette leçon" },
        { status: 403 }
      );
    }

    // Supprimer la leçon (Prisma s'occupera de supprimer le quiz associé grâce aux relations onDelete: Cascade)
    await prisma.lesson.delete({
      where: {
        id: lessonId,
        courseId,
      },
    });

    // Réorganiser les ordres des leçons restantes
    const remainingLessons = await prisma.lesson.findMany({
      where: {
        courseId,
      },
      orderBy: {
        lessonOrder: "asc",
      },
    });

    // Mettre à jour les ordres
    for (let i = 0; i < remainingLessons.length; i++) {
      await prisma.lesson.update({
        where: {
          id: remainingLessons[i].id,
        },
        data: {
          lessonOrder: i + 1,
        },
      });
    }

    return NextResponse.json({
      message: "Leçon supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la leçon:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la suppression de la leçon" },
      { status: 500 }
    );
  }
}