
import { saveToDB } from './db';
import { LessonPlan, ActivitySheet, Subject, ActivityQuestion } from '../types';

// --- HELPER: Mapeamento de Temas para Disciplinas ---
const mapSubject = (theme: string): Subject => {
  const t = theme.toLowerCase();
  if (t.includes('matemática') || t.includes('números')) return 'Matematica';
  if (t.includes('ciências') || t.includes('corpo') || t.includes('animais')) return 'Ciências';
  if (t.includes('história') || t.includes('tempo') || t.includes('rotina')) return 'História';
  if (t.includes('geografia') || t.includes('espaço') || t.includes('mapa')) return 'Geografia';
  // Default e Artes/Socioemocional caem em Português ou o mais próximo
  return 'Português';
};

// --- HELPER: Processamento do Formato de Repositório (O arquivo do usuário) ---
const processRepositoryFormat = (data: any): { plans: LessonPlan[], activities: ActivitySheet[] } => {
  const plans: LessonPlan[] = [];
  const activities: ActivitySheet[] = [];

  if (!Array.isArray(data.categorias)) return { plans, activities };

  data.categorias.forEach((cat: any) => {
    const subject = mapSubject(cat.tema);
    
    if (Array.isArray(cat.faixas_etarias)) {
      cat.faixas_etarias.forEach((faixa: any) => {
        const gradeLevel = faixa.faixa_etaria === '4-6' ? '2º Ano' : 
                           faixa.faixa_etaria === '7-9' ? '3º Ano' : '4º Ano';

        // 1. Converter Aulas
        if (Array.isArray(faixa.aulas)) {
          faixa.aulas.forEach((aula: any) => {
            const plan: LessonPlan = {
              id: aula.id || Math.random().toString(36).substring(7),
              createdAt: Date.now(),
              subject: subject,
              theme: aula.titulo || "Aula Importada",
              gradeLevel: gradeLevel,
              duration: 50,
              level: aula.nivel_dificuldade === 'facil' ? 'Reforço' : 'Regular',
              objective: typeof aula.meta_pedagogica === 'string' ? aula.meta_pedagogica : (aula.objetivos?.[0] || "Objetivo importado"),
              materials: Array.isArray(aula.materiais) ? aula.materiais : ['Caderno', 'Lápis'],
              steps: Array.isArray(aula.passo_a_passo) ? aula.passo_a_passo.map((p: string, i: number) => ({
                time: '10 min',
                title: `Passo ${i + 1}`,
                description: p
              })) : [],
              differentiation: {
                remedial: "Apoio individualizado e uso de materiais concretos.",
                advanced: "Incentivar registro detalhado e ajuda aos colegas."
              },
              sources: []
            };
            plans.push(plan);
          });
        }

        // 2. Converter Exercícios em uma Folha de Atividade
        if (Array.isArray(faixa.exercicios) && faixa.exercicios.length > 0) {
          const questions: ActivityQuestion[] = faixa.exercicios.map((ex: any) => {
            let content = "";
            
            // Formatar Múltipla Escolha
            if (ex.tipo === 'multipla_escolha' && Array.isArray(ex.opcoes)) {
              content = ex.pergunta + "\n\n" + ex.opcoes.map((opt: string) => `(   ) ${opt}`).join('\n');
            } 
            // Formatar Associação
            else if (ex.tipo === 'associacao' && Array.isArray(ex.itens)) {
              content = ex.pergunta + "\n\n" + ex.itens.map((item: any) => `${item.figura} ----------- ${item.letra_correta || '____'}`).join('\n');
            }
            // Padrão (Aberta/Outros)
            else {
              content = ex.pergunta;
            }

            return {
              id: ex.id || Math.random().toString(36).substring(7),
              instruction: ex.tipo === 'multipla_escolha' ? 'Marque a opção correta:' : 'Responda:',
              content: content,
              answer: ex.resposta
            };
          });

          const sheet: ActivitySheet = {
            id: Math.random().toString(36).substring(7),
            createdAt: Date.now(),
            subject: subject,
            theme: `${cat.tema} - Exercícios`,
            gradeLevel: gradeLevel,
            type: 'AtividadeAvaliativa', // Mix de exercícios
            level: 'Regular',
            schoolHeader: { studentName: true, date: true, teacherName: true },
            questions: questions,
            sources: []
          };
          activities.push(sheet);
        }
      });
    }
  });

  return { plans, activities };
};

