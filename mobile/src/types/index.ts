export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at?: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  created_at: string;
  teacher_id: number | null;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  subject?: string;
  password?: string;
  created_at?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  registration?: string;
  created_at?: string;
}

export type LoginRole = 'teacher' | 'student';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  subject?: string;
  role: 'teacher' | 'student';
}

export interface AuthResponse {
  user: User;
  token: string;
}