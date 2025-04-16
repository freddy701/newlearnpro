"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  LucideHome, 
  LucideUsers, 
  LucideBookOpen, 
  LucideSettings, 
  LucideBarChart2, 
  LucideLogOut 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, router, session]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Retourner au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-950 text-white">
        <div className="p-6">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            LearnPro Admin
          </Link>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                href="/admin/dashboard"
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LucideHome className="w-5 h-5 mr-3" />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard/users"
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LucideUsers className="w-5 h-5 mr-3" />
                <span>Utilisateurs</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard/courses"
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LucideBookOpen className="w-5 h-5 mr-3" />
                <span>Cours</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard/analytics"
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LucideBarChart2 className="w-5 h-5 mr-3" />
                <span>Analytiques</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/dashboard/settings"
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LucideSettings className="w-5 h-5 mr-3" />
                <span>Paramètres</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LucideLogOut className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
