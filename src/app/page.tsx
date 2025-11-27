'use client';

import { useState, useEffect } from 'react';
import { FileText, MessageSquare, BarChart3, LogOut, Upload, Shield, Users } from 'lucide-react';
import DocumentUpload from './components/DocumentUpload';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import type { Document, Message, User } from './types';
import { getCurrentUser, logout, canUploadDocuments, canManageUsers } from '@/lib/auth';
import { saveQueryAnalytics, getDashboardStats } from '@/lib/analytics';
import { analyzeDocumentsWithAI } from '@/lib/openai';
import { 
  getDocumentsFromDB, 
  saveMessageToDB, 
  getMessagesFromDB,
  saveAnalyticsToDB,
  getUsersFromDB 
} from '@/lib/database';

type Tab = 'chat' | 'upload' | 'dashboard' | 'users';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [documents, setDocuments] = useState<Array<Document & { content: string }>>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  // Verifica se há usuário logado ao carregar
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadInitialData();
    }
  }, []);

  // Carrega dados iniciais do banco
  const loadInitialData = async () => {
    try {
      // Carrega documentos
      const docs = await getDocumentsFromDB();
      setDocuments(docs);

      // Carrega mensagens
      const msgs = await getMessagesFromDB();
      setMessages(msgs);

      // Carrega total de usuários
      const users = await getUsersFromDB();
      setTotalUsers(users.length);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Se falhar, continua com dados locais
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveTab('chat');
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser) return;

    const startTime = Date.now();
    
    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
      userId: currentUser.id,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Salva mensagem do usuário no banco
    try {
      await saveMessageToDB(userMessage);
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }

    try {
      if (documents.length === 0) {
        // Sem documentos
        const noDocsResponse: Message = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: "Não encontrei documentos disponíveis. Por favor, faça o upload de documentos corporativos para que eu possa ajudá-lo.",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, noDocsResponse]);
        await saveMessageToDB(noDocsResponse);
        setIsProcessing(false);
        return;
      }

      // Analisa com IA REAL usando GPT-4
      const aiResponse = await analyzeDocumentsWithAI({
        query: content,
        documents: documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          content: doc.content,
        })),
      });

      const responseTime = Date.now() - startTime;
      
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse.answer,
        timestamp: new Date(),
        documentReferences: aiResponse.documentReferences,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);

      // Salva mensagem da IA no banco
      await saveMessageToDB(assistantMessage);

      // Salva analytics no banco
      await saveAnalyticsToDB({
        id: `analytics-${Date.now()}`,
        query: content,
        userId: currentUser.id,
        userName: currentUser.name,
        documentsReferenced: documents.map(d => d.name),
        responseTime,
        timestamp: new Date(),
      });

      // Também salva localmente para o dashboard
      saveQueryAnalytics({
        id: `analytics-${Date.now()}`,
        query: content,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date(),
        documentsReferenced: documents.map(d => d.name),
        responseTime,
      });

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      const errorMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: `❌ Erro ao processar sua pergunta: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n**Verifique:**\n- Se a chave da API OpenAI está configurada\n- Se o Supabase está conectado\n- Se há documentos carregados`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  };

  // Se não estiver logado, mostra tela de login
  if (!currentUser) {
    return <LoginForm onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Navegação */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                GetchDocs
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assistente Corporativo
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1">
                {currentUser.role === 'admin' && (
                  <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Consultas</span>
          </button>

          {canUploadDocuments(currentUser) && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload</span>
              <Shield className="w-4 h-4 ml-auto" />
            </button>
          )}

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          {canManageUsers(currentUser) && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Usuários</span>
              <Shield className="w-4 h-4 ml-auto" />
            </button>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab: Chat */}
        {activeTab === 'chat' && (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Consulta de Documentos com IA
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {documents.length === 0 
                      ? 'Nenhum documento carregado' 
                      : `${documents.length} documento${documents.length > 1 ? 's' : ''} disponível${documents.length > 1 ? 'eis' : ''} • Powered by GPT-4`
                    }
                  </p>
                </div>
                
                {documents.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-950/30 rounded-full">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      IA Ativa
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagens */}
            <MessageList messages={messages} isProcessing={isProcessing} />

            {/* Input */}
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isProcessing}
              hasDocuments={documents.length > 0}
            />
          </>
        )}

        {/* Tab: Upload (apenas para admins) */}
        {activeTab === 'upload' && canUploadDocuments(currentUser) && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Gerenciar Documentos
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Adicione ou remova documentos do sistema. Os documentos são processados pela IA para análise inteligente.
                </p>
              </div>
              
              <DocumentUpload 
                documents={documents} 
                onDocumentsChange={setDocuments}
              />
            </div>
          </div>
        )}

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
            <Dashboard 
              stats={{
                ...getDashboardStats(),
                totalDocuments: documents.length,
                totalUsers: totalUsers,
              }} 
            />
          </div>
        )}

        {/* Tab: Usuários (apenas para admins) */}
        {activeTab === 'users' && canManageUsers(currentUser) && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6">
              <UserManagement currentUser={currentUser} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
