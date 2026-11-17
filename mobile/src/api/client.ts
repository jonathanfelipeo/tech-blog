import axios from 'axios';
import { Post, Comment, Teacher, Student, PaginatedResponse, AuthResponse, LoginRole } from '../types';

// Se testar no celular via Wi-Fi, substitua 'localhost' pelo IP local do seu computador (ex: 192.168.1.X)
export const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- AUTENTICAÇÃO ---
export const loginTeacher = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/teachers/login', { email, password });
  return response.data;
};

export const loginStudent = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/students/login', { email, password });
  return response.data;
};

export const login = (role: LoginRole, email: string, password: string): Promise<AuthResponse> =>
  role === 'teacher' ? loginTeacher(email, password) : loginStudent(email, password);

// --- POSTAGENS ---
export const getPosts = async (): Promise<Post[]> => {
  const response = await api.get<Post[]>('/posts');
  return response.data;
};

export const searchPosts = async (term: string): Promise<Post[]> => {
  const response = await api.get<Post[]>('/posts/search', { params: { term } });
  return response.data;
};

export const getPostById = async (id: number): Promise<Post> => {
  const response = await api.get<Post>(`/posts/${id}`);
  return response.data;
};

export const createPost = async (data: Omit<Post, 'id' | 'created_at'>): Promise<Post> => {
  const response = await api.post<Post>('/posts', data);
  return response.data;
};

export const updatePost = async (id: number, data: Omit<Post, 'id' | 'created_at'>): Promise<Post> => {
  const response = await api.put<Post>(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await api.delete(`/posts/${id}`);
};

export const getComments = async (postId: number): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId: number, text: string): Promise<Comment> => {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, { text });
  return response.data;
};

export const updateComment = async (postId: number, commentId: number, text: string): Promise<Comment> => {
  const response = await api.put<Comment>(`/posts/${postId}/comments/${commentId}`, { text });
  return response.data;
};

export const deleteComment = async (postId: number, commentId: number): Promise<void> => {
  await api.delete(`/posts/${postId}/comments/${commentId}`);
};

// --- PROFESSORES ---
export const getTeachers = async (page = 1, limit = 10): Promise<PaginatedResponse<Teacher>> => {
  const response = await api.get<PaginatedResponse<Teacher>>('/teachers', { params: { page, limit } });
  return response.data;
};

export const getTeacherById = async (id: number): Promise<Teacher> => {
  const response = await api.get<Teacher>(`/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data: Omit<Teacher, 'id' | 'created_at'>): Promise<Teacher> => {
  const response = await api.post<Teacher>('/teachers', data);
  return response.data;
};

export const updateTeacher = async (id: number, data: Partial<Teacher>): Promise<Teacher> => {
  const response = await api.put<Teacher>(`/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: number): Promise<void> => {
  await api.delete(`/teachers/${id}`);
};

// --- ESTUDANTES ---
export const getStudents = async (page = 1, limit = 10): Promise<PaginatedResponse<Student>> => {
  const response = await api.get<PaginatedResponse<Student>>('/students', { params: { page, limit } });
  return response.data;
};

export const getStudentById = async (id: number): Promise<Student> => {
  const response = await api.get<Student>(`/students/${id}`);
  return response.data;
};

export const createStudent = async (
  data: Omit<Student, 'id' | 'created_at'> & { password: string }
): Promise<Student> => {
  const response = await api.post<Student>('/students', data);
  return response.data;
};

export const updateStudent = async (
  id: number,
  data: Omit<Student, 'id' | 'created_at'> & { password?: string }
): Promise<Student> => {
  const response = await api.put<Student>(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: number): Promise<void> => {
  await api.delete(`/students/${id}`);
};