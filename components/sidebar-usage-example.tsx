"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  LucideLayoutDashboard, 
  LucideBookOpen, 
  LucideUsers, 
  LucideBarChart2, 
  LucidePlus,
  LucideLogOut
} from "lucide-react";
import { ResponsiveSidebar } from "./responsive-sidebar";

export default function TeacherLayoutExample({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
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

  if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Retourner au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  // Définition des liens de navigation
  const navLinks = [
    {
      href: "/teacher/dashboard",
      label: "Tableau de bord",
      icon: <LucideLayoutDashboard />
    },
    {
      href: "/teacher/courses",
      label: "Mes cours",
      icon: <LucideBookOpen />
    },
    {
      href: "/teacher/courses/create",
      label: "Créer un cours",
      icon: <LucidePlus />
    },
    {
      href: "/teacher/groups",
      label: "Groupes d'études",
      icon: <LucideUsers />
    },
    {
      href: "/teacher/analytics",
      label: "Analytiques",
      icon: <LucideBarChart2 />
    }
  ];

  // Bouton de déconnexion pour le footer
  const logoutButton = (
    <button
      onClick={handleSignOut}
      className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
    >
      <LucideLogOut className="w-5 h-5 mr-3" />
      <span>Déconnexion</span>
    </button>
  );

  return (
    <ResponsiveSidebar
      links={navLinks}
      logo={{
        text: "LearnPro",
        href: "/teacher/dashboard"
      }}
      footer={logoutButton}
    >
      {children}
    </ResponsiveSidebar>
  );
}
