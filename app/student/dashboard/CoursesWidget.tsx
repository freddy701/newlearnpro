"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Course } from "@/services/courseService";

export default function CoursesWidget() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses?isPublished=true&limit=6&page=1")
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Cours disponibles</h2>
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500">Aucun cours publié pour le moment.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {courses.map(course => (
            <li key={course.id} className="py-2 flex flex-col gap-1">
              <span className="font-medium text-blue-700">{course.title}</span>
              <span className="text-sm text-gray-500 line-clamp-1">{course.description}</span>
              <div className="flex items-center text-xs text-gray-400">
                Enseignant : {course.teacher?.fullName || "-"}
                <span className="ml-2 font-bold text-blue-600">
                  {typeof course.price === "number" ? course.price.toFixed(2) : course.price} €
                </span>
              </div>
              <Link href={`/student/courses/${course.id}`} className="text-xs text-blue-600 hover:underline">Voir le cours</Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-right">
        <Link href="/student/courses" className="text-blue-600 hover:underline text-sm">Voir tous les cours →</Link>
      </div>
    </div>
  );
}