// --- FUNÇÕES ORIGINAIS (Mantidas como fallback) ---
const isLessonPlan = (item: any): boolean => {
  return (
    item && typeof item === 'object' && typeof item.theme === 'string' &&
    (Array.isArray(item.steps) || typeof item.objective === 'string' || item.subject) &&
    !item.questions
  );
};

const isActivitySheet = (item: any): boolean => {
  return (
    item && typeof item === 'object' && typeof item.theme === 'string' &&
    Array.isArray(item.questions)
  );
};

const scanForContent = (data: any): { plans: any[], activities: any[] } => {
  const foundPlans: any[] = [];
  const foundActivities: any[] = [];
  const MAX_DEPTH = 3;

  const checkAndAdd = (item: any) => {
    if (isActivitySheet(item)) foundActivities.push(item);
    else if (isLessonPlan(item)) foundPlans.push(item);
  };

  const traverse = (node: any, depth: number = 0) => {
    if (!node || typeof node !== 'object' || depth > MAX_DEPTH) return;
    if (Array.isArray(node)) {
      node.forEach(item => {
        checkAndAdd(item);
        if (!isLessonPlan(item) && !isActivitySheet(item)) traverse(item, depth + 1);
      });
    } else {
      checkAndAdd(node);
      Object.keys(node).forEach(key => {
        if (key !== 'meta' && key !== 'config') traverse(node[key], depth + 1);
      });
    }
  };

  if (Array.isArray(data.plans)) data.plans.forEach((p: any) => foundPlans.push(p));
  if (Array.isArray(data.activities)) data.activities.forEach((a: any) => foundActivities.push(a));

  if (foundPlans.length === 0 && foundActivities.length === 0) traverse(data);

  return { plans: foundPlans, activities: foundActivities };
};

/**
 * Lê um arquivo JSON do computador do usuário e restaura no Banco de Dados.
 */
export const restoreFromFile = async (file: File): Promise<void> => {
  console.log("Iniciando leitura do arquivo de backup...");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonContent = e.target?.result as string;
        let data: any;
        
        try {
          data = JSON.parse(jsonContent);
        } catch (jsonError) {
          throw new Error("O arquivo selecionado não é um arquivo JSON válido.");
        }

        if (!data || typeof data !== 'object') throw new Error("Conteúdo inválido.");

        let plans: any[] = [];
        let activities: any[] = [];

        // ESTRATÉGIA DE SELEÇÃO DE FORMATO
        // 1. Verifica se é o formato "Repositório EduBrinca" (arquivo do usuário)
        if (data.meta && Array.isArray(data.categorias)) {
           console.log("Detectado formato de Repositório Educacional. Convertendo...");
           const result = processRepositoryFormat(data);
           plans = result.plans;
           activities = result.activities;
        } 
        // 2. Fallback: Tenta formato nativo ou varredura genérica
        else {
           console.log("Detectado formato genérico/nativo. Escaneando...");
           const result = scanForContent(data);
           plans = result.plans;
           activities = result.activities;
        }
        
        const totalFound = plans.length + activities.length;
        
        if (totalFound === 0) {
          const keys = !Array.isArray(data) ? Object.keys(data).join(', ') : 'Array';
          throw new Error(`Não foram encontrados dados compatíveis. Estrutura: [${keys}].`);
        }

        console.log(`Importando: ${plans.length} planos, ${activities.length} atividades.`);

        // Processamento
        for (const plan of plans) {
          if (!plan.id) plan.id = Math.random().toString(36).substring(2, 15);
          await saveToDB('plans', plan);
        }

        for (const act of activities) {
          if (!act.id) act.id = Math.random().toString(36).substring(2, 15);
          await saveToDB('activities', act);
        }

        console.log("Importação concluída.");
        resolve();
      } catch (error: any) {
        console.error("Erro ao processar backup:", error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    reader.onerror = () => reject(new Error("Erro de leitura do arquivo."));
    reader.readAsText(file);
  });
};
