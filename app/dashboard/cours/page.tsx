"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LucidePlay, LucideCheckCircle, LucideChevronRight, LucideBook } from "lucide-react";
import CourseImage from "@/components/course-image";

export default function MesCours() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Exemple de cours inscrits
  const coursInscrits = [
    {
      id: 1,
      titre: "Introduction au développement web",
      image: "/images/code-bg.jpg",
      progression: 35,
      totalLessons: 12,
      completedLessons: 4,
    },
    {
      id: 2,
      titre: "JavaScript moderne",
      image: "/images/javascript-bg.jpg",
      progression: 20,
      totalLessons: 15,
      completedLessons: 3,
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher un cours..."
            className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {coursInscrits.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {coursInscrits.map((cours) => (
            <div key={cours.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-64 h-48 md:h-auto">
                  <CourseImage
                    src={cours.image}
                    alt={cours.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cours.titre}</h3>
                  
                  <div className="mt-4 mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progression: {cours.progression}%
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cours.completedLessons}/{cours.totalLessons} leçons
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${cours.progression}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/dashboard/cours/${cours.id}/continuer`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <LucidePlay className="w-4 h-4 mr-2" />
                      Continuer
                    </Link>
                    
                    <Link
                      href={`/dashboard/cours/${cours.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Voir le détail
                      <LucideChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <LucideBook className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun cours inscrit</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Vous n&apos;êtes inscrit à aucun cours pour le moment.</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Explorer les cours
          </Link>
        </div>
      )}
    </div>
  );
}
