// Passe ce composant en composant client pour permettre l'utilisation de CourseList dynamiquement
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { CourseService, Course } from "@/services/courseService";

const CourseList = dynamic(() => import("./CourseList"), { ssr: false });

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CourseService.getCourses(1, 9).then(({ courses, meta }) => {
      setCourses(courses.filter((c) => c.isPublished));
      setMeta(meta);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tous les cours disponibles</h1>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <CourseList initialCourses={courses} initialMeta={meta} />
      )}
    </div>
  );
}
