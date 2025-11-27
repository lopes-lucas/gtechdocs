// Tipos do sistema

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  content?: string; // Conteúdo extraído do documento
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  userId?: string;
  documentReferences?: string[];
}

export interface QueryAnalytics {
  id: string;
  query: string;
  userId: string;
  userName: string;
  timestamp: Date;
  documentsReferenced: string[];
  responseTime: number;
}

export interface DashboardStats {
  totalQueries: number;
  totalDocuments: number;
  totalUsers: number;
  avgResponseTime: number;
  topQueries: Array<{ query: string; count: number }>;
  recentActivity: QueryAnalytics[];
  queriesByDay: Array<{ date: string; count: number }>;
}
