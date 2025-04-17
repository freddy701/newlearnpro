"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  LucideBarChart2, 
  LucideUsers, 
  LucideBookOpen, 
  LucideEye,
  LucideCheckSquare,
  LucideClock,
  LucideDollarSign,
  LucideArrowUp,
  LucideArrowDown
} from "lucide-react";

// Types pour les analytiques
interface CourseAnalytics {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  viewsLastMonth: number;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

interface StudentActivity {
  date: string;
  activeStudents: number;
  newEnrollments: number;
  completions: number;
}

interface TopPerformer {
  id: string;
  name: string;
  email: string;
  coursesCompleted: number;
  averageScore: number;
  lastActive: string;
}

export default function TeacherAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [coursesAnalytics, setCoursesAnalytics] = useState<CourseAnalytics[]>([]);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    averageCompletionRate: 0,
    totalViewsLastMonth: 0
  });

  // Simuler la récupération des données analytiques
  useEffect(() => {
    // Dans un environnement de production, vous feriez un appel API pour récupérer les données analytiques
    const mockCoursesAnalytics: CourseAnalytics[] = [
      {
        id: "1",
        title: "Introduction au développement web",
        enrollments: 124,
        completionRate: 68,
        averageRating: 4.7,
        revenue: 6175.76,
        viewsLastMonth: 1450,
        trend: 'up',
        percentChange: 12
      },
      {
        id: "2",
        title: "JavaScript moderne",
        enrollments: 98,
        completionRate: 52,
        averageRating: 4.5,
        revenue: 5878.02,
        viewsLastMonth: 980,
        trend: 'up',
        percentChange: 8
      },
      {
        id: "3",
        title: "Python pour la data science",
        enrollments: 76,
        completionRate: 45,
        averageRating: 4.8,
        revenue: 5311.24,
        viewsLastMonth: 820,
        trend: 'down',
        percentChange: 3
      }
    ];

    // Générer des données d'activité des étudiants pour le mois en cours
    const currentDate = new Date();
    const mockStudentActivity: StudentActivity[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      
      mockStudentActivity.push({
        date: date.toISOString().split('T')[0],
        activeStudents: Math.floor(Math.random() * 50) + 20,
        newEnrollments: Math.floor(Math.random() * 10),
        completions: Math.floor(Math.random() * 5)
      });
    }

    const mockTopPerformers: TopPerformer[] = [
      {
        id: "1",
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        coursesCompleted: 3,
        averageScore: 92,
        lastActive: "2025-04-15"
      },
      {
        id: "2",
        name: "Marie Martin",
        email: "marie.martin@example.com",
        coursesCompleted: 2,
        averageScore: 88,
        lastActive: "2025-04-16"
      },
      {
        id: "3",
        name: "Lucas Bernard",
        email: "lucas.bernard@example.com",
        coursesCompleted: 2,
        averageScore: 85,
        lastActive: "2025-04-14"
      },
      {
        id: "4",
        name: "Sophie Petit",
        email: "sophie.petit@example.com",
        coursesCompleted: 1,
        averageScore: 90,
        lastActive: "2025-04-13"
      },
      {
        id: "5",
        name: "Thomas Dubois",
        email: "thomas.dubois@example.com",
        coursesCompleted: 1,
        averageScore: 82,
        lastActive: "2025-04-12"
      }
    ];

    // Calculer les statistiques globales
    const totalStudents = mockCoursesAnalytics.reduce((sum, course) => sum + course.enrollments, 0);
    const totalCourses = mockCoursesAnalytics.length;
    const totalRevenue = mockCoursesAnalytics.reduce((sum, course) => sum + course.revenue, 0);
    const averageCompletionRate = mockCoursesAnalytics.reduce((sum, course) => sum + course.completionRate, 0) / totalCourses;
    const totalViewsLastMonth = mockCoursesAnalytics.reduce((sum, course) => sum + course.viewsLastMonth, 0);

    setCoursesAnalytics(mockCoursesAnalytics);
    setStudentActivity(mockStudentActivity);
    setTopPerformers(mockTopPerformers);
    setOverallStats({
      totalStudents,
      totalCourses,
      totalRevenue,
      averageCompletionRate,
      totalViewsLastMonth
    });
    setIsLoading(false);
  }, []);

  // Filtrer les données d'activité des étudiants en fonction du timeframe sélectionné
  const getFilteredStudentActivity = () => {
    const currentDate = new Date();
    let daysToSubtract = 30; // Par défaut, un mois
    
    if (selectedTimeframe === 'week') {
      daysToSubtract = 7;
    } else if (selectedTimeframe === 'year') {
      daysToSubtract = 365;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(currentDate.getDate() - daysToSubtract);
    
    return studentActivity.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= cutoffDate;
    });
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

  const filteredActivity = getFilteredStudentActivity();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Analytiques</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <LucideUsers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Étudiants</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallStats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <LucideBookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cours</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallStats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <LucideDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallStats.totalRevenue.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
              <LucideCheckSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de complétion</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallStats.averageCompletionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <LucideEye className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vues (mois dernier)</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{overallStats.totalViewsLastMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performances des cours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Performance des cours</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Inscriptions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Taux de complétion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Note moyenne
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {coursesAnalytics.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{course.enrollments}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${course.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.completionRate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 dark:text-white">{course.averageRating.toFixed(1)}</div>
                      <div className="ml-1 text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{course.revenue.toFixed(2)}€</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {course.trend === 'up' ? (
                        <LucideArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : course.trend === 'down' ? (
                        <LucideArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full mr-1"></div>
                      )}
                      <span className={`text-sm ${
                        course.trend === 'up' 
                          ? 'text-green-500' 
                          : course.trend === 'down' 
                            ? 'text-red-500' 
                            : 'text-gray-500'
                      }`}>
                        {course.percentChange}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activité des étudiants */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Activité des étudiants</h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md">
            <button
              onClick={() => setSelectedTimeframe('week')}
              className={`px-4 py-2 text-sm ${
                selectedTimeframe === 'week'
                  ? 'bg-blue-600 text-white rounded-md'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setSelectedTimeframe('month')}
              className={`px-4 py-2 text-sm ${
                selectedTimeframe === 'month'
                  ? 'bg-blue-600 text-white rounded-md'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setSelectedTimeframe('year')}
              className={`px-4 py-2 text-sm ${
                selectedTimeframe === 'year'
                  ? 'bg-blue-600 text-white rounded-md'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Année
            </button>
          </div>
        </div>
        
        <div className="h-80 relative">
          {/* Ici, vous intégreriez une bibliothèque de graphiques comme Chart.js ou Recharts */}
          {/* Pour cet exemple, nous allons simuler un graphique avec des barres */}
          <div className="absolute inset-0 flex items-end">
            {filteredActivity.slice(-14).map((activity, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full max-w-[20px] bg-blue-500 rounded-t-sm mx-auto"
                  style={{ height: `${activity.activeStudents * 100 / 70}%` }}
                ></div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 origin-top-left">
                  {activity.date.split('-')[2]}/{activity.date.split('-')[1]}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>70</div>
            <div>60</div>
            <div>50</div>
            <div>40</div>
            <div>30</div>
            <div>20</div>
            <div>10</div>
            <div>0</div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Étudiants actifs</span>
          </div>
        </div>
      </div>

      {/* Meilleurs étudiants */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Meilleurs étudiants</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Étudiant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cours complétés
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score moyen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière activité
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {topPerformers.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{student.coursesCompleted}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{student.averageScore}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.lastActive}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
