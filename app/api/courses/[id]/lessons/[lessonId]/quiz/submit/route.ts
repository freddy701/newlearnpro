import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/courses/[id]/lessons/[lessonId]/quiz/submit
export async function POST(
  req: NextRequest,
  context: { params: { id: string; lessonId: string } }
) {
  const params = await context.params;
  try {
    const courseId = params.id ? parseInt(params.id as string, 10) : NaN;
    const lessonId = params.lessonId ? parseInt(params.lessonId as string, 10) : NaN;

    if (isNaN(courseId) || isNaN(lessonId)) {
      return NextResponse.json(
        { message: "ID de cours ou de leçon invalide" },
        { status: 400 }
      );
    }

    // Récupérer le quiz
    const quiz = await prisma.quiz.findUnique({
      where: { lessonId },
    });

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz non trouvé pour cette leçon" },
        { status: 404 }
      );
    }

    // Correction robuste pour quiz à choix unique ou multiples
    let correctAnswers: number[] = [];
    // Si c'est un nombre pur (cas rare mais possible)
    if (typeof quiz.correctAnswer === "number") {
      correctAnswers = [quiz.correctAnswer];
    } else if (typeof quiz.correctAnswer === "string") {
      try {
        const parsed = JSON.parse(quiz.correctAnswer);
        if (Array.isArray(parsed)) {
          correctAnswers = parsed.map(Number);
        } else {
          correctAnswers = [Number(parsed)];
        }
      } catch {
        // Si c'est juste une string numérique ou un nombre brut
        correctAnswers = [Number(quiz.correctAnswer)];
      }
    } else if (Array.isArray(quiz.correctAnswer)) {
      correctAnswers = quiz.correctAnswer.map(Number);
    } else {
      // Cas inattendu : force la conversion
      correctAnswers = [Number(quiz.correctAnswer)];
    }
    // Sécurité : si le résultat n'est pas exploitable, retourne une erreur explicite
    if (correctAnswers.some(x => Number.isNaN(x))) {
      return NextResponse.json(
        { message: `Erreur de format de la réponse correcte en base (${quiz.correctAnswer})` },
        { status: 500 }
      );
    }

    const { answers } = await req.json();
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { message: "Format des réponses invalide" },
        { status: 400 }
      );
    }

    // Correction : l'apprenant choisit l'index de la bonne option (pas de texte libre)
    let score = 0;
    const details: { question: number; correct: boolean; correctAnswer: number; userAnswer: number }[] = [];
    for (let i = 0; i < correctAnswers.length; i++) {
      const userAnswerNum = Number(answers[i]);
      const correctNum = Number(correctAnswers[i]);
      const correct = userAnswerNum === correctNum;
      if (correct) score++;
      details.push({
        question: i + 1,
        correct,
        correctAnswer: correctNum,
        userAnswer: userAnswerNum,
      });
    }

    return NextResponse.json({
      score,
      total: correctAnswers.length,
      details,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission du quiz:", error);
    return NextResponse.json(
      { message: "Erreur lors de la correction du quiz" },
      { status: 500 }
    );
  }
}
