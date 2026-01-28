
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, ActivitySheet, Subject, ClassLevel, ActivityType, GradeLevel, Source } from '../types';
import { LOCAL_OBJECTIVES, LOCAL_STEPS_TEMPLATES, getLocalActivityQuestions } from './localData';
import { saveToDB } from './db';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Inicialização segura do Gemini
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLessonPlan = async (
  subject: Subject,
  theme: string,
  duration: number,
  level: ClassLevel,
  gradeLevel: GradeLevel,
  customObjective?: string
): Promise<LessonPlan> => {
  
  if (navigator.onLine) {
    try {
      const ai = getAI();
      const prompt = `Atue como uma coordenadora pedagógica experiente. 
      Crie um plano de aula detalhado para alunos do ${gradeLevel} sobre o tema "${theme}" na disciplina de ${subject}.
      O nível da turma é: ${level}.
      ${customObjective ? `O objetivo principal deve ser: ${customObjective}` : ''}
      O plano deve ser criativo, lúdico e adequado à idade.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING, description: "Objetivo pedagógico claro" },
              materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de materiais necessários" },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING, description: "Tempo estimado (ex: 10 min)" },
                    title: { type: Type.STRING, description: "Título da etapa" },
                    description: { type: Type.STRING, description: "Explicação detalhada da atividade" },
                  },
                  required: ["time", "title", "description"]
                }
              },
              differentiation: {
                type: Type.OBJECT,
                properties: {
                  remedial: { type: Type.STRING, description: "Dica para alunos com dificuldade" },
                  advanced: { type: Type.STRING, description: "Desafio para alunos avançados" },
                },
                required: ["remedial", "advanced"]
              }
            },
            required: ["objective", "materials", "steps", "differentiation"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        ?.map(chunk => ({ uri: chunk.web!.uri, title: chunk.web!.title || "Fonte Consultada" })) || [];

      const plan: LessonPlan = {
        id: generateId(),
        createdAt: Date.now(),
        subject, theme, duration, level, gradeLevel,
        objective: data.objective,
        materials: data.materials,
        steps: data.steps,
        differentiation: data.differentiation,
        sources: sources
      };

      await saveToDB('plans', plan);
      return plan;
    } catch (e) {
      console.error("Erro na geração com Gemini:", e);
    }
  }

  // Fallback Offline se a API falhar ou estiver sem internet
  const randomObjective = LOCAL_OBJECTIVES[subject][Math.floor(Math.random() * LOCAL_OBJECTIVES[subject].length)];
  const plan: LessonPlan = {
    id: generateId(),
    createdAt: Date.now(),
    subject, theme, duration, level, gradeLevel,
    objective: customObjective || `${randomObjective} (Foco: ${theme})`,
    materials: ['Caderno', 'Lápis', 'Quadro', 'Recursos do professor'],
    steps: LOCAL_STEPS_TEMPLATES.map(s => ({
      ...s,
      description: s.description.replace('[TEMA]', theme)
    })),
    differentiation: {
      remedial: "Apoio visual e repetição de comandos.",
      advanced: "Desafio de criação autônoma sobre o tema."
    },
    sources: []
  };

  await saveToDB('plans', plan);
  return plan;
};

export const generateActivity = async (
  subject: Subject,
  theme: string,
  type: ActivityType,
  count: number,
  level: ClassLevel,
  gradeLevel: GradeLevel
): Promise<ActivitySheet> => {

  if (navigator.onLine) {
    try {
      const ai = getAI();
      const prompt = `Crie uma folha de atividades escolar para o ${gradeLevel}.
      Disciplina: ${subject}. Tema: ${theme}. Tipo de exercício: ${type}.
      Nível de dificuldade: ${level}. Gere exatamente ${count} questões.
      Formate o conteúdo das questões com linhas pontilhadas (______) onde o aluno deve escrever.
      Se for 'Ligue', use formatos como 'A) Item --- 1) Definição'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING, description: "O comando da questão (ex: Ligue os pontos)" },
                    content: { type: Type.STRING, description: "O corpo da questão ou os itens" },
                    answer: { type: Type.STRING, description: "Gabarito para o professor" },
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
      
      const activity: ActivitySheet = {
        id: generateId(),
        createdAt: Date.now(),
        subject, theme, type, level, gradeLevel,
        schoolHeader: { studentName: true, date: true, teacherName: true },
        questions: data.questions.map((q: any) => ({ ...q, id: generateId() })),
        sources: []
      };

      await saveToDB('activities', activity);
      return activity;
    } catch (e) {
      console.error("Erro na geração de atividade com Gemini:", e);
    }
  }

  // Fallback Offline
  const activity: ActivitySheet = {
    id: generateId(),
    createdAt: Date.now(),
    subject, theme, type, level, gradeLevel,
    schoolHeader: { studentName: true, date: true, teacherName: true },
    questions: getLocalActivityQuestions(theme, type, count).map(q => ({ ...q, id: generateId() })),
    sources: []
  };

  await saveToDB('activities', activity);
  return activity;
};
