"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucideEdit, 
  LucideBookOpen, 
  LucideClipboardList
} from "lucide-react";
import { CourseService } from "@/services/courseService";
import { LessonService } from "@/services/lessonService";
import { QuizService } from "@/services/quizService";

export default function LessonPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  // Utiliser React.use pour accéder aux paramètres comme recommandé par Next.js
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const lessonId = parseInt(resolvedParams.lessonId);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les détails du cours, de la leçon et du quiz
  useEffect(() => {
    const loadData = async () => {
      if (isNaN(courseId) || isNaN(lessonId)) {
        setError("ID de cours ou de leçon invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Charger les détails du cours
        const courseData = await CourseService.getCourse(courseId);
        setCourse(courseData);
        
        // Charger les détails de la leçon
        const lessonData = await LessonService.getLesson(courseId, lessonId);
        setLesson(lessonData);
        
        // Vérifier si un quiz existe pour cette leçon
        try {
          const quizData = await QuizService.getQuiz(courseId, lessonId);
          setQuiz(quizData);
        } catch (error) {
          // C'est normal si le quiz n'existe pas encore
          console.log("Aucun quiz trouvé pour cette leçon");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Impossible de charger les détails. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadData();
    }
  }, [courseId, lessonId, status]);

  // Vérifier les autorisations
  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "authenticated" && session && course) {
        const isOwner = course.teacherId === parseInt(session.user.id);
        const isAdmin = session.user.role === "ADMIN";
        
        if (!isOwner && !isAdmin) {
          router.push("/teacher/courses");
        }
      }
    };
    
    if (status === "authenticated" && course) {
      checkPermissions();
    }
  }, [course, session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  if (!lesson || !course) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300">{error || "Leçon ou cours non trouvé"}</p>
          <Link href="/teacher/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour à mes cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">Cours: {course.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu de la leçon */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <LucideBookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Contenu de la leçon
              </h2>
              <Link
                href={`/teacher/courses/${courseId}/lessons/${lessonId}/edit`}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                title="Modifier la leçon"
              >
                <LucideEdit className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {lesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Aucun contenu disponible pour cette leçon.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations et actions */}
        <div className="space-y-6">
          {/* Informations sur la leçon */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Position dans le cours</p>
                <p className="font-medium">{lesson.position}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Durée estimée</p>
                <p className="font-medium">{lesson.duration || "Non spécifiée"}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                <p className="font-medium">
                  {lesson.updatedAt 
                    ? new Date(lesson.updatedAt).toLocaleDateString() 
                    : "Non disponible"}
                </p>
              </div>
            </div>
          </div>

          {/* Quiz associé */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <LucideClipboardList className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Quiz
            </h2>
            
            {quiz ? (
              <div>
                <p className="mb-2 font-medium">{quiz.question}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {Array.isArray(quiz.options) 
                    ? `${quiz.options.length} options disponibles` 
                    : `${JSON.parse(quiz.options as unknown as string).length} options disponibles`}
                </p>
                <Link
                  href={`/teacher/courses/${courseId}/lessons/${lessonId}/quiz`}
                  className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  Modifier le quiz
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Aucun quiz n'a été créé pour cette leçon.
                </p>
                <Link
                  href={`/teacher/courses/${courseId}/lessons/${lessonId}/quiz`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Créer un quiz
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Link
                href={`/teacher/courses/${courseId}/lessons/${lessonId}/edit`}
                className="block w-full px-4 py-2 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Modifier la leçon
              </Link>
              
              <Link
                href={`/teacher/courses/${courseId}/lessons/${lessonId}/quiz`}
                className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {quiz ? "Gérer le quiz" : "Créer un quiz"}
              </Link>
              
              <Link
                href={`/teacher/courses/${courseId}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Retour au cours
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
