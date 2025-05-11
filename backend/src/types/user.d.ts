export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  picture?: string;
  [key: string]: any;
} 