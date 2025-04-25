import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, paymentStatus: "paid" },
    include: { course: true }
  });
  // LOG DEBUG
  console.log("userId:", userId, "enrollments:", enrollments);
  const coursesWithProgress = await Promise.all(enrollments.map(async (e) => {
    const totalLessons = await prisma.lesson.count({ where: { courseId: e.courseId } });
    const completedLessons = await prisma.progress.count({
      where: { userId, lesson: { courseId: e.courseId }, isCompleted: true }
    });
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return {
      ...e.course,
      progress
    };
  }));
  return NextResponse.json(coursesWithProgress);
}
