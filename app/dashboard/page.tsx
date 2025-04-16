"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CourseImage from "@/components/course-image";
import BecomeTeacherModal from "@/components/ui/become-teacher-modal";

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={openModal}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Devenir formateur ?
          </button>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cours de développement web */}
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <CourseImage
              src="/images/code-bg.jpg"
              alt="Introduction au développement web"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Introduction au développement web</h3>
            <p className="text-gray-300 text-sm mb-4">Apprenez les bases du développement web...</p>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">49.99€</span>
              <Link
                href="/dashboard/cours/1"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>

        {/* Cours de JavaScript */}
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <CourseImage
              src="/images/javascript-bg.jpg"
              alt="JavaScript moderne"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">JavaScript moderne</h3>
            <p className="text-gray-300 text-sm mb-4">Maîtrisez JavaScript et ses frameworks modernes</p>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">59.99€</span>
              <Link
                href="/dashboard/cours/2"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>

        {/* Cours de Python */}
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <CourseImage
              src="/images/python-bg.jpg"
              alt="Python pour la data science"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Python pour la data science</h3>
            <p className="text-gray-300 text-sm mb-4">Explorez l'analyse de données avec Python</p>
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">69.99€</span>
              <Link
                href="/dashboard/cours/3"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour devenir formateur */}
      <BecomeTeacherModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
