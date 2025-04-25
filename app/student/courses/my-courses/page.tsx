// Composant client pour afficher les cours auxquels l'apprenant est inscrit
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function MyCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<{ [lessonId: number]: { isCompleted: boolean, quizScore?: number } }>({});

  useEffect(() => {
    if (!session?.user?.id) return;
    // Appel au nouvel endpoint backend pour les cours
    fetch(`/api/students/${session.user.id}/courses`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      });
    // Appel au nouvel endpoint backend pour la progression des leçons
    fetch(`/api/students/${session.user.id}/lessons/progress`)
      .then((res) => res.json())
      .then((progresses) => {
        // Crée une map lessonId -> progress
        const map: { [lessonId: number]: { isCompleted: boolean, quizScore?: number } } = {};
        progresses.forEach((p: any) => {
          map[p.lessonId] = { isCompleted: p.isCompleted, quizScore: p.quizScore };
        });
        setProgressMap(map);
      });
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes cours</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : courses.length === 0 ? (
        <div>Vous n'êtes inscrit à aucun cours pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 dark:text-blue-400">{course.title}</h2>
              <p className="text-gray-600 mb-2 dark:text-gray-200">{course.description}</p>
              <Link href={`/student/courses/${course.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                Voir le cours
              </Link>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                Progression : {course.progress ?? 0}%
              </div>
              {/* Affichage des leçons avec progress bar */}
              {course.lessons?.map((lesson: any) => (
                <div key={lesson.id} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  {/* Infos leçon */}
                  <img src={lesson.thumbnail || "/default-thumbnail.png"} alt="thumbnail" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6, marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }} className="dark:text-blue-300">{lesson.title}</div>
                    <div style={{ fontSize: 13, color: "#aaa" }}>{lesson.duration} min</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: 120, marginLeft: 16 }}>
                    <div style={{ background: "#e5e7eb", borderRadius: 8, height: 12, width: "100%" }}>
                      <div style={{
                        background: "#2851a3",
                        height: 12,
                        borderRadius: 8,
                        width: progressMap[lesson.id]?.isCompleted ? "100%" : "0%",
                        transition: "width 0.5s"
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
