/**
 * Service pour la gestion des quiz
 * Fournit des méthodes pour interagir avec les API de quiz
 */
import { ApiService } from './api';

// Types pour les quiz
export interface Quiz {
  id: number;
  lessonId: number;
  question: string;
  options: string[];
  correctAnswer: string;
  maxScore: number;
}

export interface QuizFormData {
  question: string;
  options: string[];
  correctAnswer: string;
  maxScore?: number;
}

export class QuizService {
  // Récupérer le quiz d'une leçon
  static async getQuiz(courseId: number, lessonId: number): Promise<Quiz | null> {
    try {
      return await ApiService.get<Quiz>(`/api/courses/${courseId}/lessons/${lessonId}/quiz`);
    } catch (error) {
      // Si le quiz n'existe pas, on retourne null au lieu de lancer une erreur
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Créer un quiz pour une leçon
  static async createQuiz(
    courseId: number,
    lessonId: number,
    quizData: QuizFormData
  ): Promise<{ message: string; quiz: Quiz }> {
    return ApiService.post<{ message: string; quiz: Quiz }>(
      `/api/courses/${courseId}/lessons/${lessonId}/quiz`,
      quizData
    );
  }

  // Mettre à jour un quiz existant
  static async updateQuiz(
    courseId: number,
    lessonId: number,
    quizData: QuizFormData
  ): Promise<{ message: string; quiz: Quiz }> {
    return ApiService.put<{ message: string; quiz: Quiz }>(
      `/api/courses/${courseId}/lessons/${lessonId}/quiz`,
      quizData
    );
  }

  // Supprimer un quiz
  static async deleteQuiz(
    courseId: number,
    lessonId: number
  ): Promise<{ message: string }> {
    return ApiService.delete<{ message: string }>(
      `/api/courses/${courseId}/lessons/${lessonId}/quiz`
    );
  }

  // Soumettre une réponse à un quiz (pour les étudiants)
  static async submitQuizAnswer(
    courseId: number,
    lessonId: number,
    answer: string
  ): Promise<{ correct: boolean; score: number; message: string }> {
    return ApiService.post<{ correct: boolean; score: number; message: string }>(
      `/api/courses/${courseId}/lessons/${lessonId}/quiz/submit`,
      { answer }
    );
  }
}
