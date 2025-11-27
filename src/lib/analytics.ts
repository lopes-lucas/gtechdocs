import type { QueryAnalytics, DashboardStats } from '@/app/types';

const ANALYTICS_STORAGE_KEY = 'getchdocs_analytics';

// Obtém todas as consultas salvas
export function getAllQueries(): QueryAnalytics[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  if (!stored) return [];
  
  const queries = JSON.parse(stored);
  return queries.map((q: any) => ({
    ...q,
    timestamp: new Date(q.timestamp),
  }));
}

// Salva uma nova consulta
export function saveQueryAnalytics(query: QueryAnalytics) {
  if (typeof window === 'undefined') return;
  
  const queries = getAllQueries();
  queries.push(query);
  
  // Mantém apenas as últimas 1000 consultas
  const limitedQueries = queries.slice(-1000);
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(limitedQueries));
}

// Obtém estatísticas do dashboard
export function getDashboardStats(): DashboardStats {
  const queries = getAllQueries();
  
  // Total de consultas
  const totalQueries = queries.length;
  
  // Tempo médio de resposta
  const avgResponseTime = queries.length > 0
    ? queries.reduce((sum, q) => sum + q.responseTime, 0) / queries.length
    : 0;
  
  // Top consultas (agrupa por query similar)
  const queryCount = new Map<string, number>();
  queries.forEach(q => {
    const normalized = q.query.toLowerCase().trim();
    queryCount.set(normalized, (queryCount.get(normalized) || 0) + 1);
  });
  
  const topQueries = Array.from(queryCount.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Atividade recente (últimas 20)
  const recentActivity = queries.slice(-20).reverse();
  
  // Consultas por dia (últimos 7 dias)
  const queriesByDay: Array<{ date: string; count: number }> = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = queries.filter(q => {
      const qDate = q.timestamp.toISOString().split('T')[0];
      return qDate === dateStr;
    }).length;
    
    queriesByDay.push({
      date: dateStr,
      count,
    });
  }
  
  return {
    totalQueries,
    totalDocuments: 0, // Será atualizado pelo componente principal
    totalUsers: 0, // Será atualizado pelo componente principal
    avgResponseTime,
    topQueries,
    recentActivity,
    queriesByDay,
  };
}
