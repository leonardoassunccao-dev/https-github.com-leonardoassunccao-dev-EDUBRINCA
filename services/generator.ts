import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, ActivitySheet, Subject, ClassLevel, ActivityType, ActivityQuestion, Source, GradeLevel } from '../types';

// --- GERENCIAMENTO DE ESTADO DA IA ---

let aiInstance: GoogleGenAI | null = null;
let isInitialized = false;

// Função segura para obter o cliente IA
const getAiClient = (): GoogleGenAI | null => {
  if (isInitialized) return aiInstance;

  try {
    // process.env.API_KEY é substituído pelo Vite em tempo de build
    const rawApiKey = process.env.API_KEY;
    
    const isValid = 
      typeof rawApiKey === 'string' && 
      rawApiKey.trim().length > 0 && 
      rawApiKey !== 'undefined' &&
      !rawApiKey.includes('YOUR_API_KEY');

    if (isValid) {
      aiInstance = new GoogleGenAI({ apiKey: rawApiKey });
      console.log('✅ EduBrinca: IA conectada com sucesso.');
    } else {
      console.warn('⚠️ EduBrinca: Modo Offline (Sem API Key configurada).');
    }
  } catch (error) {
    console.error('❌ Erro fatal ao inicializar IA:', error);
    aiInstance = null;
  } finally {
    isInitialized = true;
  }

  return aiInstance;
};

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper para extrair fontes
const extractSources = (response: any): Source[] => {
  if (!response?.candidates?.[0]?.groundingMetadata?.groundingChunks) return [];
  const chunks = response.candidates[0].groundingMetadata.groundingChunks;
  return chunks
    .filter((c: any) => c.web)
    .map((c: any) => ({
      uri: c.web.uri,
      title: c.web.title || c.web.uri
    }));
};

// Diretrizes pedagógicas
const getGradeGuidelines = (grade: GradeLevel) => {
  switch (grade) {
    case '2º Ano':
      return "Diretrizes 2º ANO: Frases curtas, vocabulário simples, apoio visual implícito. Foco em alfabetização.";
    case '3º Ano':
      return "Diretrizes 3º ANO: Frases médias, estimule autonomia. Introduza pequenos desafios de lógica.";
    case '4º Ano':
      return "Diretrizes 4º ANO: Textos estruturados, interpretação de texto e problemas matemáticos em etapas.";
    default:
      return "";
  }
};

// --- MOCK GENERATORS (Modo Offline) ---
// Estes geradores são usados sempre que a IA falha ou não tem chave
const getMockLessonPlan = (subject: Subject, theme: string, duration: number, level: ClassLevel, gradeLevel: GradeLevel, objective?: string): LessonPlan => {
  return {
    id: generateId(),
    createdAt: Date.now(),
    subject,
    theme,
    duration,
    level,
    gradeLevel,
    objective: objective || `Introduzir o tema ${theme} (Modo Offline - IA indisponível)`,
    materials: ["Quadro e giz/pincel", "Caderno do aluno", "Lápis de cor", "Material impresso"],
    steps: [
      { time: "10 min", title: "Acolhida", description: "Roda de conversa inicial para levantar os conhecimentos prévios dos alunos sobre o tema." },
      { time: "20 min", title: "Desenvolvimento", description: `Explicação lúdica sobre ${theme}, utilizando exemplos concretos da realidade da turma.` },
      { time: "15 min", title: "Prática", description: "Atividade de fixação para consolidar o aprendizado." },
      { time: "5 min", title: "Encerramento", description: "Feedback coletivo e organização da sala." }
    ],
    differentiation: {
      remedial: "Oferecer apoio próximo e material concreto.",
      advanced: "Propor que expliquem o conteúdo para um colega."
    },
    sources: []
  };
};

const getMockActivity = (subject: Subject, theme: string, type: ActivityType, count: number, level: ClassLevel, gradeLevel: GradeLevel): ActivitySheet => {
  const questions: ActivityQuestion[] = [];
  
  for(let i=0; i<count; i++) {
    questions.push({
        id: generateId(),
        instruction: `Questão ${i+1} sobre ${theme}`,
        content: `Esta é uma questão de exemplo gerada no modo offline.\nPara ter questões personalizadas pela IA, configure uma API Key válida.\n\n(   ) Opção A\n(   ) Opção B`,
        answer: "Gabarito indisponível no modo offline"
    });
  }

  return {
    id: generateId(),
    createdAt: Date.now(),
    subject,
    theme,
    type,
    level,
    gradeLevel,
    schoolHeader: { studentName: true, date: true, teacherName: true },
    questions,
    sources: []
  };
};

// --- FUNÇÕES EXPORTADAS ---

export const generateLessonPlan = async (
  subject: Subject,
  theme: string,
  duration: number,
  level: ClassLevel,
  gradeLevel: GradeLevel,
  customObjective?: string
): Promise<LessonPlan> => {

  const ai = getAiClient();

  // Se não tem IA, retorna template imediatamente
  if (!ai) {
    await new Promise(r => setTimeout(r, 800)); // Delay para UX
    return getMockLessonPlan(subject, theme, duration, level, gradeLevel, customObjective);
  }

  const gradeRules = getGradeGuidelines(gradeLevel);
  const prompt = `Crie um Planejamento de Aula JSON para ${gradeLevel}.
  Tema: ${theme}. Disciplina: ${subject}. Duração: ${duration}min.
  ${gradeRules}
  Retorne APENAS JSON válido.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é uma professora especialista.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            differentiation: {
              type: Type.OBJECT,
              properties: { remedial: { type: Type.STRING }, advanced: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Validação básica do retorno da IA
    if (!data.steps || data.steps.length === 0) throw new Error("Resposta IA incompleta");

    return {
      id: generateId(),
      createdAt: Date.now(),
      subject,
      theme,
      duration,
      level,
      gradeLevel,
      objective: data.objective || `Aula sobre ${theme}`,
      materials: data.materials || [],
      steps: data.steps || [],
      differentiation: data.differentiation || { remedial: "-", advanced: "-" },
      sources: extractSources(response)
    };

  } catch (error) {
    console.error("Falha na geração via IA:", error);
    // Fallback silencioso para template
    return getMockLessonPlan(subject, theme, duration, level, gradeLevel, customObjective);
  }
};

export const generateActivity = async (
  subject: Subject,
  theme: string,
  type: ActivityType,
  count: number,
  level: ClassLevel,
  gradeLevel: GradeLevel
): Promise<ActivitySheet> => {

  const ai = getAiClient();

  if (!ai) {
    await new Promise(r => setTimeout(r, 800));
    return getMockActivity(subject, theme, type, count, level, gradeLevel);
  }

  const gradeRules = getGradeGuidelines(gradeLevel);
  const prompt = `Crie Atividade Escolar JSON para ${gradeLevel}.
  Tema: ${theme}. Tipo: ${type}. Qtd: ${count}.
  ${gradeRules}
  Retorne APENAS JSON válido.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é uma professora criativa.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  instruction: { type: Type.STRING },
                  content: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const questions = (data.questions || []).map((q: any) => ({ ...q, id: generateId() }));

    if (questions.length === 0) throw new Error("Nenhuma questão gerada");

    return {
      id: generateId(),
      createdAt: Date.now(),
      subject,
      theme,
      type,
      level,
      gradeLevel,
      schoolHeader: { studentName: true, date: true, teacherName: true },
      questions,
      sources: extractSources(response)
    };

  } catch (error) {
    console.error("Falha na geração via IA:", error);
    return getMockActivity(subject, theme, type, count, level, gradeLevel);
  }
};