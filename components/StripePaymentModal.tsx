"use client";

import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentModalProps {
  courseId: number;
  amount: number;
  onSuccess?: () => void;
}

export default function StripePaymentModal({ courseId, amount, onSuccess }: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialiser la session de paiement Stripe
  const initializePayment = async () => {
    try {
      const response = await fetch("/api/payment/initialize", {
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
        throw new Error(errorData.message || "Erreur lors de l'initialisation du paiement");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'initialisation du paiement");
    }
  };

  // Initialiser le paiement au chargement du composant
  useEffect(() => {
    initializePayment();
  }, [courseId, amount]);

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center">Chargement du formulaire de paiement...</div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Payer le cours</h2>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm courseId={courseId} amount={amount} />
      </Elements>
    </div>
  );
}