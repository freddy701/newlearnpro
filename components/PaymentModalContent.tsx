import { useState } from "react";

interface PaymentModalContentProps {
  onSuccess?: () => void;
}

export default function PaymentModalContent({ onSuccess }: PaymentModalContentProps) {
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Simule la récupération du courseId depuis l'URL (adapter si besoin)
  const courseId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "";

  const handleEnroll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cardNumber,
          expiry,
          cvc,
          email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.message || "Impossible de finaliser l'inscription.");
      }
    } catch (e) {
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">S’inscrire et payer le cours</h2>
      {success ? (
        <div className="text-green-600 font-semibold">Inscription et paiement validés ! Redirection...</div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            handleEnroll();
          }}
        >
          <label className="block">
            <span className="text-gray-700">Nom du titulaire</span>
            <input
              type="text"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Jean Dupont"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Numéro de carte</span>
            <input
              type="text"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
              required
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              maxLength={16}
            />
          </label>
          <div className="flex space-x-4">
            <label className="block w-1/2">
              <span className="text-gray-700">Expiration</span>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2"
                value={expiry}
                onChange={e => setExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
                required
                placeholder="MM/AA"
                maxLength={5}
              />
            </label>
            <label className="block w-1/2">
              <span className="text-gray-700">CVC</span>
              <input
                type="text"
                className="mt-1 block w-full border rounded px-3 py-2"
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                placeholder="123"
                maxLength={4}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="email@exemple.com"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-4"
            disabled={loading}
          >
            {loading ? "Paiement en cours..." : "Payer et accéder au cours"}
          </button>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </form>
      )}
    </div>
  );
}
