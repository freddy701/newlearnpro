"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideArrowLeft, LucideUpload, LucidePlus, LucideTrash, LucideCheck, LucideLoader2 } from "lucide-react";
import { CourseService } from "@/services/courseService";
import Toast from "@/components/ui/Toast";

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnailUrl: "",
    isPublished: false
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [lessons, setLessons] = useState<{ title: string; videoUrl: string; duration: string }[]>([]);
  const [quizzes, setQuizzes] = useState<{ lessonIndex: number; question: string; options: string[]; correctAnswer: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({ message: "", type: "success", visible: false });

  // Afficher le toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
  };

  // Afficher le toast et rediriger après fermeture
  const showToastAndRedirect = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    // La redirection sera déclenchée dans closeToast si succès
  };

  // Fermer le toast
  const closeToast = () => {
    setToast((t) => {
      // Si c'était un succès, on redirige après fermeture
      if (t.type === "success" && t.visible) {
        router.push("/teacher/courses");
      }
      return { ...t, visible: false };
    });
  };

  // Gérer les changements dans le formulaire du cours
  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ s'il y en a une
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gérer le téléchargement de la miniature
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dans un environnement de production, vous téléchargeriez le fichier sur un serveur
      // Pour cet exemple, nous utilisons simplement un URL d'objet local
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setCourseData(prev => ({ ...prev, thumbnailUrl: file.name }));
    }
  };

  // Ajouter une nouvelle leçon vide
  const addLesson = () => {
    setLessons(prev => [...prev, { title: "", videoUrl: "", duration: "" }]);
  };

  // Supprimer une leçon
  const removeLesson = (index: number) => {
    setLessons(prev => prev.filter((_, i) => i !== index));
  };

  // Mettre à jour une leçon
  const updateLesson = (index: number, field: string, value: string) => {
    setLessons(prev => 
      prev.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  // Valider le formulaire du cours
  const validateCourseForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!courseData.title.trim()) {
      newErrors.title = "Le titre du cours est requis";
    }
    
    if (!courseData.description.trim()) {
      newErrors.description = "La description du cours est requise";
    }
    
    if (!courseData.price.trim()) {
      newErrors.price = "Le prix du cours est requis";
    } else if (isNaN(parseFloat(courseData.price)) || parseFloat(courseData.price) < 0) {
      newErrors.price = "Le prix doit être un nombre positif";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (validateCourseForm()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (lessons.length > 0) {
        setCurrentStep(3);
      } else {
        alert("Veuillez ajouter au moins une leçon avant de continuer.");
      }
    }
  };

  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Validation du formulaire
      if (!validateCourseForm()) {
        setIsLoading(false);
        return;
      }

      // Créer le cours avec les données du formulaire
      const courseForm = {
        title: courseData.title,
        description: courseData.description,
        thumbnailUrl: courseData.thumbnailUrl,
        price: parseFloat(courseData.price),
      };

      // Appeler l'API pour créer le cours
      const response = await CourseService.createCourse(courseForm);
      
      // Si le cours est créé avec succès, ajouter les leçons
      if (response.course && response.course.id) {
        const courseId = response.course.id;
        
        // Ajouter les leçons une par une
        for (const lesson of lessons) {
          await fetch(`/api/courses/${courseId}/lessons`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: lesson.title,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration,
            }),
          });
        }
        
        // Ajouter les quiz si nécessaire
        for (const quiz of quizzes) {
          // Trouver l'index de la leçon associée
          const lessonIndex = quiz.lessonIndex;
          
          // Récupérer toutes les leçons du cours
          const lessonsResponse = await fetch(`/api/courses/${courseId}/lessons`);
          const courseLessons = await lessonsResponse.json();
          
          // Si la leçon existe, ajouter le quiz
          if (courseLessons && courseLessons.length > lessonIndex) {
            const lessonId = courseLessons[lessonIndex].id;
            
            await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                question: quiz.question,
                options: quiz.options,
                correctAnswer: quiz.correctAnswer,
              }),
            });
          }
        }
        // Afficher le toast de succès et rediriger après fermeture
        showToastAndRedirect("Cours créé avec succès !", "success");
      }
    } catch (error) {
      console.error("Erreur lors de la création du cours:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue lors de la création du cours");
      setToast({ message: "Erreur lors de la création du cours", type: "error", visible: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
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
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
      <div className="flex items-center mb-8">
        <Link href="/teacher/courses" className="mr-4">
          <LucideArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold">Créer un nouveau cours</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="h-1 w-24 bg-gray-200 mr-2"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className="h-1 w-24 bg-gray-200 mr-2"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
          <div className="flex">
            <div className="w-8 mr-2"></div>
            <div className="flex text-sm">
              <div className="w-24 mr-2">Informations du cours</div>
              <div className="w-24 mr-2">Contenu du cours</div>
              <div>Quiz</div>
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations du cours</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre du cours *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={courseData.title}
                  onChange={handleCourseChange}
                  className={`block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Ex: Introduction au développement web"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description du cours *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={courseData.description}
                  onChange={handleCourseChange}
                  className={`block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Décrivez votre cours en détail..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix du cours (€) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="text"
                  value={courseData.price}
                  onChange={handleCourseChange}
                  className={`block w-full rounded-md border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Ex: 49.99"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Miniature du cours
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  {thumbnailPreview ? (
                    <div className="space-y-4 w-full">
                      <img 
                        src={thumbnailPreview} 
                        alt="Aperçu de la miniature" 
                        className="mx-auto h-40 object-cover rounded-md"
                      />
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setCourseData(prev => ({ ...prev, thumbnailUrl: "" }));
                          }}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <LucideUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="thumbnail"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="thumbnail"
                            name="thumbnail"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleThumbnailChange}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="isPublished"
                  name="isPublished"
                  type="checkbox"
                  checked={courseData.isPublished}
                  onChange={(e) => setCourseData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Publier ce cours immédiatement
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        ) : currentStep === 2 ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Contenu du cours</h2>
            
            {lessons.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Vous n'avez pas encore ajouté de leçons à ce cours.</p>
                <button
                  type="button"
                  onClick={addLesson}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <LucidePlus className="h-5 w-5 mr-2" />
                  Ajouter une leçon
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium">Leçon {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <LucideTrash className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`lesson-title-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Titre de la leçon *
                        </label>
                        <input
                          id={`lesson-title-${index}`}
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, "title", e.target.value)}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          placeholder="Ex: Introduction aux bases de HTML"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`lesson-video-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          URL de la vidéo *
                        </label>
                        <input
                          id={`lesson-video-${index}`}
                          type="text"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          placeholder="Ex: https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`lesson-duration-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Durée (minutes) *
                        </label>
                        <input
                          id={`lesson-duration-${index}`}
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(index, "duration", e.target.value)}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          placeholder="Ex: 15"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addLesson}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LucidePlus className="h-5 w-5 mr-2" />
                  Ajouter une autre leçon
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Précédent
              </button>
              
              <button
                type="button"
                onClick={goToNextStep}
                disabled={lessons.length === 0}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Quiz</h2>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Vous n'avez pas encore ajouté de quiz à ce cours.</p>
                <button
                  type="button"
                  onClick={() => setQuizzes(prev => [...prev, { lessonIndex: 0, question: "", options: ["", "", ""], correctAnswer: "" }])}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <LucidePlus className="h-5 w-5 mr-2" />
                  Ajouter un quiz
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quizzes.map((quiz, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium">Quiz {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => setQuizzes(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <LucideTrash className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`quiz-question-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Question *
                        </label>
                        <input
                          id={`quiz-question-${index}`}
                          type="text"
                          value={quiz.question}
                          onChange={(e) => setQuizzes(prev => 
                            prev.map((q, i) => 
                              i === index ? { ...q, question: e.target.value } : q
                            )
                          )}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          placeholder="Ex: Qu'est-ce que HTML ?"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`quiz-options-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Options *
                        </label>
                        <div className="space-y-2">
                          {quiz.options.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input
                                id={`quiz-option-${index}-${i}`}
                                type="text"
                                value={option}
                                onChange={(e) => setQuizzes(prev => 
                                  prev.map((q, j) => 
                                    j === index ? { ...q, options: q.options.map((o, k) => k === i ? e.target.value : o) } : q
                                  )
                                )}
                                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="Ex: HyperText Markup Language"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor={`quiz-correct-answer-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Réponse correcte *
                        </label>
                        <select
                          id={`quiz-correct-answer-${index}`}
                          value={quiz.correctAnswer}
                          onChange={(e) => setQuizzes(prev => 
                            prev.map((q, i) => 
                              i === index ? { ...q, correctAnswer: e.target.value } : q
                            )
                          )}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        >
                          {quiz.options.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setQuizzes(prev => [...prev, { lessonIndex: 0, question: "", options: ["", "", ""], correctAnswer: "" }])}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LucidePlus className="h-5 w-5 mr-2" />
                  Ajouter un autre quiz
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Précédent
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || quizzes.length === 0}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <LucideCheck className="h-5 w-5 mr-2" />
                    Créer le cours
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
