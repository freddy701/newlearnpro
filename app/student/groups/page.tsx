"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Mes groupes d'étude</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && groups.length === 0 && (
        <div>Vous n'appartenez à aucun groupe d'étude pour l'instant.</div>
      )}
      <ul className="space-y-4">
        {groups.map(group => (
          <li key={group.id} className="border rounded p-4 bg-white flex flex-col gap-1">
            <div className="font-semibold">{group.name}</div>
            <div className="text-sm text-gray-600">Cours : {group.course?.title}</div>
            <div className="text-xs text-gray-500">Créé le {new Date(group.createdAt).toLocaleDateString()}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {group.members.map((m: any) => (
                <span key={m.user.id} className="px-2 py-1 bg-gray-100 rounded text-xs">{m.user.fullName}</span>
              ))}
            </div>
            <Link href={`/student/courses/${group.courseId}`} className="mt-2 text-blue-600 hover:underline text-xs">Accéder au cours</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
