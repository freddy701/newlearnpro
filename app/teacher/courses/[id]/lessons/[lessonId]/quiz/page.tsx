"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucidePlus, 
  LucideTrash, 
  LucideLoader2, 
  LucideCheck,
  LucideX
} from "lucide-react";
import { CourseService } from "@/services/courseService";
import { LessonService } from "@/services/lessonService";
import { QuizService } from "@/services/quizService";

export default function QuizPage({ 
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
  
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [quizForm, setQuizForm] = useState({
    question: "",
    options: ["", "", ""],
    correctAnswer: ""
  });

  // Charger les détails de la leçon et du quiz
  useEffect(() => {
    const loadData = async () => {
      if (isNaN(courseId) || isNaN(lessonId)) {
        setError("ID de cours ou de leçon invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Charger les détails de la leçon
        const lessonData = await LessonService.getLesson(courseId, lessonId);
        setLesson(lessonData);
        
        // Vérifier si un quiz existe déjà pour cette leçon
        const quizData = await QuizService.getQuiz(courseId, lessonId);
        
        if (quizData) {
          setQuiz(quizData);
          setQuizForm({
            question: quizData.question,
            options: Array.isArray(quizData.options) ? quizData.options : JSON.parse(quizData.options as unknown as string),
            correctAnswer: quizData.correctAnswer
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        if ((error as Error).message.includes('404')) {
          // C'est normal si le quiz n'existe pas encore
          setError("");
        } else {
          setError("Impossible de charger les détails. Veuillez réessayer plus tard.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadData();
    }
  }, [courseId, lessonId, status]);

  // Vérifier les autorisations
  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "authenticated" && session) {
        try {
          const course = await CourseService.getCourse(courseId);
          const isOwner = course.teacherId === parseInt(session.user.id);
          const isAdmin = session.user.role === "ADMIN";
          
          if (!isOwner && !isAdmin) {
            router.push("/teacher/courses");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification des autorisations:", error);
        }
      }
    };
    
    if (status === "authenticated") {
      checkPermissions();
    }
  }, [courseId, session, status, router]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({ ...prev, [name]: value }));
  };

  // Gérer les changements d'options
  const handleOptionChange = (index: number, value: string) => {
    setQuizForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  // Ajouter une option
  const addOption = () => {
    setQuizForm(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  // Supprimer une option
  const removeOption = (index: number) => {
    if (quizForm.options.length <= 2) {
      setError("Un quiz doit avoir au moins 2 options");
      return;
    }
    
    setQuizForm(prev => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      
      // Si l'option supprimée était la réponse correcte, réinitialiser la réponse correcte
      const newForm = { ...prev, options: newOptions };
      if (prev.correctAnswer === prev.options[index]) {
        newForm.correctAnswer = "";
      }
      
      return newForm;
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!quizForm.question.trim()) {
      setError("La question est obligatoire");
      return false;
    }
    
    if (quizForm.options.some(option => !option.trim())) {
      setError("Toutes les options doivent être remplies");
      return false;
    }
    
    if (!quizForm.correctAnswer) {
      setError("Vous devez sélectionner une réponse correcte");
      return false;
    }
    
    return true;
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
      
      const quizData = {
        question: quizForm.question,
        options: quizForm.options,
        correctAnswer: quizForm.correctAnswer
      };
      
      if (quiz) {
        // Mettre à jour le quiz existant
        await QuizService.updateQuiz(courseId, lessonId, quizData);
        setSuccess("Quiz mis à jour avec succès");
      } else {
        // Créer un nouveau quiz
        const response = await QuizService.createQuiz(courseId, lessonId, quizData);
        setQuiz(response.quiz);
        setSuccess("Quiz créé avec succès");
      }
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du quiz:", error);
      setError("Impossible d'enregistrer le quiz. Veuillez réessayer plus tard.");
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

  if (!lesson) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-300">{error || "Leçon non trouvée"}</p>
          <Link href={`/teacher/courses/${courseId}`} className="mt-4 inline-block text-blue-600 hover:underline">
            Retour au cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{quiz ? "Modifier le quiz" : "Créer un quiz"}</h1>
          <p className="text-gray-600 dark:text-gray-400">Leçon: {lesson.title}</p>
        </div>
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
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              id="question"
              name="question"
              rows={3}
              value={quizForm.question}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Ex: Quelle est la balise HTML pour créer un lien hypertexte ?"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Options <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <LucidePlus className="h-4 w-4 mr-1" />
                Ajouter une option
              </button>
            </div>
            
            <div className="space-y-3">
              {quizForm.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`correct-${index}`}
                    name="correctAnswer"
                    value={option}
                    checked={quizForm.correctAnswer === option}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                    title="Supprimer cette option"
                  >
                    <LucideTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sélectionnez la réponse correcte en cliquant sur le bouton radio à côté de l'option.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link
              href={`/teacher/courses/${courseId}`}
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
                quiz ? "Mettre à jour le quiz" : "Créer le quiz"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
