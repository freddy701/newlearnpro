"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Course } from "@/services/courseService";
import Link from "next/link";
import StripePaymentModal from "@/components/StripePaymentModal" // Import the StripePaymentModal component

export default function StudentCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<{ paid: boolean } | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Add the showPaymentModal state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!params?.id) return;
      setEnrollLoading(true);
      try {
        const res = await fetch(`/api/courses/${params.id}/enroll`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setEnrollment({ paid: !!data.paid });
        } else {
          setEnrollment({ paid: false });
        }
      } catch {
        setEnrollment({ paid: false });
      } finally {
        setEnrollLoading(false);
      }
    };
    fetchEnrollment();
  }, [params?.id]);

  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  function getYoutubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : "";
  }

  // Fonction pour afficher le toast d'accès verrouillé
  const handleLockedLessonClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Fonction pour afficher le toast de succès après paiement
  const handlePaymentSuccess = async () => {
    setShowSuccessToast(true);
    // Rafraîchir l'état d'enrollment (et donc déverrouiller les leçons)
    await fetchEnrollment();
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

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
      {/* Bouton inscription en haut à droite */}
      <div className="flex justify-end items-center mb-2">
        {!enrollLoading && !enrollment?.paid && (
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow"
            onClick={() => setShowPaymentModal(true)} // Open the payment modal on click
          >
            S’inscrire et payer
          </button>
        )}
      </div>
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
            <div className="flex flex-col gap-4">
              {(course as any).lessons.map((lesson: any, idx: number) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 border p-2 rounded cursor-pointer ${!enrollment?.paid ? 'opacity-60 pointer-events-auto' : 'hover:bg-blue-50'}`}
                  onClick={() => {
                    if (!enrollment?.paid) {
                      handleLockedLessonClick();
                      return;
                    }
                    setSelectedLesson(idx);
                  }}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Aucune leçon disponible.</div>
          )}
        </div>
        {/* Lecteur vidéo et détails */}
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
      </div>
      <div className="mt-6">
        <Link href="/student/courses" className="text-blue-600 hover:underline">← Retour à la liste des cours</Link>
      </div>
      {/* Toast plein écran */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
            <span className="text-5xl">🔒</span>
            <div className="font-semibold text-lg text-center">Vous devez vous inscrire et payer ce cours<br/>pour accéder à cette leçon.</div>
          </div>
        </div>
      )}
      {/* Toast de succès paiement */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded flex items-center shadow-lg z-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4 -4" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
          Achat effectué avec succès !
        </div>
      )}
      {/* Modale de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-0 relative w-full max-w-lg">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <StripePaymentModal
              courseId={course.id}
              amount={course.price}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
