import { requireRole } from "@/lib/auth/session";
import { RoleType } from "@prisma/client";
import Link from "next/link";

export default async function StudentDashboard() {
  const user = await requireRole(["STUDENT", "ADMIN"]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Apprenant</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue, {user.name}!</h2>
        <p className="text-gray-600 mb-4">
          Vous êtes connecté en tant qu&apos;apprenant. Vous pouvez accéder à vos cours, suivre votre progression et interagir avec la communauté.
        </p>
        
        {user.role === "STUDENT" && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Vous souhaitez devenir enseignant?</h3>
            <p className="text-blue-600 mb-3">
              Partagez vos connaissances et créez vos propres cours sur notre plateforme.
            </p>
            <Link 
              href="/contact/become-teacher" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Faire une demande
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mes cours</h2>
          <p className="text-gray-600">Accédez à vos cours inscrits et continuez votre apprentissage.</p>
          <Link 
            href="/student/courses" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Voir mes cours →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ma progression</h2>
          <p className="text-gray-600">Suivez votre progression et vos accomplissements.</p>
          <Link 
            href="/student/progress" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Voir ma progression →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Communauté</h2>
          <p className="text-gray-600">Rejoignez des groupes d'étude et interagissez avec d'autres apprenants.</p>
          <Link 
            href="/student/community" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Explorer la communauté →
          </Link>
        </div>
      </div>
    </div>
  );
}
