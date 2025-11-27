import { supabase, isSupabaseAvailable } from './supabase';
import type { Document, Message, User } from '@/app/types';

/**
 * DOCUMENTOS
 */

export async function saveDocumentToDB(document: Document, content: string) {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase não configurado. Configure suas credenciais para persistir dados.');
    return null;
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({
      id: document.id,
      name: document.name,
      content: content,
      type: document.type,
      size: document.size,
      uploaded_by: document.uploadedBy,
      uploaded_at: document.uploadedAt.toISOString(),
      metadata: {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocumentsFromDB(): Promise<Array<Document & { content: string }>> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(doc => ({
    id: doc.id,
    name: doc.name,
    content: doc.content,
    type: doc.type,
    size: doc.size,
    uploadedBy: doc.uploaded_by,
    uploadedAt: new Date(doc.uploaded_at),
  }));
}

export async function deleteDocumentFromDB(id: string) {
  if (!isSupabaseAvailable() || !supabase) {
    return;
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * MENSAGENS
 */

export async function saveMessageToDB(message: Message) {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase não configurado. Configure suas credenciais para persistir mensagens.');
    return null;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: message.id,
      user_id: message.userId || 'anonymous',
      role: message.role,
      content: message.content,
      document_references: message.documentReferences || [],
      created_at: message.timestamp.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessagesFromDB(userId?: string): Promise<Message[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  let query = supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(msg => ({
    id: msg.id,
    userId: msg.user_id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    documentReferences: msg.document_references,
  }));
}

/**
 * ANALYTICS
 */

export async function saveAnalyticsToDB(analytics: {
  id: string;
  query: string;
  userId: string;
  userName: string;
  documentsReferenced: string[];
  responseTime: number;
  timestamp: Date;
}) {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase não configurado. Configure suas credenciais para persistir analytics.');
    return null;
  }

  const { data, error } = await supabase
    .from('analytics')
    .insert({
      id: analytics.id,
      query: analytics.query,
      user_id: analytics.userId,
      user_name: analytics.userName,
      documents_referenced: analytics.documentsReferenced,
      response_time: analytics.responseTime,
      created_at: analytics.timestamp.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalyticsFromDB() {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

/**
 * USUÁRIOS
 */

export async function saveUserToDB(user: User) {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase não configurado. Configure suas credenciais para persistir usuários.');
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUsersFromDB(): Promise<User[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));
}

export async function updateUserInDB(id: string, updates: Partial<User>) {
  if (!isSupabaseAvailable() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      email: updates.email,
      role: updates.role,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserFromDB(id: string) {
  if (!isSupabaseAvailable() || !supabase) {
    return;
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
