import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Get the STUDENT role ID
    const studentRole = await prisma.role.findFirst({
      where: { type: "STUDENT" }
    });

    if (!studentRole) {
      // Create the STUDENT role if it doesn't exist
      const newRole = await prisma.role.create({
        data: {
          name: "Apprenant",
          type: "STUDENT",
          description: "Rôle par défaut pour tous les nouveaux utilisateurs"
        }
      });
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user with the new role
      await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName,
          roleId: newRole.id
        }
      });
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user with the existing role
      await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName,
          roleId: studentRole.id
        }
      });
    }

    return NextResponse.json(
      { message: "Inscription réussie" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
