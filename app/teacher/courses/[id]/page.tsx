"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucideEdit, 
  LucidePlus, 
  LucideTrash, 
  LucideUsers,
  LucideEye,
  LucideCheck,
  LucideX,
  LucideArrowUp,
  LucideArrowDown,
  LucideLoader2
} from "lucide-react";
import { CourseService, Course } from "@/services/courseService";
import { LessonService, Lesson } from "@/services/lessonService";

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  // Utiliser React.use pour accéder aux paramètres comme recommandé par Next.js
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoUrl: "",
    duration: ""
  });

  // Charger les détails du cours et ses leçons
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (isNaN(courseId)) {
        setError("ID de cours invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [courseData, lessonsData] = await Promise.all([
          CourseService.getCourse(courseId),
          LessonService.getLessons(courseId)
        ]);
        
        setCourse(courseData);
        setLessons(lessonsData);
      } catch (error) {
        console.error("Erreur lors du chargement des détails du cours:", error);
        setError("Impossible de charger les détails du cours. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadCourseDetails();
    }
  }, [courseId, status]);

  // Vérifier les autorisations
  useEffect(() => {
    if (status === "authenticated" && course && session) {
      console.log("Vérification des autorisations:");
      console.log("ID enseignant du cours:", course.teacherId);
      console.log("ID utilisateur:", session.user.id);
      console.log("Rôle utilisateur:", session.user.role);
      
      const isOwner = course.teacherId === parseInt(session.user.id);
      const isAdmin = session.user.role === "ADMIN";
      
      console.log("Est propriétaire:", isOwner);
      console.log("Est admin:", isAdmin);
      
      if (!isOwner && !isAdmin) {
        router.push("/teacher/courses");
      }
    }
  }, [course, session, status, router]);

  // Ajouter une nouvelle leçon
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLesson.title || !newLesson.videoUrl) {
      setError("Le titre et l'URL de la vidéo sont obligatoires");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await LessonService.createLesson(courseId, {
        title: newLesson.title,
        videoUrl: newLesson.videoUrl,
        duration: newLesson.duration ? parseInt(newLesson.duration) : undefined
      });
      
      setLessons(prev => [...prev, response.lesson]);
      setNewLesson({ title: "", videoUrl: "", duration: "" });
      setIsAddingLesson(false);
      setError("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la leçon:", error);
      setError("Impossible d'ajouter la leçon. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une leçon
  const deleteLesson = async (lessonId: number) => {
    try {
      setIsLoading(true);
      await LessonService.deleteLesson(courseId, lessonId);
      setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la leçon:", error);
      setError("Impossible de supprimer la leçon. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Changer l'ordre d'une leçon
  const moveLesson = async (lessonId: number, direction: 'up' | 'down') => {
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex === -1) return;
    
    const newIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;
    
    try {
      setIsLoading(true);
      
      // Échanger les ordres des leçons
      const targetLesson = lessons[newIndex];
      const currentLesson = lessons[lessonIndex];
      
      await Promise.all([
        LessonService.reorderLesson(courseId, currentLesson.id, targetLesson.lessonOrder),
        LessonService.reorderLesson(courseId, targetLesson.id, currentLesson.lessonOrder)
      ]);
      
      // Mettre à jour l'état local
      const newLessons = [...lessons];
      [newLessons[lessonIndex], newLessons[newIndex]] = [newLessons[newIndex], newLessons[lessonIndex]];
      setLessons(newLessons);
    } catch (error) {
      console.error("Erreur lors du déplacement de la leçon:", error);
      setError("Impossible de déplacer la leçon. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Publier ou dépublier le cours
  const togglePublishStatus = async () => {
    if (!course) return;
    
    try {
      setIsLoading(true);
      const response = await CourseService.togglePublishStatus(courseId, !course.isPublished);
      setCourse(prev => prev ? { ...prev, isPublished: !prev.isPublished } : null);
    } catch (error) {
      console.error("Erreur lors du changement de statut du cours:", error);
      setError("Impossible de modifier le statut du cours. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!course) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300">{error || "Cours non trouvé"}</p>
          <Link href="/teacher/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour à la liste des cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link
            href="/teacher/courses"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LucideArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            course.isPublished
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
          }`}>
            {course.isPublished ? 'Publié' : 'Brouillon'}
          </span>
          
          <button
            onClick={togglePublishStatus}
            className={`p-2 rounded-md ${
              course.isPublished
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {course.isPublished ? 'Dépublier' : 'Publier'}
          </button>
          
          <Link
            href={`/teacher/courses/${courseId}/edit`}
            className="p-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-md"
          >
            <LucideEdit className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informations du cours</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Prix</p>
              <p className="font-semibold">{typeof course.price === 'number' ? course.price.toFixed(2) : course.price}€</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Étudiants inscrits</p>
              <p className="font-semibold flex items-center">
                <LucideUsers className="h-4 w-4 mr-1" />
                {course.studentsCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
              <p className="font-semibold">
                {new Date(course.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-700 dark:text-gray-300">
                {course.description || "Aucune description"}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Leçons du cours</h2>
            <button
              onClick={() => setIsAddingLesson(true)}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <LucidePlus className="h-4 w-4 mr-1" />
              Ajouter une leçon
            </button>
          </div>

          {isAddingLesson && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4">
              <h3 className="text-md font-medium mb-3">Nouvelle leçon</h3>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-title"
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Ex: Introduction aux bases de HTML"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lesson-video" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de la vidéo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-video"
                    type="text"
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée (en minutes)
                  </label>
                  <input
                    id="lesson-duration"
                    type="number"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Ex: 15"
                    min="1"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingLesson(false);
                      setNewLesson({ title: "", videoUrl: "", duration: "" });
                    }}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune leçon n'a encore été ajoutée à ce cours.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Cliquez sur "Ajouter une leçon" pour commencer à créer du contenu.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      {lesson.duration && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {lesson.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {lesson.hasQuiz ? (
                      <Link
                        href={`/teacher/courses/${courseId}/lessons/${lesson.id}/quiz`}
                        className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs"
                      >
                        <LucideCheck className="h-4 w-4 mr-1" /> Quiz
                      </Link>
                    ) : (
                      <Link
                        href={`/teacher/courses/${courseId}/lessons/${lesson.id}/quiz`}
                        className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-xs"
                      >
                        <LucidePlus className="h-4 w-4 mr-1" /> Ajouter un quiz
                      </Link>
                    )}
                    <Link
                      href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}
                      className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                    >
                      <LucideEye className="h-4 w-4 mr-1" /> Voir
                    </Link>
                    <Link
                      href={`/teacher/courses/${courseId}/lessons/${lesson.id}/edit`}
                      className="flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs"
                    >
                      <LucideEdit className="h-4 w-4 mr-1" /> Modifier
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmation(lesson.id)}
                      className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs"
                    >
                      <LucideTrash className="h-4 w-4 mr-1" /> Supprimer
                    </button>
                    <button
                      onClick={() => moveLesson(lesson.id, 'up')}
                      className="flex items-center px-1 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs"
                      disabled={index === 0}
                    >
                      <LucideArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveLesson(lesson.id, 'down')}
                      className="flex items-center px-1 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-xs"
                      disabled={index === lessons.length - 1}
                    >
                      <LucideArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
