"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Lesson {
  id: number;
  title: string;
  content: string;
  duration: number;
  quiz?: any;
}

export default function StudentLessonDetail() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!params?.id || !params?.lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${params.id}/lessons/${params.lessonId}`);
        if (res.status === 403) {
          const data = await res.json();
          setAccessDenied(true);
          setAccessMessage(data.message || "Accès refusé");
          setLesson(null);
        } else if (!res.ok) throw new Error("Erreur lors du chargement de la leçon");
        else {
          const data = await res.json();
          setLesson(data);
        }
        // --- AJOUT : Marquer la leçon comme commencée/complétée dynamiquement ---
        // On notifie le backend que l'utilisateur a consulté la leçon
        const sessionUserId = (typeof window !== "undefined") ? window.localStorage.getItem("userId") : null;
        // On tente de récupérer l'ID utilisateur depuis la session côté client si besoin (à adapter selon ton auth)
        fetch(`/api/students/${sessionUserId || params.userId || params.id}/lessons/${params.lessonId}/progress`, {
          method: "POST"
        });
        // --------------------------------------------------
      } catch (err) {
        setError("Impossible de charger la leçon.");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params?.id, params?.lessonId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }
  if (accessDenied) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{accessMessage}</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => router.push(`/student/courses/${params.id}/enroll`)}>S’inscrire et payer</button>
      </div>
    );
  }
  if (!lesson) {
    return <div className="text-center py-12 text-gray-500">Leçon introuvable.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <div className="mb-4 text-gray-500">Durée : {lesson.duration} min</div>
      <div className="prose mb-8" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      <Link href={`/student/courses/${params.id}`} className="text-blue-600 hover:underline mt-6 block">← Retour au cours</Link>
    </div>
  );
}
