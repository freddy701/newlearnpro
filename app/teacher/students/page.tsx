"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideSearch, 
  LucidePlus, 
  LucideUsers, 
  LucideMessageSquare, 
  LucideChevronDown,
  LucideEdit,
  LucideTrash
} from "lucide-react";

// Types pour les groupes d'études
interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
}

interface StudyGroup {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  membersCount: number;
  createdAt: string;
  members: Student[];
}

export default function TeacherStudyGroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    courseId: ""
  });
  const [courses, setCourses] = useState<{id: string; title: string}[]>([]);

  // Simuler la récupération des groupes d'études
  useEffect(() => {
    // Dans un environnement de production, vous feriez un appel API pour récupérer les groupes
    const mockCourses = [
      { id: "1", title: "Introduction au développement web" },
      { id: "2", title: "JavaScript moderne" },
      { id: "3", title: "Python pour la data science" }
    ];

    const mockStudyGroups: StudyGroup[] = [
      {
        id: "1",
        name: "Groupe HTML/CSS",
        courseId: "1",
        courseName: "Introduction au développement web",
        membersCount: 8,
        createdAt: "2025-01-15",
        members: [
          { id: "1", name: "Jean Dupont", email: "jean.dupont@example.com", joinedAt: "2025-01-16" },
          { id: "2", name: "Marie Martin", email: "marie.martin@example.com", joinedAt: "2025-01-17" },
          { id: "3", name: "Lucas Bernard", email: "lucas.bernard@example.com", joinedAt: "2025-01-18" }
        ]
      },
      {
        id: "2",
        name: "Groupe React",
        courseId: "2",
        courseName: "JavaScript moderne",
        membersCount: 6,
        createdAt: "2025-02-10",
        members: [
          { id: "4", name: "Sophie Petit", email: "sophie.petit@example.com", joinedAt: "2025-02-11" },
          { id: "5", name: "Thomas Dubois", email: "thomas.dubois@example.com", joinedAt: "2025-02-12" }
        ]
      },
      {
        id: "3",
        name: "Groupe Data Analysis",
        courseId: "3",
        courseName: "Python pour la data science",
        membersCount: 5,
        createdAt: "2025-03-05",
        members: [
          { id: "6", name: "Emma Leroy", email: "emma.leroy@example.com", joinedAt: "2025-03-06" },
          { id: "7", name: "Hugo Moreau", email: "hugo.moreau@example.com", joinedAt: "2025-03-07" },
          { id: "8", name: "Léa Roux", email: "lea.roux@example.com", joinedAt: "2025-03-08" }
        ]
      }
    ];

    setCourses(mockCourses);
    setStudyGroups(mockStudyGroups);
    setIsLoading(false);
  }, []);

  // Filtrer les groupes d'études en fonction de la recherche
  const filteredGroups = studyGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Basculer l'expansion d'un groupe
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Supprimer un groupe d'études
  const deleteGroup = (groupId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce groupe d'études ?")) {
      setStudyGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  // Créer un nouveau groupe d'études
  const createStudyGroup = () => {
    if (!newGroupData.name || !newGroupData.courseId) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const selectedCourse = courses.find(course => course.id === newGroupData.courseId);
    if (!selectedCourse) return;

    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupData.name,
      courseId: newGroupData.courseId,
      courseName: selectedCourse.title,
      membersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      members: []
    };

    setStudyGroups(prev => [...prev, newGroup]);
    setNewGroupData({ name: "", courseId: "" });
    setIsCreateModalOpen(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "authenticated" && session?.user.role !== "TEACHER" && session?.user.role !== "ADMIN") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Groupes d'études</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              className="px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <LucideSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LucidePlus className="h-5 w-5 mr-2" />
            Créer un groupe
          </button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Vous n'avez pas encore créé de groupe d'études</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Les groupes d'études permettent à vos étudiants de collaborer et d'échanger sur vos cours.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LucidePlus className="h-5 w-5 mr-2" />
            Créer votre premier groupe
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Cours: {group.courseName}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center mr-4">
                        <LucideUsers className="h-4 w-4 mr-1" />
                        {group.membersCount} membres
                      </span>
                      <span>Créé le: {group.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/teacher/students/${group.id}/messages`}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Messages"
                    >
                      <LucideMessageSquare className="h-5 w-5" />
                    </Link>
                    <Link 
                      href={`/teacher/students/${group.id}/edit`}
                      className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                      title="Modifier"
                    >
                      <LucideEdit className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => deleteGroup(group.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Supprimer"
                    >
                      <LucideTrash className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Voir les membres"
                    >
                      <LucideChevronDown className={`h-5 w-5 transition-transform ${expandedGroups.has(group.id) ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {expandedGroups.has(group.id) && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-lg font-medium mb-3">Membres du groupe</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Étudiant
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              A rejoint le
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {group.members.map((member) => (
                            <tr key={member.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {member.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {member.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {member.joinedAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création de groupe */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Créer un nouveau groupe d'études</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du groupe *
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Ex: Groupe HTML/CSS"
                />
              </div>
              
              <div>
                <label htmlFor="course-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cours associé *
                </label>
                <select
                  id="course-id"
                  value={newGroupData.courseId}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, courseId: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un cours</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                onClick={createStudyGroup}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Créer le groupe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
