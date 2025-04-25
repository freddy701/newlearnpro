/**
 * Service de base pour les appels API
 * Contient les méthodes génériques pour effectuer des requêtes HTTP
 */

// Fonction générique pour gérer les erreurs de requête
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Erreur ${response.status}: ${response.statusText}`;
      
      // Ajouter des détails supplémentaires pour les erreurs courantes
      if (response.status === 404) {
        throw new Error(`Ressource non trouvée: ${errorMessage}`);
      } else if (response.status === 401) {
        throw new Error(`Non autorisé: ${errorMessage}. Veuillez vous reconnecter.`);
      } else if (response.status === 403) {
        throw new Error(`Accès refusé: ${errorMessage}. Vérifiez vos permissions.`);
      } else if (response.status === 500) {
        console.error('Erreur serveur détaillée:', errorData);
        throw new Error(`Une erreur serveur est survenue. Nos équipes ont été notifiées. Veuillez réessayer dans quelques instants.`);
      }
      
      throw new Error(errorMessage);
    } catch (jsonError) {
      // Si la réponse n'est pas du JSON valide ou si une erreur se produit lors du parsing
      console.error('Erreur lors du traitement de la réponse:', jsonError);
      
      const baseErrorMessage = `Une erreur est survenue (${response.status}): `;
      if (response.status === 404) {
        throw new Error(`${baseErrorMessage}La ressource demandée n'existe pas. Veuillez vérifier l'URL.`);
      } else if (response.status === 401) {
        throw new Error(`${baseErrorMessage}Votre session a expiré. Veuillez vous reconnecter.`);
      } else if (response.status === 403) {
        throw new Error(`${baseErrorMessage}Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.`);
      } else if (response.status === 500) {
        throw new Error(`${baseErrorMessage}Le serveur a rencontré une erreur. Nos équipes ont été notifiées. Veuillez réessayer plus tard.`);
      }
      throw new Error(`${baseErrorMessage}Une erreur inattendue s'est produite. Veuillez réessayer.`);
    }
  }
  
  try {
    return await response.json();
  } catch (jsonError) {
    throw new Error('Erreur lors du traitement de la réponse. Veuillez vérifier le format des données.');
  }
};

// Classe de base pour les services API
export class ApiService {
  // Méthode GET générique
  static async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  // Méthode POST générique
  static async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  // Méthode PUT générique
  static async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  // Méthode DELETE générique
  static async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }
}
