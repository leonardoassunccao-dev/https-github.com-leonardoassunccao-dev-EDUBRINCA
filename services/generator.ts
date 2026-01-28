import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, ActivitySheet, Subject, ClassLevel, ActivityType, ActivityQuestion, Source, GradeLevel } from '../types';

// Inicialização do cliente Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper para extrair fontes do Search Grounding
const extractSources = (response: any): Source[] => {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .filter((c: any) => c.web)
    .map((c: any) => ({
      uri: c.web.uri,
      title: c.web.title || c.web.uri
    }));
};

// Diretrizes pedagógicas por ano
const getGradeGuidelines = (grade: GradeLevel) => {
  switch (grade) {
    case '2º Ano':
      return "Diretrizes 2º ANO: Frases curtas, vocabulário simples, apoio visual implícito na escrita. Linguagem muito acolhedora e lúdica. Foco em alfabetização e consolidação.";
    case '3º Ano':
      return "Diretrizes 3º ANO: Frases de tamanho médio, estimule a autonomia da criança. Menos repetição, introduza pequenos desafios de lógica. Foco em fluência.";
    case '4º Ano':
      return "Diretrizes 4º ANO: Textos mais completos e parágrafos estruturados. Exija interpretação de texto e problemas matemáticos com mais passos. Linguagem menos infantilizada, mais acadêmica, mas ainda amigável.";
    default:
      return "";
  }
};

export const generateLessonPlan = async (
  subject: Subject,
  theme: string,
  duration: number,
  level: ClassLevel,
  gradeLevel: GradeLevel,
  customObjective?: string
): Promise<LessonPlan> => {

  const gradeRules = getGradeGuidelines(gradeLevel);

  const systemInstruction = `Você é uma professora especialista do Ensino Fundamental I.
  Crie um planejamento de aula criativo e adequado para o ${gradeLevel}.
  ${gradeRules}
  Use o Google Search para trazer curiosidades reais, dados atualizados ou fatos interessantes sobre o tema.`;

  const prompt = `Crie um Planejamento de Aula estruturado em JSON.
  Ano da Turma: ${gradeLevel}
  Disciplina: ${subject}
  Tema: ${theme}
  Duração: ${duration} minutos
  Nível da Turma (Diferenciação): ${level}
  Objetivo Específico: ${customObjective || `Alinhado à BNCC para o ${gradeLevel}`}

  Certifique-se de que a complexidade e a linguagem estejam perfeitamente ajustadas para crianças do ${gradeLevel}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING, description: "Objetivo principal da aula em 1 frase clara." },
            materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de materiais necessários." },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING, description: "Duração estimada do passo (ex: '10 min')." },
                  title: { type: Type.STRING, description: "Título da etapa." },
                  description: { type: Type.STRING, description: "Descrição detalhada do que fazer, adequada ao ano escolar." }
                },
                required: ["time", "title", "description"]
              }
            },
            differentiation: {
              type: Type.OBJECT,
              properties: {
                remedial: { type: Type.STRING, description: "Estratégia para alunos de Reforço." },
                advanced: { type: Type.STRING, description: "Estratégia para alunos Avançados/Regular." }
              },
              required: ["remedial", "advanced"]
            }
          },
          required: ["objective", "materials", "steps", "differentiation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

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
      differentiation: data.differentiation || { remedial: "Apoio individualizado.", advanced: "Desafio extra." },
      sources: extractSources(response)
    };
  } catch (error) {
    console.error("Erro ao gerar planejamento:", error);
    return {
      id: generateId(),
      createdAt: Date.now(),
      subject,
      theme,
      duration,
      level,
      gradeLevel,
      objective: "Erro ao gerar planejamento. Tente novamente.",
      materials: [],
      steps: [],
      differentiation: { remedial: "", advanced: "" }
    };
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

  const gradeRules = getGradeGuidelines(gradeLevel);

  const systemInstruction = `Você é uma professora criativa do Ensino Fundamental.
  Crie uma folha de atividades para imprimir para alunos do ${gradeLevel}.
  
  DIRETRIZES OBRIGATÓRIAS DE NÍVEL (${gradeLevel}):
  ${gradeRules}

  Use o Google Search para garantir que fatos (científicos, geográficos, históricos) sejam verdadeiros e interessantes.`;

  const prompt = `Crie uma atividade escolar em JSON.
  Ano da Turma: ${gradeLevel}
  Disciplina: ${subject}
  Tema: ${theme}
  Tipo de Atividade: ${type}
  Quantidade de questões: ${count}
  Dificuldade: ${level}

  Instruções por tipo:
  - Complete: Frases com lacunas. Para 2º ano use frases curtas. Para 4º ano, parágrafos.
  - Ligue: Pares de conceitos.
  - MultiplaEscolha: Pergunta + 3 alternativas (a, b, c).
  - VerdadeiroFalso: Frases com ( ) para V ou F.
  - Probleminhas: Histórias matemáticas. No 2º ano: passo único. No 4º ano: múltiplos passos.
  - AtividadeAvaliativa: Mistura de questões para sondagem.

  Gere questões variadas e criativas, respeitando rigorosamente o nível cognitivo do ${gradeLevel}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
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
                  instruction: { type: Type.STRING, description: "Enunciado da questão." },
                  content: { type: Type.STRING, description: "O conteúdo da questão. Use \\n para quebras de linha." },
                  answer: { type: Type.STRING, description: "Gabarito para o professor." }
                },
                required: ["instruction", "content", "answer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    const questions = (data.questions || []).map((q: any) => ({
      ...q,
      id: generateId()
    }));

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
    console.error("Erro ao gerar atividade:", error);
    return {
      id: generateId(),
      createdAt: Date.now(),
      subject,
      theme,
      type,
      level,
      gradeLevel,
      schoolHeader: { studentName: true, date: true, teacherName: true },
      questions: [{ id: generateId(), instruction: "Erro", content: "Não foi possível gerar a atividade no momento.", answer: "" }]
    };
  }
};