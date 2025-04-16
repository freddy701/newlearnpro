"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LucideSearch, LucideUserPlus, LucideChevronDown, LucideEdit, LucideTrash2, LucideUserCheck, LucideUserX } from "lucide-react";

// Types pour les utilisateurs
type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: "active" | "inactive" | "pending";
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le rôle depuis les paramètres d'URL
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "STUDENT" || roleParam === "TEACHER" || roleParam === "ADMIN") {
      setSelectedRole(roleParam);
    } else {
      setSelectedRole("ALL");
    }
  }, [searchParams]);

  // Simuler la récupération des données utilisateurs
  useEffect(() => {
    // Dans un environnement de production, vous feriez un appel API pour récupérer les utilisateurs
    const mockUsers: User[] = [
      {
        id: "1",
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        role: "STUDENT",
        createdAt: "2025-01-15",
        status: "active"
      },
      {
        id: "2",
        name: "Marie Leroy",
        email: "marie.leroy@example.com",
        role: "TEACHER",
        createdAt: "2025-02-20",
        status: "active"
      },
      {
        id: "3",
        name: "Pierre Martin",
        email: "pierre.martin@example.com",
        role: "STUDENT",
        createdAt: "2025-03-10",
        status: "inactive"
      },
      {
        id: "4",
        name: "Sophie Bernard",
        email: "sophie.bernard@example.com",
        role: "TEACHER",
        createdAt: "2025-01-05",
        status: "active"
      },
      {
        id: "5",
        name: "Lucas Petit",
        email: "lucas.petit@example.com",
        role: "STUDENT",
        createdAt: "2025-02-28",
        status: "active"
      },
      {
        id: "6",
        name: "Emma Dubois",
        email: "emma.dubois@example.com",
        role: "STUDENT",
        createdAt: "2025-03-15",
        status: "pending"
      },
      {
        id: "7",
        name: "Thomas Moreau",
        email: "thomas.moreau@example.com",
        role: "TEACHER",
        createdAt: "2025-01-20",
        status: "pending"
      },
      {
        id: "8",
        name: "Camille Roux",
        email: "camille.roux@example.com",
        role: "ADMIN",
        createdAt: "2024-12-01",
        status: "active"
      }
    ];

    setUsers(mockUsers);
    setIsLoading(false);
  }, []);

  // Filtrer les utilisateurs en fonction de la recherche et du rôle sélectionné
  useEffect(() => {
    let result = users;
    
    // Filtrer par rôle si un rôle spécifique est sélectionné
    if (selectedRole !== "ALL") {
      result = result.filter(user => user.role === selectedRole);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole]);

  // Fonction pour changer le rôle d'un utilisateur
  const changeUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Fonction pour changer le statut d'un utilisateur
  const changeUserStatus = (userId: string, newStatus: "active" | "inactive" | "pending") => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Barre de recherche */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <LucideSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Filtre par rôle */}
          <div className="relative w-full md:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | "ALL")}
              className="w-full px-4 py-2 appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="STUDENT">Apprenants</option>
              <option value="TEACHER">Formateurs</option>
              <option value="ADMIN">Administrateurs</option>
            </select>
            <LucideChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Bouton d'ajout */}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <LucideUserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.role === "STUDENT" && "Apprenant"}
                        {user.role === "TEACHER" && "Formateur"}
                        {user.role === "ADMIN" && "Administrateur"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === "active" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Actif
                        </span>
                      )}
                      {user.status === "inactive" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Inactif
                        </span>
                      )}
                      {user.status === "pending" && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <LucideEdit className="h-4 w-4" />
                        </button>
                        
                        {user.status === "active" ? (
                          <button 
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            title="Désactiver"
                            onClick={() => changeUserStatus(user.id, "inactive")}
                          >
                            <LucideUserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Activer"
                            onClick={() => changeUserStatus(user.id, "active")}
                          >
                            <LucideUserCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                          onClick={() => deleteUser(user.id)}
                        >
                          <LucideTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Précédent
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">{filteredUsers.length}</span> utilisateurs
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Précédent</span>
                  &laquo;
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900 text-sm font-medium text-blue-600 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span className="sr-only">Suivant</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
