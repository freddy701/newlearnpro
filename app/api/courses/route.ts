import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupération des paramètres
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const query = searchParams.get("query") || "";
    const isPublished = searchParams.get("isPublished") === "true";
    
    // Calcul de l'offset pour la pagination
    const skip = (page - 1) * limit;
    
    // Construction des conditions de recherche
    const whereCondition: any = {};
    
    // Condition pour les cours publiés si demandé
    if (isPublished) {
      whereCondition.isPublished = true;
    }
    
    // Condition de recherche par texte
    if (query) {
      whereCondition.OR = [
        { title: { contains: query } },
        { description: { contains: query } }
      ];
    }
    
    // Exécution des requêtes en parallèle pour les performances
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              profilePictureUrl: true
            }
          }
        }
      }),
      prisma.course.count({ where: whereCondition })
    ]);
    
    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      courses,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cours" },
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