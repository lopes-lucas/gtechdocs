import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Para uso no cliente
});

export interface AIAnalysisRequest {
  query: string;
  documents: Array<{
    id: string;
    name: string;
    content: string;
  }>;
}

export interface AIAnalysisResponse {
  answer: string;
  documentReferences: string[];
  confidence: number;
}

/**
 * Analisa documentos usando GPT-4 e responde perguntas
 */
export async function analyzeDocumentsWithAI(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  try {
    // Prepara o contexto dos documentos
    const documentsContext = request.documents
      .map(
        (doc, index) =>
          `\n\n=== DOCUMENTO ${index + 1}: ${doc.name} ===\n${doc.content}`
      )
      .join('\n');

    // Cria o prompt para o GPT-4
    const systemPrompt = `Você é um assistente corporativo especializado em análise de documentos. 
Sua função é responder perguntas com base EXCLUSIVAMENTE no conteúdo dos documentos fornecidos.

REGRAS IMPORTANTES:
1. Responda APENAS com informações presentes nos documentos
2. Se a informação não estiver nos documentos, diga claramente que não encontrou
3. Cite sempre o nome do documento de onde tirou a informação
4. Seja preciso, objetivo e profissional
5. Use formatação markdown para melhor legibilidade
6. Se houver procedimentos ou listas, formate-os claramente

DOCUMENTOS DISPONÍVEIS:${documentsContext}`;

    const userPrompt = `PERGUNTA DO USUÁRIO: ${request.query}

Por favor, analise os documentos acima e responda à pergunta de forma clara e precisa.`;

    // Chama a API do OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Baixa temperatura para respostas mais precisas
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || 
      'Desculpe, não consegui processar sua pergunta.';

    // Identifica quais documentos foram referenciados na resposta
    const referencedDocs = request.documents
      .filter(doc => answer.toLowerCase().includes(doc.name.toLowerCase()))
      .map(doc => doc.id);

    return {
      answer,
      documentReferences: referencedDocs.length > 0 ? referencedDocs : request.documents.map(d => d.id),
      confidence: 0.85, // Pode ser ajustado com base em análises futuras
    };
  } catch (error) {
    console.error('Erro ao analisar documentos com IA:', error);
    throw new Error('Erro ao processar sua pergunta. Verifique se a chave da API OpenAI está configurada.');
  }
}

/**
 * Extrai texto de diferentes tipos de arquivo
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    // Para arquivos de texto simples
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } 
    // Para PDFs e Word, precisaríamos de bibliotecas adicionais
    // Por enquanto, retornamos uma mensagem
    else {
      resolve(`[Conteúdo do arquivo ${file.name} - Tipo: ${file.type}]`);
    }
  });
}
