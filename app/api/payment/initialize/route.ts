import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { courseId } = await req.json();
    const userId = parseInt(session.user.id);

    // Vérifier si l'utilisateur est déjà inscrit et a payé
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: parseInt(courseId),
        paymentStatus: "paid",
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit à ce cours" },
        { status: 400 }
      );
    }

    // Récupérer les détails du cours
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Stripe utilise les centimes
      currency: "eur",
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Erreur d'initialisation du paiement:", error);
    return NextResponse.json({
      error: "Une erreur est survenue lors de l'initialisation du paiement",
    }, { status: 500 });
  }
}