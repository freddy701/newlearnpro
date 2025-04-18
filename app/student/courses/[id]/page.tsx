"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Course } from "@/services/courseService";
import Link from "next/link";

export default function StudentCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) throw new Error("Erreur lors du chargement du cours");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError("Impossible de charger les détails du cours.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params?.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Chargement...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }
  if (!course) {
    return <div className="text-center py-12 text-gray-500">Cours introuvable.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-700 mb-2">{course.description}</p>
      <div className="mb-4">
        <span className="font-semibold">Enseignant : </span>
        {course.teacher?.fullName || "-"}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Prix : </span>
        {typeof course.price === "number" ? course.price.toFixed(2) : course.price} €
      </div>
      <div className="mb-4">
        <span className="font-semibold">Nombre de leçons : </span>
        {course.lessons?.length ?? 0}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Étudiants inscrits : </span>
        {course.studentsCount ?? 0}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Programme du cours</h2>
        {course.lessons && course.lessons.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {course.lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-2">
                <Link
                  href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {lesson.title}
                </Link>
                {lesson.videoUrl && (
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-xs text-green-700 underline hover:text-green-900"
                  >
                    Ressource
                  </a>
                )}
                <span className="text-xs text-gray-400">{lesson.duration} min</span>
                {lesson.hasQuiz && <span className="ml-2 text-green-600 text-xs">Quiz</span>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">Aucune leçon disponible.</div>
        )}
      </div>
      <Link href="/student/courses" className="text-blue-600 hover:underline">← Retour à la liste des cours</Link>
    </div>
  );
}
