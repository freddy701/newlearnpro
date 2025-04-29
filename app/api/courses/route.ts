// gérer la création et la récupération des cours

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/courses - Récupérer tous les cours (avec filtres)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const query = url.searchParams.get("query")?.toLowerCase() || "";
    const isPublished = url.searchParams.get("isPublished");

    // Construire la requête de base
    const baseQuery: any = {
      where: {
        ...(teacherId ? { teacherId: parseInt(teacherId) } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        isPublished: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            profilePictureUrl: true,
          },
        },
        lessons: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc" as const,
      },
      skip,
      take: limit,
    };

    // Filtre isPublished
    if (isPublished === "true") {
      baseQuery.where.isPublished = true;
    }

    // Filtre recherche query (titre ou description)
    if (query) {
      baseQuery.where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Exécuter la requête
    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany(baseQuery),
      prisma.course.count({ where: baseQuery.where }),
    ]);

    // Transformer les données pour le client
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price,
      isPublished: course.isPublished,
      teacher: course.teacher,
      lessonsCount: course.lessons?.length || 0,
      studentsCount: course._count?.enrollments || 0,
      createdAt: course.createdAt,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      meta: {
        total: totalCourses,
        page,
        limit,
        pages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la récupération des cours" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Créer un nouveau cours (réservé aux enseignants et administrateurs)
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est un enseignant ou un administrateur
    if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Vous n'avez pas les droits pour créer un cours" },
        { status: 403 }
      );
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { title, description, thumbnailUrl, price, lessons = [] } = body;

    // Validation des données
    if (!title || !price) {
      return NextResponse.json(
        { message: "Le titre et le prix sont obligatoires" },
        { status: 400 }
      );
    }

    // Créer le cours
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        price: parseFloat(price),
        teacherId: parseInt(session.user.id),
        isPublished: false, // Par défaut, le cours n'est pas publié
      },
    });

    // Créer automatiquement un groupe d'étude pour ce cours
    const studyGroup = await prisma.studyGroup.create({
      data: {
        courseId: course.id,
        name: `Groupe d'étude: ${title}`,
        createdBy: parseInt(session.user.id),
        // createdAt est automatique
      }
    });

    // Ajouter le créateur comme membre du groupe (rôle admin)
    await prisma.groupMember.create({
      data: {
        groupId: studyGroup.id,
        userId: parseInt(session.user.id),
        // joinedAt automatique
      }
    });

    // Créer les leçons si elles sont fournies
    if (lessons.length > 0) {
      await prisma.lesson.createMany({
        data: lessons.map((lesson: any, index: number) => ({
          courseId: course.id,
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration ? parseInt(lesson.duration) : null,
          lessonOrder: index + 1,
        })),
      });
    }

    return NextResponse.json({
      message: "Cours créé avec succès",
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du cours:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la création du cours" },
      { status: 500 }
    );
  }
}