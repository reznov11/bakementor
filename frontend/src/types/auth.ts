export type UserRole = "admin" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
  role: UserRole;
  date_joined: string;
  is_active: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

