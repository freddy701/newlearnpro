"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BecomeTeacherPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    message: "",
    qualifications: "",
    experience: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  // Redirect if already a teacher
  if (session.user.role === "TEACHER" || session.user.role === "ADMIN") {
    router.push("/teacher/dashboard");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact/become-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          message: formData.message,
          qualifications: formData.qualifications,
          experience: formData.experience,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'envoi de votre demande");
      }

      setSuccess(true);
      setFormData({
        message: "",
        qualifications: "",
        experience: "",
      });
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Devenir enseignant</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-gray-600 mb-6">
          Vous souhaitez partager vos connaissances et créer des cours sur notre plateforme ? 
          Remplissez ce formulaire pour soumettre votre demande. Notre équipe l&apos;examinera 
          et vous contactera dans les plus brefs délais.
        </p>

        {success ? (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="text-sm text-green-700">
                Votre demande a été envoyée avec succès ! Nous l&apos;examinerons dans les plus brefs délais 
                et vous contacterons à l&apos;adresse email associée à votre compte.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
                Qualifications
              </label>
              <input
                id="qualifications"
                name="qualifications"
                type="text"
                required
                value={formData.qualifications}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Diplômes, certifications, etc."
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Expérience
              </label>
              <input
                id="experience"
                name="experience"
                type="text"
                required
                value={formData.experience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Années d'expérience, domaines d'expertise, etc."
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Pourquoi souhaitez-vous devenir enseignant ?
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Décrivez vos motivations et ce que vous souhaitez enseigner..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
