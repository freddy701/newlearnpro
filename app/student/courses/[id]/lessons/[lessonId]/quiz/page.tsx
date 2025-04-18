"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer?: number; // caché côté étudiant
}

export default function StudentQuizPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params?.id || !params?.lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${params.id}/lessons/${params.lessonId}/quiz`);
        if (!res.ok) throw new Error("Erreur lors du chargement du quiz");
        const data = await res.json();
        setQuiz(data.questions || []);
      } catch (e) {
        setError("Impossible de charger le quiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [params?.id, params?.lessonId]);

  const handleChange = (questionId: number, optionIdx: number) => {
    setAnswers({ ...answers, [questionId]: optionIdx });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;
    // Préparer les réponses sous forme de tableau d'indices, dans l'ordre des questions
    const userAnswers = quiz.map(q => answers[q.id] ?? null);
    // Appel API backend pour correction
    const res = await fetch(`/api/courses/${params.id}/lessons/${params.lessonId}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: userAnswers }),
    });
    const result = await res.json();
    setScore(result.score);
    setSubmitted(true);
    // Optionnel : stocke aussi result.details si tu veux afficher le détail
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement du quiz...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!quiz || quiz.length === 0) return <div className="text-center py-12 text-gray-500">Aucun quiz disponible pour cette leçon.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold mb-6">Quiz de la leçon</h1>
      {submitted ? (
        <div className="mb-8">
          <div className="text-lg font-semibold text-green-700 mb-2">Votre score : {score} / {quiz.length}</div>
          <button className="text-blue-600 hover:underline" onClick={() => { setSubmitted(false); setScore(null); }}>Recommencer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <ul className="space-y-8">
            {quiz.map((q, idx) => (
              <li key={q.id}>
                <div className="mb-2 font-medium">{idx + 1}. {q.question}</div>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={optIdx}
                        checked={answers[q.id] === optIdx}
                        onChange={() => handleChange(q.id, optIdx)}
                        disabled={submitted}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={submitted}
          >
            Soumettre
          </button>
        </form>
      )}
      <div className="mt-8">
        <Link href={`/student/courses/${params.id}/lessons/${params.lessonId}`} className="text-blue-600 hover:underline">← Retour à la leçon</Link>
      </div>
    </div>
  );
}
