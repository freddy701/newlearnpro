"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LucideUsers, LucideMessageSquare, LucideChevronRight } from "lucide-react";

export default function MesGroupes() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Exemple de groupes d'étude
  const groupes = [
    {
      id: 1,
      nom: "Groupe JavaScript Avancé",
      coursId: 2,
      coursTitre: "JavaScript moderne",
      membres: 8,
      messagesNonLus: 3,
      dernierMessage: "Il y a 2 heures"
    },
    {
      id: 2,
      nom: "Entraide HTML/CSS",
      coursId: 1,
      coursTitre: "Introduction au développement web",
      membres: 12,
      messagesNonLus: 0,
      dernierMessage: "Hier"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Mes groupes</h1>
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher un groupe..."
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

      {groupes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {groupes.map((groupe) => (
            <div key={groupe.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{groupe.nom}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                      Lié au cours: {groupe.coursTitre}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <LucideUsers className="w-4 h-4 mr-1" />
                      <span className="text-sm">{groupe.membres}</span>
                    </div>
                    {groupe.messagesNonLus > 0 && (
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {groupe.messagesNonLus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <LucideMessageSquare className="w-4 h-4 mr-1" />
                  <span>Dernier message: {groupe.dernierMessage}</span>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <Link
                    href={`/dashboard/groupes/${groupe.id}/chat`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <LucideMessageSquare className="w-4 h-4 mr-2" />
                    Accéder au chat
                  </Link>
                  
                  <Link
                    href={`/dashboard/groupes/${groupe.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Voir les détails
                    <LucideChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <LucideUsers className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun groupe</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Vous ne faites partie d&apos;aucun groupe d&apos;étude pour le moment.</p>
        </div>
      )}
    </div>
  );
}
