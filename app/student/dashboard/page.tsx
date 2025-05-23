// Ce composant est déjà un composant client, il sera donc inclus dans le layout avec la sidebar
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const CoursesWidget = dynamic(() => import("./CoursesWidget"), { ssr: false });

export default function StudentDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Apprenant</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenue !</h2>
        <p className="text-gray-600 mb-4">
          Vous êtes connecté en tant qu'apprenant. Vous pouvez accéder à vos cours, suivre votre progression et interagir avec la communauté.
        </p>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-1">
          <CoursesWidget />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Ma progression</h2>
          <p className="text-gray-600">Suivez votre progression et vos accomplissements.</p>
          <Link 
            href="/student/courses/my-courses" 
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
            Rejoindre la communauté →
          </Link>
        </div>
      </div>
    </div>
  );
}
