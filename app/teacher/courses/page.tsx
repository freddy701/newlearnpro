"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucidePlus, LucideSearch, LucideEdit, LucideTrash, LucideEye } from "lucide-react";

// Types pour les cours
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  isPublished: boolean;
  studentsCount: number;
  createdAt: string;
}

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Simuler la récupération des cours de l'enseignant
  useEffect(() => {
    // Dans un environnement de production, vous feriez un appel API pour récupérer les cours
    const mockCourses: Course[] = [
      {
        id: 1,
        title: "Introduction au développement web",
        description: "Apprenez les bases du développement web...",
        thumbnailUrl: "/images/code-bg.jpg",
        price: 49.99,
        isPublished: true,
        studentsCount: 24,
        createdAt: "2025-01-15"
      },
      {
        id: 2,
        title: "JavaScript moderne",
        description: "Maîtrisez JavaScript et ses frameworks modernes",
        thumbnailUrl: "/images/javascript-bg.jpg",
        price: 59.99,
        isPublished: true,
        studentsCount: 18,
        createdAt: "2025-02-20"
      },
      {
        id: 3,
        title: "Python pour la data science",
        description: "Explorez l'analyse de données avec Python",
        thumbnailUrl: "/images/python-bg.jpg",
        price: 69.99,
        isPublished: false,
        studentsCount: 0,
        createdAt: "2025-03-10"
      }
    ];

    setCourses(mockCourses);
    setIsLoading(false);
  }, []);

  // Filtrer les cours en fonction de la recherche
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Supprimer un cours
  const deleteCourse = (courseId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
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
            Créer un nouveau cours
          </Link>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Vous n'avez pas encore créé de cours</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par créer votre premier cours pour partager vos connaissances avec vos étudiants.
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
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 h-48 md:h-auto">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/640x360?text=Image+non+disponible";
                    }}
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-4">Prix: {course.price.toFixed(2)}€</span>
                        <span className="mr-4">Étudiants: {course.studentsCount}</span>
                        <span>Créé le: {course.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="mb-4">
                        {course.isPublished ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold rounded-full">
                            Publié
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold rounded-full">
                            Brouillon
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link 
                          href={`/teacher/courses/${course.id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Voir"
                        >
                          <LucideEye className="h-5 w-5" />
                        </Link>
                        <Link 
                          href={`/teacher/courses/${course.id}/edit`}
                          className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                          title="Modifier"
                        >
                          <LucideEdit className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <LucideTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
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
