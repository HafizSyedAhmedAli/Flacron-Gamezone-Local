import { apiAuthPost } from '@/shared/api/client';
import type { User } from '@/shared/types';

interface AuthResponse {
   token: string;
   user: User;
}

export const login = (email: string, password: string) =>
   apiAuthPost<AuthResponse>('/api/auth/login', { email, password });

export const signup = (email: string, password: string) =>
   apiAuthPost<AuthResponse>('/api/auth/signup', { email, password });
