"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucideUpload, 
  LucideLoader2, 
  LucideCheck
} from "lucide-react";
import { CourseService } from "@/services/courseService";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  // Utiliser React.use pour accéder aux paramètres comme recommandé par Next.js
  const resolvedParams = use(params);
  const courseId = parseInt(resolvedParams.id);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les détails du cours
  useEffect(() => {
    const loadCourse = async () => {
      if (isNaN(courseId)) {
        setError("ID de cours invalide");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const courseData = await CourseService.getCourse(courseId);
        
        // Vérifier que l'utilisateur est le propriétaire du cours ou un administrateur
        console.log("Vérification des autorisations (page d'édition):");
        console.log("ID enseignant du cours:", courseData.teacherId);
        console.log("ID utilisateur:", session?.user.id);
        console.log("Rôle utilisateur:", session?.user.role);
        console.log("Comparaison:", courseData.teacherId, "===", parseInt(session?.user.id || "0"));
        
        if (
          session?.user.id && 
          courseData.teacherId !== parseInt(session.user.id) && 
          session.user.role !== "ADMIN"
        ) {
          router.push("/teacher/courses");
          return;
        }
        
        setCourseForm({
          title: courseData.title,
          description: courseData.description || "",
          thumbnailUrl: courseData.thumbnailUrl || "",
          price: courseData.price.toString()
        });
        
        if (courseData.thumbnailUrl) {
          setThumbnailPreview(`/images/${courseData.thumbnailUrl}`);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
        setError("Impossible de charger les détails du cours. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      loadCourse();
    }
  }, [courseId, session, status, router]);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gérer le changement d'image
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnailUrl: "Le fichier doit être une image" }));
      return;
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, thumbnailUrl: "L'image ne doit pas dépasser 2MB" }));
      return;
    }

    // Créer une URL pour la prévisualisation
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setThumbnailPreview(event.target.result as string);
        setCourseForm(prev => ({ ...prev, thumbnailUrl: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!courseForm.title.trim()) {
      newErrors.title = "Le titre est obligatoire";
    }
    
    if (!courseForm.price.trim()) {
      newErrors.price = "Le prix est obligatoire";
    } else if (isNaN(parseFloat(courseForm.price)) || parseFloat(courseForm.price) <= 0) {
      newErrors.price = "Le prix doit être un nombre positif";
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
      
      const response = await CourseService.updateCourse(courseId, {
        title: courseForm.title,
        description: courseForm.description,
        thumbnailUrl: courseForm.thumbnailUrl,
        price: parseFloat(courseForm.price)
      });
      
      setSuccess("Cours mis à jour avec succès");
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}`);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours:", error);
      setError("Impossible de mettre à jour le cours. Veuillez réessayer plus tard.");
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
          href={`/teacher/courses/${courseId}`}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Modifier le cours</h1>
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
              Titre du cours <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={courseForm.title}
              onChange={handleChange}
              className={`block w-full rounded-md border ${
                errors.title ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Ex: Introduction au développement web"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={courseForm.description}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Décrivez votre cours en quelques phrases..."
            />
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image du cours
            </label>
            <div className="mt-1 flex items-center">
              <div className="relative">
                <input
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  type="text"
                  value={courseForm.thumbnailUrl}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="URL de l'image (ou utilisez le bouton pour télécharger)"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="absolute right-2 top-2 p-1 bg-gray-100 dark:bg-gray-600 rounded-md cursor-pointer"
                >
                  <LucideUpload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </label>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </div>
            {/* Aperçu de l'image : nouvelle sélection OU image existante */}
            {thumbnailPreview ? (
              <div className="mt-2">
                <img
                  src={thumbnailPreview}
                  alt="Aperçu de l'image"
                  className="h-40 object-cover rounded-md"
                />
              </div>
            ) : courseForm.thumbnailUrl ? (
              <div className="mt-2">
                <img
                  src={`/images/${courseForm.thumbnailUrl}`}
                  alt="Miniature existante"
                  className="h-40 object-cover rounded-md"
                />
              </div>
            ) : null}
            {errors.thumbnailUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.thumbnailUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="text"
              value={courseForm.price}
              onChange={handleChange}
              className={`block w-full rounded-md border ${
                errors.price ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              } px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Ex: 49.99"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
            )}
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
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
