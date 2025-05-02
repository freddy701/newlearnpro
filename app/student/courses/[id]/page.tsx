"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Course } from "@/services/courseService";
import Link from "next/link";
import StripePaymentModal from "@/components/StripePaymentModal";
import Toast from "@/components/ui/Toast"; // Import the Toast component
import StudyGroupWidget from "./StudyGroupWidget"; // Import the StudyGroupWidget component

export default function StudentCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<{ paid: boolean } | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Gestion du cas où l'ID est "my-courses" (évite les appels API invalides)
  if (params?.id === "my-courses") {
    return null;
  }

  // --- Correction : Déplacement de fetchEnrollment en dehors du useEffect ---
  const fetchEnrollment = async () => {
    if (!params?.id) return;
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`); // Correction ici : utilise l'API du cours avec isEnrolled
      if (res.ok) {
        const data = await res.json();
        setEnrollment({ paid: !!data.isEnrolled });
        setCourse(data); // Assure la synchro du state course
      } else {
        setEnrollment({ paid: false });
      }
    } catch {
      setEnrollment({ paid: false });
    } finally {
      setEnrollLoading(false);
    }
  };

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
    fetchEnrollment();
  }, [params?.id]);

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

    // Retry mechanism pour attendre la propagation du paiement côté backend
    let attempts = 0;
    let enrollmentUpdated = false;
    while (attempts < 5 && !enrollmentUpdated) {
      // On attend le résultat du fetch
      await fetchEnrollment();
      // On attend un tout petit délai avant de vérifier l'état (setEnrollment est async)
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (enrollment?.paid) {
        enrollmentUpdated = true;
        break;
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 700)); // 700ms entre chaque essai
    }

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

  const courseId = parseInt(params.id);

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 flex flex-col gap-8">
      {/* Bouton inscription en haut à droite */}
      <div className="flex justify-end items-center mb-2">
        {!enrollLoading && !enrollment?.paid && (
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow"
            onClick={() => setShowPaymentModal(true)} 
          >
            S’inscrire et payer
          </button>
        )}
      </div>
      {/* Image du cours */}
      {/* Image supprimée des propriétés du cours */}
      <div>
        <h1 className="text-3xl font-bold mb-4 dark:text-blue-400">{course.title}</h1>
        {course.description && <p className="text-gray-700 mb-2 dark:text-gray-200">{course.description}</p>}
        {course.teacher?.fullName && (
          <div className="mb-4 text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Enseignant : </span>
            {course.teacher.fullName}
          </div>
        )}
        {typeof course.price === "number" && (
          <div className="mb-4">
            <span className="font-bold text-blue-600 dark:text-blue-300">
              {course.price.toFixed(2)} €
            </span>
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
      {/* Programme du cours */}
      {(!enrollLoading && enrollment?.paid) ? (
        <div>
          <h2 className="text-xl font-bold mb-2 mt-8">Programme du cours</h2>
          {(course as any).lessons && (course as any).lessons.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(course as any).lessons.map((lesson: any, idx: number) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 border p-2 rounded cursor-pointer dark:bg-gray-800 ${!enrollment?.paid ? 'opacity-60 pointer-events-auto' : 'hover:bg-blue-50'}`}
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
                    <span className="font-semibold text-base text-blue-800 dark:text-blue-400">{lesson.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">{lesson.duration} min</span>
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
      ) : (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded">
          <span>Vous devez vous inscrire et payer pour accéder au contenu du cours.</span>
        </div>
      )}
      {/* Lecteur vidéo */}
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
      {/* Affichage du widget groupe d'étude uniquement si inscrit */}
      {enrollment?.paid && courseId && (
        <StudyGroupWidget courseId={courseId} />
      )}
      <div className="mt-6">
        <Link href="/student/courses" className="text-blue-600 hover:underline dark:text-blue-400">← Retour à la liste des cours</Link>
      </div>
      {/* Toast plein écran */}
      {showToast && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
            <span className="text-lg font-semibold text-gray-800 dark:text-blue-200">Cours verrouillé</span>
            <span className="text-gray-600 dark:text-gray-300">Vous devez vous inscrire et payer pour accéder à cette leçon.</span>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => setShowToast(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {/* Toast de succès paiement */}
      {showSuccessToast && (
        <Toast
          message="Paiement effectué avec succès !"
          type="success"
          visible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        />
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
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPaymentModal(false)} // <-- Ajoute la fermeture du modal ici
            />
          </div>
        </div>
      )}
    </div>
  );
}
