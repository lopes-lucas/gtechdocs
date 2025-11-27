'use client';

import { BarChart3, TrendingUp, Users, FileText, Clock, MessageSquare } from 'lucide-react';

interface DashboardStats {
  totalQueries: number;
  totalDocuments: number;
  totalUsers: number;
  avgResponseTime: number;
  topQueries: Array<{ query: string; count: number }>;
  queriesByDay: Array<{ date: string; count: number }>;
}

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const maxQueryCount = Math.max(...stats.topQueries.map(q => q.count), 1);
  const maxDayCount = Math.max(...stats.queriesByDay.map(d => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Dashboard de Análise
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize as principais métricas e consultas do sistema
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de Consultas */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.totalQueries}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total de Consultas
          </p>
        </div>

        {/* Total de Documentos */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +3
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.totalDocuments}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Documentos Ativos
          </p>
        </div>

        {/* Total de Usuários */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.totalUsers}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Usuários Ativos
          </p>
        </div>

        {/* Tempo Médio de Resposta */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              -8%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {stats.avgResponseTime}ms
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tempo Médio
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consultas */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Principais Consultas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tópicos mais pesquisados
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.topQueries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhuma consulta registrada ainda
              </div>
            ) : (
              stats.topQueries.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate flex-1 mr-4">
                      {item.query}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxQueryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Consultas por Dia */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Consultas por Dia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Últimos 7 dias
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.queriesByDay.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum dado disponível
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-48">
                {stats.queriesByDay.map((item, index) => {
                  const height = (item.count / maxDayCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center h-40">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-purple-600 hover:to-purple-700 relative group"
                          style={{ height: `${height}%`, minHeight: item.count > 0 ? '8px' : '0' }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.count} consultas
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Dashboard em Tempo Real
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Os dados são atualizados automaticamente conforme novas consultas são realizadas. 
              Use essas métricas para entender melhor como os usuários interagem com o sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
