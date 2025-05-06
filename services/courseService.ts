/**
 * Service pour la gestion des cours
 * Fournit des méthodes pour interagir avec les API de cours
 */
import { ApiService } from './api';

// Types pour les cours
export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price: number;
  isPublished: boolean;
  teacherId: number;
  createdAt: string;
  lessonsCount?: number;
  studentsCount?: number;
  teacher?: {
    id: number;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export interface CourseFormData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price: number;
  isPublished?: boolean;
}

export interface CourseListResponse {
  courses: Course[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class CourseService {
  // Récupérer tous les cours avec pagination et filtres
  static async getCourses(
    page: number = 1,
    limit: number = 10,
    teacherId?: number
  ): Promise<CourseListResponse> {
    let url = `/api/courses?page=${page}&limit=${limit}`;
    if (teacherId) {
      url += `&teacherId=${teacherId}`;
    }
    return ApiService.get<CourseListResponse>(url);
  }

  // Récupérer un cours spécifique par son ID
  static async getCourse(id: number): Promise<Course> {
    return ApiService.get<Course>(`/api/courses/${id}`);
  }

  // Créer un nouveau cours
  static async createCourse(courseData: CourseFormData): Promise<{ message: string; course: Course }> {
    return ApiService.post<{ message: string; course: Course }>('/api/courses', courseData);
  }

  // Mettre à jour un cours existant
  static async updateCourse(
    id: number,
    courseData: CourseFormData
  ): Promise<{ message: string; course: Course }> {
    return ApiService.put<{ message: string; course: Course }>(`/api/courses/${id}`, courseData);
  }

  // Supprimer un cours
  static async deleteCourse(id: number): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(`/api/courses/${id}`);
  }

  // Récupérer les cours d'un enseignant
  static async getTeacherCourses(teacherId: number): Promise<CourseListResponse> {
    const response = await this.getCourses(1, 100, teacherId);
    return {
      courses: response.courses,
      meta: response.meta
    };
  }

  // Publier ou dépublier un cours
  static async togglePublishStatus(
    id: number, 
    isPublished: boolean
  ): Promise<{ message: string; course: Course }> {
    return ApiService.put<{ message: string; course: Course }>(`/api/courses/${id}`, { isPublished });
  }
}
