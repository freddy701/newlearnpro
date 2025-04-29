"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGroups() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/teacher/groups");
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
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800">Groupes d'étude créés</h1>
      {loading && (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
        </div>
      )}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && groups.length === 0 && (
        <div className="text-gray-500 text-center">Aucun groupe d'étude créé pour l'instant.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-2 border hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2" />
                {group.name}
              </div>
              <span className="text-xs text-gray-400">{group.members.length} membre{group.members.length > 1 ? "s" : ""}</span>
            </div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Cours :</span> {group.course?.title}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {group.members.map((m: any) => (
                <span key={m.user.id} className={`px-2 py-1 bg-gray-100 rounded text-xs border flex items-center gap-1 ${m.user.fullName === "fred" ? "border-blue-600 text-blue-700 font-bold" : "border-gray-200"}`}>
                  {/* Avatar placeholder */}
                  <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold text-blue-800">
                    {m.user.fullName.charAt(0).toUpperCase()}
                  </span>
                  {m.user.fullName}
                  {m.user.fullName === "fred" && <span className="ml-1 bg-blue-600 text-white rounded px-1 text-xxs">Vous</span>}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-xs text-gray-500">Créé le {new Date(group.createdAt).toLocaleDateString()}</span>
              <Link href={`/teacher/courses/${group.courseId}`} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all">Accéder au cours</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
