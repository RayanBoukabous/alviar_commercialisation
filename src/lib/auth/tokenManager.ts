import { STORAGE_KEYS } from '@/constants';

export interface TokenData {
  access_token: string;
  expires_at?: number;
  user_id?: string;
}

class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;

  private constructor() {
    this.loadTokenFromStorage();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Sauvegarder le token dans localStorage et en mémoire
   */
  public setToken(tokenData: TokenData): void {
    this.token = tokenData.access_token;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(tokenData));
    }
  }

  /**
   * Récupérer le token depuis localStorage
   */
  public getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    
    this.loadTokenFromStorage();
    return this.token;
  }

  /**
   * Charger le token depuis localStorage
   */
  private loadTokenFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (tokenData) {
        const parsed: TokenData = JSON.parse(tokenData);
        this.token = parsed.access_token;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du token:', error);
      this.clearToken();
    }
  }

  /**
   * Vérifier si le token est valide
   */
  public isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Vérifier si le token n'est pas expiré
    if (typeof window !== 'undefined') {
      try {
        const tokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (tokenData) {
          const parsed: TokenData = JSON.parse(tokenData);
          if (parsed.expires_at && Date.now() > parsed.expires_at) {
            this.clearToken();
            return false;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Supprimer le token
   */
  public clearToken(): void {
    this.token = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  /**
   * Obtenir les données complètes du token
   */
  public getTokenData(): TokenData | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const tokenData = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du token:', error);
      return null;
    }
  }

  /**
   * Rafraîchir le token
   */
  public refreshToken(newTokenData: TokenData): void {
    this.setToken(newTokenData);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  public isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  /**
   * Obtenir l'ID de l'utilisateur depuis le token
   */
  public getUserId(): string | null {
    const tokenData = this.getTokenData();
    return tokenData?.user_id || null;
  }
}

// Instance singleton
export const tokenManager = TokenManager.getInstance();

// Fonctions utilitaires
export const saveToken = (tokenData: TokenData) => {
  tokenManager.setToken(tokenData);
};

export const getToken = (): string | null => {
  return tokenManager.getToken();
};

export const clearToken = () => {
  tokenManager.clearToken();
};

export const isAuthenticated = (): boolean => {
  return tokenManager.isAuthenticated();
};

export const getUserId = (): string | null => {
  return tokenManager.getUserId();
};

export default tokenManager;
