import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les données du formulaire
    const body = await req.json();
    const { userId, name, email, message, qualifications, experience } = body;

    // Vérifier que l'utilisateur qui fait la demande est bien celui qui est connecté
    if (session.user.id !== userId) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà un enseignant
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (user.role.type === "TEACHER" || user.role.type === "ADMIN") {
      return NextResponse.json(
        { message: "Vous êtes déjà enseignant ou administrateur" },
        { status: 400 }
      );
    }

    // Envoyer un email à l'administrateur
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: process.env.EMAIL_SERVER_SECURE === "true",
    });

    // Construire le contenu de l'email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const emailSubject = "Nouvelle demande pour devenir enseignant";
    const emailContent = `
      <h1>Nouvelle demande pour devenir enseignant</h1>
      <p><strong>De:</strong> ${name} (${email})</p>
      <p><strong>ID utilisateur:</strong> ${userId}</p>
      <p><strong>Qualifications:</strong> ${qualifications}</p>
      <p><strong>Expérience:</strong> ${experience}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr />
      <p>Pour approuver cette demande, connectez-vous au panneau d'administration et modifiez le rôle de l'utilisateur.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/admin/users/${userId}">Gérer cet utilisateur</a></p>
    `;

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: adminEmail,
      subject: emailSubject,
      html: emailContent,
    });

    // Enregistrer la demande dans la base de données (optionnel)
    // Vous pourriez créer un modèle TeacherRequest dans votre schéma Prisma

    return NextResponse.json(
      { message: "Votre demande a été envoyée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'envoi de votre demande" },
      { status: 500 }
    );
  }
}
