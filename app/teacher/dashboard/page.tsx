import { requireRole } from "@/lib/auth/session";
import { RoleType } from "@prisma/client";
import Link from "next/link";

export default async function TeacherDashboard() {
  const user = await requireRole(["TEACHER", "ADMIN"]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Enseignant</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue, {user.name}!</h2>
        <p className="text-gray-600 mb-4">
          Vous êtes connecté en tant qu&apos;enseignant. Vous pouvez créer et gérer vos cours, suivre les progrès de vos élèves et interagir avec la communauté.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mes cours</h2>
          <p className="text-gray-600">Gérez vos cours existants ou créez-en de nouveaux.</p>
          <div className="mt-4 space-y-2">
            <Link 
              href="/teacher/courses" 
              className="block text-blue-600 hover:underline"
            >
              Voir mes cours →
            </Link>
            <Link 
              href="/teacher/courses/create" 
              className="block text-blue-600 hover:underline"
            >
              Créer un nouveau cours →
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mes étudiants</h2>
          <p className="text-gray-600">Suivez la progression de vos étudiants et interagissez avec eux.</p>
          <Link 
            href="/teacher/students" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Voir mes étudiants →
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <p className="text-gray-600">Consultez les statistiques de vos cours et de vos étudiants.</p>
          <Link 
            href="/teacher/stats" 
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Voir les statistiques →
          </Link>
        </div>
      </div>
    </div>
  );
}
