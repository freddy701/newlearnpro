"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LucideLayoutDashboard, 
  LucideBookOpen, 
  LucideUsers, 
  LucideBarChart2, 
  LucideLogOut,
  LucidePlus,
  LucideMenu,
  LucideX
} from "lucide-react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, router, session]);
  
  // Fermer la sidebar quand on clique sur un lien (sur mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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

  if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="mb-4">Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Retourner au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header with Menu Toggle */}
      <div className="md:hidden bg-gray-800 dark:bg-gray-950 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/teacher/dashboard" className="text-xl font-bold">
          LearnPro
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <LucideX className="w-6 h-6" />
          ) : (
            <LucideMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar - Mobile: fixed overlay, Desktop: static sidebar */}
      <aside 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          transition-transform duration-300 ease-in-out 
          w-full md:w-[200px] bg-[#1e293b] text-white 
          fixed md:sticky top-0 left-0 h-screen z-40 
          flex flex-col 
          md:pt-0 pt-16
        `}
      >
        {/* Logo - Hidden on mobile as it's in the header */}
        <div className="hidden md:block px-4 py-6">
          <Link href="/teacher/dashboard" className="text-base font-semibold">
            LearnPro
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-3">
          <Link
            href="/teacher/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            onClick={handleNavClick}
          >
            <LucideLayoutDashboard className="w-4 h-4 mr-3" />
            <span>Tableau de bord</span>
          </Link>
          <Link
            href="/teacher/courses"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            onClick={handleNavClick}
          >
            <LucideBookOpen className="w-4 h-4 mr-3" />
            <span>Mes cours</span>
          </Link>
          <Link
            href="/teacher/courses/create"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            onClick={handleNavClick}
          >
            <LucidePlus className="w-4 h-4 mr-3" />
            <span>Créer un cours</span>
          </Link>
          <Link
            href="/teacher/groups"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            onClick={handleNavClick}
          >
            <LucideUsers className="w-4 h-4 mr-3" />
            <span>Groupes d&apos;études</span>
          </Link>
          <Link
            href="/teacher/analytics"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            onClick={handleNavClick}
          >
            <LucideBarChart2 className="w-4 h-4 mr-3" />
            <span>Analytiques</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-700 w-full mt-auto">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LucideLogOut className="w-4 h-4 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
