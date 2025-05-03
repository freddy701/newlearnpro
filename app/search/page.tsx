"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number | string;
  teacher?: {
    id: number;
    fullName: string;
    profilePictureUrl?: string;
  };
  isPublished: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les cours au chargement initial
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const response = await fetch(`/api/courses?isPublished=true`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.courses)) {
          const filteredCourses = data.courses.filter((c: Course) => c.isPublished);
          setAllCourses(filteredCourses);
          
          // Si pas de requête initiale, afficher tous les cours
          if (!initialQuery) {
            setCourses(filteredCourses);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des cours:", err);
      }
    };
    
    fetchAllCourses();
  }, [initialQuery]);

  // Effectuer la recherche lorsque la requête change
  useEffect(() => {
    // Si la requête est vide, afficher tous les cours
    if (!query) {
      setCourses(allCourses);
      return;
    }
    
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/courses?isPublished=true&query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.courses)) {
          const filteredCourses = data.courses.filter((c: Course) => c.isPublished);
          setCourses(filteredCourses);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Erreur lors de la recherche:", err);
        setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    // Utiliser un délai pour éviter trop de requêtes pendant la frappe
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300); // 300ms de délai
    
    return () => clearTimeout(timeoutId);
  }, [query, allCourses]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    
    // Mettre à jour l'URL avec le paramètre de recherche ou le supprimer si vide
    if (newQuery === "") {
      router.push('/search'); // URL sans paramètre de recherche
    } else {
      router.push(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Résultats de recherche</h1>
      
      <div className="mb-8 max-w-2xl">
        <SearchBar 
          placeholder="Rechercher des cours..." 
          onSearch={handleSearch} 
          initialValue={query}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : courses.length === 0 && query ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Aucun résultat trouvé pour "{query}"</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Essayez avec d'autres mots-clés ou parcourez nos catégories de cours.
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Chargement des cours...</p>
        </div>
      ) : (
        <div>
          {query ? (
            <p className="mb-4 text-gray-600 dark:text-gray-400">{courses.length} résultat(s) pour "{query}"</p>
          ) : (
            <p className="mb-4 text-gray-600 dark:text-gray-400">Tous les cours disponibles</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex flex-col">
                {/* Miniature du cours */}
                <div className="mb-3 w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl.startsWith('http') ? course.thumbnailUrl : `/images/${course.thumbnailUrl}`}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-gray-400">Pas d'image</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2 dark:text-blue-400">{course.title}</h2>
                <p className="text-gray-700 mb-2 line-clamp-3 dark:text-gray-200">{course.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2 dark:text-gray-300">
                  Enseignant : {course.teacher?.fullName || "-"}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-blue-600 dark:text-blue-300">{typeof course.price === "number" ? course.price.toFixed(2) : course.price} €</span>
                  <Link href={`/student/courses/${course.id}`} className="text-blue-600 hover:underline text-sm dark:text-blue-400">Voir le cours</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}