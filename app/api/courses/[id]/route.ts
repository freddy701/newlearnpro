// gérer la récupération d'un cours

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses/[id] - Récupérer un cours spécifique
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

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            profilePictureUrl: true,
          },
        },
        lessons: {
          orderBy: {
            lessonOrder: "asc",
          },
          include: {
            quiz: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Cours non trouvé" },
        { status: 404 }
      );
    }

    // Transformer les données pour le client
    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      isPublished: course.isPublished,
      teacherId: course.teacherId,
      teacher: course.teacher,
      lessons: course.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        lessonOrder: lesson.lessonOrder,
        hasQuiz: !!lesson.quiz,
      })),
      studentsCount: course._count.enrollments,
      createdAt: course.createdAt,
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération du cours" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Mettre à jour un cours
export async function PUT(
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

    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { message: "ID de cours invalide" },
        { status: 400 }
      );
    }

    // Récupérer le cours pour vérifier les droits
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Cours non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du cours ou un administrateur
    if (
      existingCourse.teacherId !== parseInt(session.user.id) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Vous n'avez pas les droits pour modifier ce cours" },
        { status: 403 }
      );
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { title, description, thumbnailUrl, price, isPublished } = body;

    // Validation des données - uniquement si on met à jour les informations du cours
    // Si on ne fait que changer le statut de publication, on n'a pas besoin de valider le titre et le prix
    if (title !== undefined && (!title || !price)) {
      return NextResponse.json(
        { message: "Le titre et le prix sont obligatoires" },
        { status: 400 }
      );
    }

    // Mettre à jour le cours
    const updatedCourse = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(price !== undefined && { price: parseFloat(price.toString()) }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({
      message: "Cours mis à jour avec succès",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cours:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la mise à jour du cours" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Supprimer un cours
export async function DELETE(
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

    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { message: "ID de cours invalide" },
        { status: 400 }
      );
    }

    // Récupérer le cours pour vérifier les droits
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Cours non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du cours ou un administrateur
    if (
      existingCourse.teacherId !== parseInt(session.user.id) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "Vous n'avez pas les droits pour supprimer ce cours" },
        { status: 403 }
      );
    }

    // Supprimer le cours (Prisma s'occupera de supprimer les leçons et quiz associés grâce aux relations onDelete: Cascade)
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({
      message: "Cours supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du cours:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la suppression du cours" },
      { status: 500 }
    );
  }
}