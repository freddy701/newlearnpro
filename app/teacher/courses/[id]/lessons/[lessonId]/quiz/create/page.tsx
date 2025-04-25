"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function QuizCreatePage({ params }: { params: { id: string; lessonId: string } }) {
  const resolvedParams = React.use(params);
  const courseId = parseInt(resolvedParams.id);
  const lessonId = parseInt(resolvedParams.lessonId);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [quizForm, setQuizForm] = useState({
    question: "",
    options: ["", ""],
    correctAnswer: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizExists, setQuizExists] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setQuizForm(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setQuizForm(prev => ({ ...prev, options: [...prev.options, ""] }));
  };

  const removeOption = (index: number) => {
    if (quizForm.options.length <= 2) {
      setError("Un quiz doit avoir au moins 2 options");
      return;
    }
    setQuizForm(prev => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: newOptions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!quizForm.question || quizForm.options.some(opt => !opt) || quizForm.options.length < 2 || quizForm.correctAnswer === "") {
      setError("Veuillez remplir tous les champs et avoir au moins 2 options.");
      return;
    }
    if (Number(quizForm.correctAnswer) < 0 || Number(quizForm.correctAnswer) >= quizForm.options.length) {
      setError("L'indice de la bonne réponse est invalide.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: quizForm.question,
          options: quizForm.options,
          correctAnswer: quizForm.correctAnswer
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création du quiz");
      setSuccess("Quiz créé avec succès !");
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}/lessons/${lessonId}/quiz`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  };

  // Vérifier à l'arrivée si un quiz existe déjà
  useEffect(() => {
    const checkQuiz = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/quiz`);
        const data = await res.json();
        if (data.quiz) setQuizExists(true);
      } catch (e) {
        // ignore
      }
    };
    checkQuiz();
  }, [courseId, lessonId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Créer un quiz pour la leçon</h1>
      {quizExists && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          ⚠️ Un quiz existe déjà pour cette leçon. La création d'un nouveau quiz écrasera l'ancien.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Question</label>
          <textarea
            name="question"
            value={quizForm.question}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={2}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Options</label>
          {quizForm.options.map((opt, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                className="border rounded p-2 flex-1"
                required
              />
              {quizForm.options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="ml-2 text-red-500">Supprimer</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} className="text-blue-600 mt-2">+ Ajouter une option</button>
        </div>
        <div>
          <label className="block font-medium mb-1">Indice de la bonne réponse</label>
          <input
            type="number"
            name="correctAnswer"
            min={0}
            max={quizForm.options.length - 1}
            value={quizForm.correctAnswer}
            onChange={handleChange}
            className="border rounded p-2 w-32"
            required
          />
          <span className="ml-2 text-gray-500">(0 = première option, etc.)</span>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? "Enregistrement..." : "Créer le quiz"}
          </button>
          <Link href={`/teacher/courses/${courseId}/lessons/${lessonId}`} className="px-4 py-2 border rounded">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
