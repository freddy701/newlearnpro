"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";

interface PaymentFormProps {
  courseId: number;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentForm({ courseId, amount, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Le système de paiement n'est pas initialisé");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Validation du formulaire de paiement
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Erreur de validation du paiement");
      }

      // Création de l'intention de paiement côté serveur
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création du paiement");
      }

      const { clientSecret } = await response.json();

      // Confirmation du paiement avec Stripe
      // Ajoute redirect: 'if_required' pour éviter l'obligation d'un return_url
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message || "Erreur lors de la confirmation du paiement");
      }
      // Si paiement réussi, on déclenche le callback (toast + refetch côté parent)
      if (onSuccess && paymentIntent?.status === "succeeded") {
        onSuccess();
      }

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors du paiement");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? "Traitement en cours..." : `Payer ${amount}€`}
      </Button>
    </form>
  );
}