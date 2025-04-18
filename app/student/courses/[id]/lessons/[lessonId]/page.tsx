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

  useEffect(() => {
    const fetchLesson = async () => {
      if (!params?.id || !params?.lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${params.id}/lessons/${params.lessonId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement de la leçon");
        const data = await res.json();
        setLesson(data);
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
  if (!lesson) {
    return <div className="text-center py-12 text-gray-500">Leçon introuvable.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <div className="mb-4 text-gray-500">Durée : {lesson.duration} min</div>
      <div className="prose mb-8" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      {lesson.quiz && (
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <span className="font-semibold text-blue-700">Quiz disponible pour cette leçon</span>
        </div>
      )}
      <Link href={`/student/courses/${params.id}`} className="text-blue-600 hover:underline">← Retour au cours</Link>
    </div>
  );
}
