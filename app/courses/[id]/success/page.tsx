"use client";
import React, { useEffect, useState, use } from "react";
import { LessonService } from "@/services/lessonService";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface PaymentSuccessPageProps {
  params: Promise<{ id: string }>;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ params }) => {
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const data = await LessonService.getLessons(courseId);
        setLessons(data);
      } catch (e) {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, [courseId]);

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
        <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
        <p className="mb-4 text-lg text-gray-700">Merci pour votre achat. Vous avez maintenant accès au cours n°{courseId} et à toutes ses leçons.</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Leçons du cours</h2>
        {loading ? (
          <div>Chargement des leçons...</div>
        ) : lessons.length === 0 ? (
          <div>Aucune leçon trouvée pour ce cours.</div>
        ) : (
          <ul className="space-y-3">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-2 border-b pb-2">
                <span className="font-medium">{lesson.title}</span>
                <Link
                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                  className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Accéder
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href={`/student/courses/${courseId}`} className="inline-block mt-8 text-blue-600 hover:underline font-semibold">
        ← Retour à la page du cours
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;
