/**
 * Service pour la gestion des leçons
 * Fournit des méthodes pour interagir avec les API de leçons
 */
import { ApiService } from './api';

// Types pour les leçons
export interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  duration?: number;
  lessonOrder: number;
  hasQuiz?: boolean;
}

export interface LessonFormData {
  title: string;
  videoUrl: string;
  duration?: number;
  lessonOrder?: number;
}

export class LessonService {
  // Récupérer toutes les leçons d'un cours
  static async getLessons(courseId: number): Promise<Lesson[]> {
    return ApiService.get<Lesson[]>(`/api/courses/${courseId}/lessons`);
  }

  // Récupérer une leçon spécifique
  static async getLesson(courseId: number, lessonId: number): Promise<Lesson> {
    return ApiService.get<Lesson>(`/api/courses/${courseId}/lessons/${lessonId}`);
  }

  // Ajouter une nouvelle leçon à un cours
  static async createLesson(
    courseId: number,
    lessonData: LessonFormData
  ): Promise<{ message: string; lesson: Lesson }> {
    return ApiService.post<{ message: string; lesson: Lesson }>(
      `/api/courses/${courseId}/lessons`,
      lessonData
    );
  }

  // Mettre à jour une leçon existante
  static async updateLesson(
    courseId: number,
    lessonId: number,
    lessonData: LessonFormData
  ): Promise<{ message: string; lesson: Lesson }> {
    return ApiService.put<{ message: string; lesson: Lesson }>(
      `/api/courses/${courseId}/lessons/${lessonId}`,
      lessonData
    );
  }

  // Supprimer une leçon
  static async deleteLesson(
    courseId: number,
    lessonId: number
  ): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(
      `/api/courses/${courseId}/lessons/${lessonId}`
    );
  }

  // Réorganiser l'ordre des leçons
  static async reorderLesson(
    courseId: number,
    lessonId: number,
    newOrder: number
  ): Promise<{ message: string; lesson: Lesson }> {
    return ApiService.put<{ message: string; lesson: Lesson }>(
      `/api/courses/${courseId}/lessons/${lessonId}`,
      { lessonOrder: newOrder }
    );
  }
}
