'use client';

import { Bot, User } from 'lucide-react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isProcessing?: boolean;
}

export default function MessageList({ messages, isProcessing }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-full mb-4">
            <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo ao GetchDocs
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Faça perguntas sobre os documentos corporativos e receba respostas precisas baseadas no conteúdo oficial.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.content.split('\n').map((line, i) => {
                  // Renderiza títulos em negrito
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-bold mb-2">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  
                  // Renderiza listas numeradas
                  if (/^\d+\./.test(line)) {
                    return (
                      <p key={i} className="ml-4 mb-1">
                        {line}
                      </p>
                    );
                  }
                  
                  // Renderiza listas com marcadores
                  if (line.startsWith('- ')) {
                    return (
                      <p key={i} className="ml-4 mb-1">
                        {line}
                      </p>
                    );
                  }
                  
                  // Renderiza texto normal
                  return line ? (
                    <p key={i} className="mb-2">
                      {line.split('**').map((part, j) => 
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                    </p>
                  ) : (
                    <br key={i} />
                  );
                })}
              </div>
              
              <p className="text-xs opacity-70 mt-3">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-6 py-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
