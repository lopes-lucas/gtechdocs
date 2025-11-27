'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function EnvBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);

  useEffect(() => {
    // Verifica se as variáveis de ambiente estão configuradas
    const missing: string[] = [];
    
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      missing.push('NEXT_PUBLIC_OPENAI_API_KEY');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    if (missing.length > 0) {
      setMissingVars(missing);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                ⚠️ Variáveis de Ambiente Não Configuradas
              </h3>
              <p className="text-sm opacity-95 mb-2">
                Para o aplicativo funcionar corretamente, você precisa configurar as seguintes variáveis:
              </p>
              <ul className="text-sm space-y-1 mb-3">
                {missingVars.map((varName) => (
                  <li key={varName} className="font-mono bg-white/20 px-2 py-1 rounded inline-block mr-2">
                    {varName}
                  </li>
                ))}
              </ul>
              <div className="text-sm space-y-1">
                <p className="font-semibold">📝 Como configurar:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-95">
                  <li>Crie um arquivo <code className="bg-white/20 px-1 rounded">.env.local</code> na raiz do projeto</li>
                  <li>Copie o conteúdo de <code className="bg-white/20 px-1 rounded">.env.local.example</code></li>
                  <li>Adicione suas chaves da OpenAI e Supabase</li>
                  <li>Reinicie o servidor de desenvolvimento</li>
                </ol>
                <p className="mt-2 opacity-95">
                  📖 Consulte o arquivo <code className="bg-white/20 px-1 rounded">CONFIGURACAO.md</code> para instruções detalhadas.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
            aria-label="Fechar banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
