"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Course } from "@/services/courseService";
import SearchBar from "@/components/SearchBar";

interface CourseListProps {
  initialCourses: Course[];
  initialMeta: { 
    page: number; 
    limit: number; 
    totalCount: number; 
    totalPages: number; 
    hasNextPage: boolean; 
    hasPrevPage: boolean 
  };
}

export default function CourseList({ initialCourses, initialMeta }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialMeta.page);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page === initialMeta.page && query === "") return;
    setLoading(true);
    setError(null);
    fetch(`/api/courses?isPublished=true&page=${page}&limit=${meta.limit}&query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.courses)) {
          setCourses(data.courses.filter((c: Course) => c.isPublished));
        } else {
          setCourses([]);
        }
        setMeta(data.meta || initialMeta);
        setLoading(false);
      })
      .catch(() => {
        setCourses([]);
        setMeta(initialMeta);
        setError("Erreur lors du chargement des cours.");
        setLoading(false);
      });
  }, [page, query]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Si la requête est vide, réinitialiser à la première page
    if (searchQuery === "") {
      setPage(1);
    } else {
      setPage(1); // Toujours revenir à la première page lors d'une nouvelle recherche
    }
  };

  return (
    <div>
      {/* Recherche */}
      <SearchBar 
        placeholder="Rechercher un cours..." 
        onSearch={handleSearch} 
        initialValue={query}
        className="mb-6"
      />
      
      {/* Affichage erreur */}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}
      
      {/* Grille des cours */}
      {loading ? (
        <div className="text-center text-gray-800 dark:text-gray-200">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Aucun cours publié trouvé.</div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="bg-white shadow rounded-lg p-5 flex flex-col">
                {/* Miniature du cours */}
                <div className="mb-3 w-full aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {course.thumbnailUrl ? (
                    <img
                      src={`/images/${course.thumbnailUrl}`}
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
            ))
          )}
        </div>
      )}
      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>
        <span className="text-gray-600">Page {meta.page} / {meta.pages}</span>
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          disabled={page >= meta.pages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
