import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/courses/[id]/enroll - Inscrire un étudiant (mock paiement)
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Erreur getServerSession:", error);
    return NextResponse.json({ message: "Erreur d'authentification", details: String(error) }, { status: 500 });
  }
  if (!session || !session.user?.id) {
    console.warn("Tentative d'accès sans session valide", { session });
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);
  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId) || isNaN(userId)) {
    console.warn("ID de cours ou userId invalide:", params.id, session.user.id);
    return NextResponse.json({ message: "ID de cours ou userId invalide" }, { status: 400 });
  }
  try {
    // Récupère les infos de paiement du body
    const body = await req.json();
    // Extraction des infos de paiement (mock, seules les 4 derniers chiffres sont utilisés)
    const cardNumber = body.cardNumber || "";
    const cardLast4 = cardNumber.slice(-4);

    // Vérifie si déjà inscrit/payé
    const existing = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });
    if (existing && existing.paymentStatus === "paid") {
      console.info("Déjà inscrit et payé", { userId, courseId });
      // Ajout automatique dans le groupe d'étude si pas déjà membre
      const studyGroup = await prisma.studyGroup.findFirst({ where: { courseId } });
      if (studyGroup) {
        const alreadyMember = await prisma.groupMember.findFirst({ where: { groupId: studyGroup.id, userId } });
        if (!alreadyMember) {
          await prisma.groupMember.create({ data: { groupId: studyGroup.id, userId } });
        }
      }
      return NextResponse.json({ message: "Déjà inscrit et payé." }, { status: 200 });
    }
    if (existing) {
      // Simule le paiement
      await prisma.enrollment.update({
        where: { id: existing.id },
        data: { paymentStatus: "paid" },
      });
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      const amount = course?.price ?? 0;
      const transactionId = Math.random().toString(36).substring(2) + Date.now();
      const paymentResult1 = await prisma.payment.create({
        data: {
          userId,
          courseId,
          amount,
          transactionId,
          status: "completed",
          paymentMethod: `mock_card_${cardLast4}`,
        },
      });
      console.info("Paiement validé pour inscription existante", { enrollmentId: existing.id });
      return NextResponse.json({ message: "Paiement validé !" }, { status: 200 });
    }
    // Sinon, crée l'inscription et valide le paiement (mock)
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        paymentStatus: "paid",
      },
    });
    // Ajout automatique dans le groupe d'étude
    const studyGroup = await prisma.studyGroup.findFirst({ where: { courseId } });
    if (studyGroup) {
      const alreadyMember = await prisma.groupMember.findFirst({ where: { groupId: studyGroup.id, userId } });
      if (!alreadyMember) {
        await prisma.groupMember.create({ data: { groupId: studyGroup.id, userId } });
      }
    }
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const amount = course?.price ?? 0;
    const transactionId = Math.random().toString(36).substring(2) + Date.now();
    const paymentResult2 = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount,
        transactionId,
        status: "completed",
        paymentMethod: `mock_card_${cardLast4}`,
      },
    });
    console.info("Nouvelle inscription créée et paiement validé", { userId, courseId });
    return NextResponse.json({ message: "Inscription et paiement validés !" }, { status: 201 });
  } catch (error) {
    console.error("Erreur API /enroll:", error);
    return NextResponse.json({ message: "Erreur serveur", details: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    return NextResponse.json({ message: "Erreur d'authentification", details: String(error) }, { status: 500 });
  }
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);
  const courseId = parseInt(params.id, 10);
  if (isNaN(courseId) || isNaN(userId)) {
    return NextResponse.json({ message: "ID de cours ou userId invalide" }, { status: 400 });
  }
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId },
  });
  return NextResponse.json({ paid: !!(enrollment && enrollment.paymentStatus === "paid") });
}
