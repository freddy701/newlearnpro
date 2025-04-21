"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function EnrollPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${params.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erreur lors de l'inscription ou du paiement.");
      setSuccess(true);
      setTimeout(() => {
        router.push(`/student/courses/${params.id}`);
      }, 1200);
    } catch (e) {
      setError("Impossible de finaliser l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">S’inscrire et payer le cours</h1>
      {success ? (
        <div className="text-green-600 font-semibold">Inscription et paiement validés ! Redirection...</div>
      ) : (
        <>
          <p className="mb-6">Ce cours nécessite une inscription payante pour accéder à son contenu.</p>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={handleEnroll}
          >
            {loading ? "Paiement en cours..." : "Payer et accéder au cours"}
          </button>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </>
      )}
    </div>
  );
}
