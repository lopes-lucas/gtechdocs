'use client';

import { Upload, X, FileText, File, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Document } from '../types';
import { extractTextFromFile } from '@/lib/openai';
import { saveDocumentToDB, deleteDocumentFromDB } from '@/lib/database';

interface DocumentUploadProps {
  documents: Array<Document & { content: string }>;
  onDocumentsChange: (documents: Array<Document & { content: string }>) => void;
}

export default function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const validFiles = files.filter(file => validTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      alert('Nenhum arquivo válido selecionado. Formatos aceitos: PDF, Word, TXT');
      return;
    }

    setIsUploading(true);

    try {
      const newDocuments: Array<Document & { content: string }> = [];

      for (const file of validFiles) {
        // Extrai texto do arquivo
        const content = await extractTextFromFile(file);

        const doc: Document & { content: string } = {
          id: `doc-${Date.now()}-${Math.random()}`,
          name: file.name,
          content: content,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          uploadedBy: 'current-user',
        };

        // Salva no banco de dados
        try {
          await saveDocumentToDB(doc, content);
          newDocuments.push(doc);
        } catch (error) {
          console.error('Erro ao salvar documento no banco:', error);
          // Continua mesmo se falhar - salva localmente
          newDocuments.push(doc);
        }
      }

      onDocumentsChange([...documents, ...newDocuments]);
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      alert('Erro ao processar arquivos. Verifique o console para mais detalhes.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // Remove do banco de dados
      await deleteDocumentFromDB(id);
    } catch (error) {
      console.error('Erro ao remover documento do banco:', error);
    }
    
    // Remove localmente
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-950/30 rounded-full">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isUploading ? 'Processando documentos...' : 'Arraste documentos aqui'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isUploading ? 'Extraindo texto e salvando no banco de dados' : 'ou clique para selecionar arquivos'}
            </p>
          </div>

          {!isUploading && (
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <Upload className="w-5 h-5" />
                Selecionar Arquivos
              </span>
            </label>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos aceitos: PDF, Word (.doc, .docx), TXT
          </p>
        </div>
      </div>

      {/* Lista de Documentos */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Documentos Carregados ({documents.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Todos os documentos estão disponíveis para análise pela IA
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                    {doc.type === 'application/pdf' ? (
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString('pt-BR')} • {doc.content.length} caracteres
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Remover documento"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum documento carregado ainda
          </p>
        </div>
      )}
    </div>
  );
}
