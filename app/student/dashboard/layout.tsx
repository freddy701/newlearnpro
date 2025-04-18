"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LucideHome, LucideBook, LucideUsers, LucideBarChart2, LucideLogOut } from "lucide-react";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
    router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-950 text-white flex flex-col justify-between">
        <div>
          <div className="p-6">
            <Link href="/student/dashboard" className="text-xl font-bold">
              LearnPro
            </Link>
          </div>
          <nav className="mt-6">
            <ul>
              <li>
                <Link
                  href="/student/dashboard"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LucideHome className="w-5 h-5 mr-3" />
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/student/courses"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LucideBook className="w-5 h-5 mr-3" />
                  <span>Tous les cours</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/student/groups"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LucideUsers className="w-5 h-5 mr-3" />
                  <span>Mes groupes</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/student/analytiques"
                  className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LucideBarChart2 className="w-5 h-5 mr-3" />
                  <span>Analytiques</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mb-4">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white text-left"
          >
            <LucideLogOut className="w-5 h-5 mr-3" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
