import React, { useState } from 'react';
import { PageLayout, Button, Input, Select, Card } from '../components/UI';
import { generateActivity } from '../services/generator';
import { Subject, ClassLevel, ActivityType, ActivitySheet, GradeLevel } from '../types';

interface ActivityCreatorProps {
  onBack: () => void;
}

const ACTIVITY_TYPES: { label: string; value: ActivityType }[] = [
  { label: 'Complete as Frases', value: 'Complete' },
  { label: 'Ligue as Colunas', value: 'Ligue' },
  { label: 'Múltipla Escolha', value: 'MultiplaEscolha' },
  { label: 'Verdadeiro ou Falso', value: 'VerdadeiroFalso' },
  { label: 'Desenhe e Escreva', value: 'DesenheEscreva' },
  { label: 'Probleminhas Matemáticos', value: 'Probleminhas' },
  { label: 'Atividade Avaliativa (Mix)', value: 'AtividadeAvaliativa' },
];

export const ActivityCreator: React.FC<ActivityCreatorProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [showAnswers, setShowAnswers] = useState(false);
  const [isOnePageMode, setIsOnePageMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: 'Português' as Subject,
    theme: '',
    type: 'Complete' as ActivityType,
    count: 6, 
    level: 'Regular' as ClassLevel,
    gradeLevel: '2º Ano' as GradeLevel,
  });

  const [generatedActivity, setGeneratedActivity] = useState<ActivitySheet | null>(null);

  const handleGenerate = async () => {
    if (!formData.theme) {
      alert("Digite um tema!");
      return;
    }
    
    setIsLoading(true);
    try {
      const activity = await generateActivity(
        formData.subject,
        formData.theme,
        formData.type,
        formData.count,
        formData.level,
        formData.gradeLevel
      );
      setGeneratedActivity(activity);
      setStep('preview');
      setShowAnswers(false);
      
      // Sempre ativar modo 1 folha para exercícios e avaliações inicialmente
      setIsOnePageMode(true);
    } catch (error) {
      alert("Erro ao gerar atividade. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // 1. Configurar CSS do Body
    if (isOnePageMode) {
      document.body.classList.remove('print-multipage');
      document.body.classList.add('print-onepage');
    } else {
      document.body.classList.remove('print-onepage');
      document.body.classList.add('print-multipage');
    }

    // 2. Scroll para o topo para evitar cortes
    window.scrollTo(0, 0);

    const element = document.querySelector('.print-area');
    
    // 3. Configuração Otimizada para Mobile
    const opt = {
      margin: 0, 
      filename: `atividade-${formData.theme.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 3, // Otimizado
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 1200 // Simula desktop
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    await window.html2pdf().set(opt).from(element).save();
  };

  if (step === 'form') {
    return (
      <PageLayout title="Criar Atividade" onBack={onBack}>
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-brand-blue text-sm font-bold mb-4 flex items-center gap-2">
                <span>✂️</span> Vamos montar uma folha de exercícios personalizada com Google AI!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
                <Select 
                  label="Ano da Turma"
                  options={['2º Ano', '3º Ano', '4º Ano']}
                  value={formData.gradeLevel}
                  onChange={e => setFormData({...formData, gradeLevel: e.target.value as GradeLevel})}
                />
                <Select 
                  label="Disciplina"
                  options={['Português', 'Matematica', 'Ciências', 'História', 'Geografia']}
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value as Subject})}
                />
              </div>

              <Input 
                label="Tema da atividade" 
                placeholder="Ex: Animais Vertebrados, Tabuada do 2..."
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
                <Select 
                  label="Tipo de Questão"
                  options={ACTIVITY_TYPES}
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ActivityType})}
                />
                <Select 
                  label="Quantidade"
                  options={['3', '5', '6', '8', '10']}
                  value={formData.count}
                  onChange={e => setFormData({...formData, count: Number(e.target.value)})}
                />
              </div>
              <Select 
                label="Dificuldade (Diferenciação)"
                options={['Regular', 'Reforço']}
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value as ClassLevel})}
              />
              <div className="pt-6">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  size="lg" 
                  variant="secondary"
                  disabled={isLoading}
                >
                  {isLoading ? '🎨 PENSANDO...' : '🎨 Gerar Material'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Definição de cores
  const subjectColors: Record<string, string> = {
    'Português': 'text-brand-pink border-brand-pink/30 bg-pink-50',
    'Matematica': 'text-brand-blue border-brand-blue/30 bg-blue-50',
    'Ciências': 'text-brand-green border-brand-green/30 bg-green-50',
    'História': 'text-brand-yellow border-brand-yellow/30 bg-yellow-50',
    'Geografia': 'text-brand-purple border-brand-purple/30 bg-purple-50',
  };
  
  const accentColor = subjectColors[formData.subject] || subjectColors['Português'];
  const dotColorClass = accentColor.includes('pink') ? 'bg-brand-pink' :
                        accentColor.includes('blue') ? 'bg-brand-blue' :
                        accentColor.includes('green') ? 'bg-brand-green' :
                        accentColor.includes('yellow') ? 'bg-brand-yellow' : 'bg-brand-purple';

  // Lógica de 1 Página: Garante o corte de conteúdo
  const MAX_ONE_PAGE_QUESTIONS = 6;
  let displayQuestions = generatedActivity?.questions || [];
  const wasReduced = isOnePageMode && displayQuestions.length > MAX_ONE_PAGE_QUESTIONS;
  
  if (wasReduced) {
    displayQuestions = displayQuestions.slice(0, MAX_ONE_PAGE_QUESTIONS);
  }
  
  const isAssessment = generatedActivity?.type === 'AtividadeAvaliativa';

  return (
    <PageLayout 
      title={isAssessment ? "Sondagem Criada" : "Atividade Pronta"} 
      onBack={() => setStep('form')}
      actions={
        <div className="flex gap-2 items-center">
           <label className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors mr-2 select-none">
            <input 
              type="checkbox" 
              checked={isOnePageMode} 
              onChange={(e) => setIsOnePageMode(e.target.checked)}
              className="w-5 h-5 accent-brand-orange rounded"
            />
            <span className="text-sm font-bold text-slate-600">Modo 1 Folha</span>
          </label>

          <Button variant="ghost" className="text-xs md:text-base px-2 md:px-4" onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? 'Ocultar' : 'Respostas'}
          </Button>
          <Button variant="primary" className="text-sm md:text-base px-3 md:px-6" onClick={handleDownloadPDF}>
             <span className="hidden md:inline">📥 </span>Baixar PDF
          </Button>
        </div>
      }
    >
      {generatedActivity && (
        <div className="flex flex-col gap-6 items-center w-full">

          {/* Aviso UX */}
           {isOnePageMode ? (
            <div className="bg-green-100 text-green-700 text-xs py-1 px-3 rounded-full flex items-center gap-1 font-bold text-center">
               <span>📲</span> Arraste para o lado para ver a folha inteira
            </div>
           ) : (
             <div className="bg-slate-100 text-slate-500 text-xs py-1 px-3 rounded-full">
               Modo livre (Várias páginas)
             </div>
           )}
          
          {/* Wrapper Scrollável para Mobile */}
          <div className="w-full overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="print-area bg-white p-[1.5cm] w-[210mm] min-w-[210mm] shadow-sheet relative text-slate-700 font-sans min-h-[29.7cm] box-border transition-all duration-300 mx-auto">
              
              {/* Header Infantil / Crachá */}
              <div className={`school-header mb-8 border-2 border-dashed rounded-2xl p-4 flex flex-col gap-3 ${accentColor.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 ')}`}>
                 <div className="school-header-content flex flex-col gap-3 w-full">
                   <div className="flex justify-between items-center w-full">
                     <div className="flex gap-2 items-center flex-1">
                       <span className="text-2xl">🏫</span>
                       <div className="flex flex-col w-full max-w-[200px]">
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Escola</span>
                         <div className="h-6 border-b-2 border-slate-300 w-full"></div>
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Data</span>
                        <div className="h-6 border-b-2 border-slate-300 w-32"></div>
                     </div>
                   </div>
                   
                   <div className="flex gap-4 items-center mt-2 w-full">
                      <span className="text-2xl">🎓</span>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Nome do(a) Aluno(a) • {generatedActivity.gradeLevel}</span>
                        <div className="h-6 border-b-2 border-slate-300 w-full"></div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Título da Atividade */}
              <div className="text-center mb-10 relative">
                <span className={`activity-meta inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border ${accentColor}`}>
                  {isAssessment ? 'Sondagem' : 'Atividade'} • {generatedActivity.gradeLevel} • {formData.subject}
                </span>
                <h2 className="activity-title font-display text-4xl font-bold text-slate-800 tracking-tight leading-tight">
                  {generatedActivity.theme}
                </h2>
                
                {/* Frase Acolhedora para Avaliação */}
                {isAssessment ? (
                   <div className="activity-meta mt-3 bg-slate-100 rounded-lg py-2 px-4 inline-block text-slate-500 text-sm italic border border-slate-200">
                      "Faça com calma e atenção. Você consegue! 😊"
                   </div>
                ) : (
                  <div className="activity-meta mt-2 flex justify-center gap-2 text-slate-400 text-sm">
                     <span>⭐ Vamos caprichar?</span>
                     <span>•</span>
                     <span>Você consegue! ⭐</span>
                  </div>
                )}
              </div>

              {/* Lista de Questões */}
              <div className="space-y-8">
                {displayQuestions.map((q, index) => (
                  <div key={q.id} className="question-container avoid-break mb-8 relative pl-2">
                    <div className="flex gap-4">
                       {/* Número na Bolinha */}
                       <div className={`flex-shrink-0 w-10 h-10 rounded-full ${dotColorClass} text-white font-display font-bold text-xl flex items-center justify-center shadow-sm print:print-color-adjust-exact`}>
                         {index + 1}
                       </div>

                       <div className="w-full pt-1">
                         <div className="question-text font-bold text-lg text-slate-800 leading-snug mb-3 font-display">
                           {q.instruction}
                         </div>
                         
                         <div className="question-text text-lg whitespace-pre-wrap leading-relaxed text-slate-600 pl-1">
                           {q.content}
                         </div>

                         {!q.content.includes('(   )') && !q.instruction.includes('Ligue') && !q.content.includes('Cruzadinha') && !q.content.includes('a)') && (
                            <div className="mt-6 space-y-5 print:block">
                               <div className="writing-line border-b-2 border-dotted border-slate-300 h-10 w-full relative group">
                                  <span className="absolute left-0 bottom-1 text-slate-200 text-xs select-none">R:</span>
                               </div>
                               {(q.instruction.toLowerCase().includes('escreva') || q.instruction.toLowerCase().includes('liste') || q.instruction.toLowerCase().includes('texto') || isAssessment) && (
                                 <div className="writing-line border-b-2 border-dotted border-slate-300 h-10 w-full"></div>
                               )}
                            </div>
                         )}
                         
                         {q.instruction.toLowerCase().includes('desenhe') && (
                           <div className="drawing-box mt-4 border-2 border-dashed border-slate-300 rounded-xl h-48 w-full bg-slate-50/50 flex items-center justify-center text-slate-300 text-sm font-bold uppercase tracking-widest">
                             Espaço para sua arte 🎨
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rodapé Pedagógico */}
              <div className="footer-message mt-auto pt-12 text-center pb-4">
                 <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
                   <span>✏️</span> {isAssessment ? 'Sondagem realizada em sala de aula' : 'Atividade desenvolvida com carinho'} <span>❤️</span>
                 </div>
              </div>

              {/* Sources / Grounding */}
              {generatedActivity.sources && generatedActivity.sources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-100 no-print">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Fontes Verificadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedActivity.sources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-brand-blue truncate max-w-[150px]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gabarito */}
          {showAnswers && (
            <div className="no-print max-w-[21cm] w-full bg-white p-8 rounded-[2rem] border-4 border-brand-green/20 shadow-neopop relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">👩‍🏫</div>
              <h3 className="font-display font-bold text-brand-green text-2xl mb-6 flex items-center gap-2">
                <span>✅</span> Gabarito da Professora
              </h3>
              <ul className="space-y-4">
                {displayQuestions.map((q, i) => (
                  <li key={q.id} className="text-slate-700 flex gap-4 border-b border-dashed border-slate-200 pb-2 last:border-0">
                    <strong className="bg-brand-green text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">{i + 1}</strong> 
                    <span className="flex-1 mt-0.5 font-medium">{q.answer || 'Resposta pessoal / Desenho'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </PageLayout>
  );
};