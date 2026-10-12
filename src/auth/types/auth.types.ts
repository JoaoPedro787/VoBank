export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
