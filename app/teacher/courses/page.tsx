"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucidePlus, 
  LucideEdit, 
  LucideTrash, 
  LucideEye, 
  LucideUsers,
  LucideSearch,
  LucideCheck,
  LucideX
} from "lucide-react";
import { CourseService, Course } from "@/services/courseService";

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  // Charger les cours de l'enseignant
  useEffect(() => {
    const loadCourses = async () => {
      if (status === "authenticated" && session?.user.id) {
        try {
          setIsLoading(true);
          const response = await CourseService.getTeacherCourses(parseInt(session.user.id));
          setCourses(response.courses);
        } catch (error) {
          console.error("Erreur lors du chargement des cours:", error);
          setError("Impossible de charger vos cours. Veuillez réessayer plus tard.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCourses();
  }, [session, status]);

  // Filtrer les cours en fonction de la recherche
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Supprimer un cours
  const deleteCourse = async (courseId: number) => {
    try {
      await CourseService.deleteCourse(courseId);
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du cours:", error);
      setError("Impossible de supprimer ce cours. Veuillez réessayer plus tard.");
    }
  };

  // Changer le statut de publication d'un cours
  const togglePublishStatus = async (courseId: number, currentStatus: boolean) => {
    try {
      await CourseService.togglePublishStatus(courseId, !currentStatus);
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, isPublished: !currentStatus } 
            : course
        )
      );
    } catch (error) {
      console.error("Erreur lors du changement de statut du cours:", error);
      setError("Impossible de modifier le statut de ce cours. Veuillez réessayer plus tard.");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className="px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Link
            href="/teacher/courses/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LucidePlus className="h-5 w-5 mr-2" />
            Créer un cours
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Vous n'avez pas encore créé de cours</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez à créer votre premier cours pour partager vos connaissances avec vos étudiants.
          </p>
          <Link
            href="/teacher/courses/create"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LucidePlus className="h-5 w-5 mr-2" />
            Créer votre premier cours
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Affichage de la miniature du cours */}
              {course.thumbnailUrl ? (
                <img
                  src={`/images/${course.thumbnailUrl}`}
                  alt={`Miniature du cours ${course.title}`}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded mb-2 text-gray-400 text-sm">
                  Pas d'image
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center mr-4">
                    <LucideUsers className="h-4 w-4 mr-1" />
                    {course.studentsCount || 0} étudiants
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {course.lessonsCount || 0} leçons
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description || "Aucune description"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{typeof course.price === 'number' ? course.price.toFixed(2) : course.price}€</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePublishStatus(course.id, course.isPublished)}
                      className={`p-2 rounded-full ${
                        course.isPublished
                          ? 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                          : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                      title={course.isPublished ? "Dépublier" : "Publier"}
                    >
                      {course.isPublished ? <LucideX className="h-5 w-5" /> : <LucideCheck className="h-5 w-5" />}
                    </button>
                    
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full"
                      title="Voir le cours"
                    >
                      <LucideEye className="h-5 w-5" />
                    </Link>
                    
                    <Link
                      href={`/teacher/courses/${course.id}/edit`}
                      className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full"
                      title="Modifier le cours"
                    >
                      <LucideEdit className="h-5 w-5" />
                    </Link>
                    
                    {deleteConfirmation === course.id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                          title="Confirmer la suppression"
                        >
                          <LucideCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(null)}
                          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          title="Annuler"
                        >
                          <LucideX className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmation(course.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                        title="Supprimer le cours"
                      >
                        <LucideTrash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}