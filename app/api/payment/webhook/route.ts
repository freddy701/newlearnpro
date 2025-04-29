import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

// Désactive le bodyParser de Next.js pour permettre la vérification de la signature Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Stripe envoie la signature dans l'en-tête
  const sig = req.headers.get("stripe-signature");
  let rawBody: string;

  try {
    // Stripe attend le body brut (pas JSON parsé)
    rawBody = await req.text();
  } catch (err) {
    return NextResponse.json({ error: "Impossible de lire le body brut" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const userId = parseInt(paymentIntent.metadata.userId);
    const courseId = parseInt(paymentIntent.metadata.courseId);
    const amount = paymentIntent.amount / 100;
    const transactionId = paymentIntent.id;

    // Sécurise : on vérifie qu'on a bien les infos nécessaires
    if (!userId || !courseId || !transactionId) {
      return NextResponse.json({ error: "Informations de paiement incomplètes" }, { status: 400 });
    }

    // 1. Créer ou mettre à jour l'enrollment (débloque le cours)
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { paymentStatus: "paid" },
      create: { userId, courseId, paymentStatus: "paid" },
    });

    // 2. Enregistrer le paiement
    await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount,
        transactionId,
        status: "completed",
        paymentMethod: paymentIntent.payment_method_types[0],
      },
    });

    // 3. Ajouter l'étudiant dans le groupe d'étude du cours
    const studyGroup = await prisma.studyGroup.findFirst({ where: { courseId } });
    if (studyGroup) {
      const alreadyMember = await prisma.groupMember.findFirst({ where: { groupId: studyGroup.id, userId } });
      if (!alreadyMember) {
        await prisma.groupMember.create({ data: { groupId: studyGroup.id, userId } });
      }
    }
  }

  // Stripe attend une réponse 200 pour considérer l'événement traité
  return NextResponse.json({ received: true });
}
