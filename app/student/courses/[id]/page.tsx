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

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  function getYoutubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : "";
  }

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
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 flex flex-col gap-8">
      {/* Image du cours */}
      {/* Image supprimée des propriétés du cours */}
      <div>
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        {course.description && <p className="text-gray-700 mb-2">{course.description}</p>}
        {course.teacher?.fullName && (
          <div className="mb-4">
            <span className="font-semibold">Enseignant : </span>
            {course.teacher.fullName}
          </div>
        )}
        {typeof course.price === "number" && (
          <div className="mb-4">
            <span className="font-semibold">Prix : </span>
            {course.price.toFixed(2)} €
          </div>
        )}
        {(course as any).lessons?.length > 0 && (
          <div className="mb-4">
            <span className="font-semibold">Nombre de leçons : </span>
            {(course as any).lessons.length}
          </div>
        )}
        {course.studentsCount > 0 && (
          <div className="mb-4">
            <span className="font-semibold">Étudiants inscrits : </span>
            {course.studentsCount}
          </div>
        )}
      </div>
      {/* Leçons avec navigation vidéo */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Liste des leçons avec miniatures */}
        <div className="md:w-1/3 w-full">
          <h2 className="text-xl font-semibold mb-2">Programme du cours</h2>
          {(course as any).lessons && (course as any).lessons.length > 0 ? (
            <ul className="space-y-4">
              {(course as any).lessons.map((lesson: any, idx: number) => (
                <li
                  key={lesson.id}
                  className={`flex gap-4 cursor-pointer rounded transition p-2 ${selectedLesson === idx ? "bg-blue-50" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedLesson(idx)}
                >
                  <div className="relative w-[120px] h-[68px] flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                    {lesson.videoUrl ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYoutubeId(lesson.videoUrl)}/mqdefault.jpg`}
                        alt={lesson.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs flex items-center justify-center w-full h-full">Pas de vidéo</span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-semibold text-base text-blue-800">{lesson.title}</span>
                    <span className="text-xs text-gray-500 ml-2">{lesson.duration} min</span>
                    {lesson.hasQuiz && (
                      <button
                        className="text-xs text-white bg-blue-600 px-2 py-1 rounded ml-2 hover:bg-blue-700 transition"
                        onClick={e => {
                          e.stopPropagation();
                          window.location.href = `/student/courses/${course.id}/lessons/${lesson.id}/quiz`;
                        }}
                      >
                        Faire le quiz
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Aucune leçon disponible.</div>
          )}
        </div>
        {/* Lecteur vidéo et détails */}
        {/* Suppression du détail de la leçon sélectionnée */}
      </div>
      {/* Affichage de la vidéo en grand si une leçon est sélectionnée et a une vidéo */}
      {selectedLesson !== null && (course as any).lessons?.[selectedLesson]?.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedLesson(null)}
              className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded-full px-2 py-1 text-black hover:bg-opacity-100"
              aria-label="Fermer la vidéo"
            >
              ✕
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId((course as any).lessons[selectedLesson].videoUrl)}?autoplay=1`}
              title={(course as any).lessons[selectedLesson].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
      <div className="mt-6">
        <Link href="/student/courses" className="text-blue-600 hover:underline">← Retour à la liste des cours</Link>
      </div>
    </div>
  );
}
