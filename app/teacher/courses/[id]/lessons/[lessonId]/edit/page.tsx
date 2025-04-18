"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucideLoader2, 
  LucideCheck
} from "lucide-react";
import { CourseService } from "@/services/courseService";
import { LessonService } from "@/services/lessonService";

export default function EditLessonPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  // Utiliser React.use pour accéder aux paramètres comme recommandé par Next.js
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const lessonId = parseInt(resolvedParams.lessonId);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    videoUrl: "",
    position: "",
    duration: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les détails de la leçon
  useEffect(() => {
    const loadLesson = async () => {
      if (isNaN(courseId) || isNaN(lessonId)) {
        setError("ID de cours ou de leçon invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Vérifier les autorisations
        const course = await CourseService.getCourse(courseId);
        if (
          session?.user.id && 
          course.teacherId !== parseInt(session.user.id) && 
          session.user.role !== "ADMIN"
        ) {
          router.push("/teacher/courses");
          return;
        }
        
        // Charger les détails de la leçon
        const lessonData = await LessonService.getLesson(courseId, lessonId);
        
        setLessonForm({
          title: lessonData.title,
          content: lessonData.content || "",
          videoUrl: lessonData.videoUrl || "",
          position:
            lessonData.position !== undefined && lessonData.position !== null
              ? lessonData.position.toString()
              : "",
          duration:
            lessonData.duration !== undefined && lessonData.duration !== null
              ? lessonData.duration.toString()
              : ""
        });
      } catch (error) {
        console.error("Erreur lors du chargement de la leçon:", error);
        setError("Impossible de charger les détails de la leçon. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadLesson();
    }
  }, [courseId, lessonId, session, status, router]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonForm(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!lessonForm.title.trim()) {
      newErrors.title = "Le titre est obligatoire";
    }
    if (!lessonForm.videoUrl.trim()) {
      newErrors.videoUrl = "L'URL de la vidéo est obligatoire";
    }
    
    if (!lessonForm.position.trim()) {
      newErrors.position = "La position est obligatoire";
    } else if (isNaN(parseInt(lessonForm.position)) || parseInt(lessonForm.position) <= 0) {
      newErrors.position = "La position doit être un nombre positif";
    }
    
    if (lessonForm.duration && isNaN(parseInt(lessonForm.duration))) {
      newErrors.duration = "La durée doit être un nombre (en minutes)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      
      const response = await LessonService.updateLesson(courseId, lessonId, {
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl,
        position: parseInt(lessonForm.position),
        duration: lessonForm.duration ? parseInt(lessonForm.duration) : null
      });
      
      setSuccess("Leçon mise à jour avec succès");
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/lessons/${lessonId}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la leçon:", error);
      setError("Impossible de mettre à jour la leçon. Veuillez réessayer plus tard.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <Link
          href={`/teacher/courses/${courseId}/lessons/${lessonId}`}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Modifier la leçon</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-md mb-6 flex items-center">
          <LucideCheck className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la leçon <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={lessonForm.title}
              onChange={handleChange}
              className={`block w-full rounded-md border ${
                errors.title ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Ex: Introduction à HTML"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenu de la leçon
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={lessonForm.content}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Contenu de la leçon (HTML supporté)"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Vous pouvez utiliser du HTML pour formater le contenu.
            </p>
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de la vidéo <span className="text-red-500">*</span>
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="text"
              value={lessonForm.videoUrl}
              onChange={handleChange}
              className={`block w-full rounded-md border ${
                errors.videoUrl ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Ex: https://www.youtube.com/watch?v=xxxx"
            />
            {errors.videoUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.videoUrl}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position dans le cours <span className="text-red-500">*</span>
              </label>
              <input
                id="position"
                name="position"
                type="number"
                min="1"
                value={lessonForm.position}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.position ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="Ex: 1"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durée estimée (minutes)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={lessonForm.duration}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.duration ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="Ex: 30"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href={`/teacher/courses/${courseId}/lessons/${lessonId}`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <LucideLoader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
