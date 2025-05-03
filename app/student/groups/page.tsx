"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LucideUsers, LucideBookOpen, LucideCalendar } from "lucide-react";

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/student/groups");
        if (!res.ok) throw new Error("Erreur lors de la récupération des groupes");
        const data = await res.json();
        setGroups(data.groups);
      } catch (e: any) {
        setError(e.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">Mes groupes d'étude</h1>
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {!loading && !error && groups.length === 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <LucideUsers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">Aucun groupe d'étude</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Vous n'appartenez à aucun groupe d'étude pour l'instant.</p>
          <Link href="/student/courses" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Explorer les cours
          </Link>
        </div>
      )}
      
      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-blue-400 flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                      <LucideUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {group.name}
                  </h2>
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
                    {group.members.length} membre{group.members.length > 1 ? "s" : ""}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <LucideBookOpen className="h-4 w-4 mr-2" />
                  <span className="font-medium">Cours :</span>
                  <span className="ml-1">{group.course?.title}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <LucideCalendar className="h-3.5 w-3.5 mr-1.5" />
                  Créé le {new Date(group.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {group.members.map((m: any) => (
                    <div key={m.user.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
                        {m.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{m.user.fullName}</span>
                    </div>
                  ))}
                </div>
                
                <Link 
                  href={`/student/courses/${group.courseId}`} 
                  className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Accéder au cours
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
