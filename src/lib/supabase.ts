import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verifica se as variáveis de ambiente estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Cria cliente apenas se configurado, caso contrário retorna um mock
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para verificar se Supabase está configurado
export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured;
}

// Tipos para o banco de dados
export type Database = {
  documents: {
    id: string;
    name: string;
    content: string;
    type: string;
    size: number;
    uploaded_by: string;
    uploaded_at: string;
    metadata: any;
  };
  messages: {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    document_references: string[];
    created_at: string;
  };
  analytics: {
    id: string;
    query: string;
    user_id: string;
    user_name: string;
    documents_referenced: string[];
    response_time: number;
    created_at: string;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
  };
};
