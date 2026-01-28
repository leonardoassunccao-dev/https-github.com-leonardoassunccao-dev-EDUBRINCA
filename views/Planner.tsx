import React, { useState } from 'react';
import { PageLayout, Button, Input, Select, Card } from '../components/UI';
import { generateLessonPlan } from '../services/generator';
import { Subject, ClassLevel, LessonPlan, GradeLevel } from '../types';

interface PlannerProps {
  onBack: () => void;
}

export const Planner: React.FC<PlannerProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'Português' as Subject,
    theme: '',
    duration: 50,
    level: 'Regular' as ClassLevel,
    gradeLevel: '2º Ano' as GradeLevel,
    objective: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  const handleGenerate = async () => {
    if (!formData.theme) {
      alert("Por favor, digite um tema!");
      return;
    }
    
    setIsLoading(true);
    try {
      const plan = await generateLessonPlan(
        formData.subject,
        formData.theme,
        formData.duration,
        formData.level,
        formData.gradeLevel,
        formData.objective
      );
      setGeneratedPlan(plan);
      setStep('result');
    } catch (error) {
      alert("Ocorreu um erro ao gerar o planejamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    document.body.classList.remove('print-onepage');
    document.body.classList.add('print-multipage');
    window.scrollTo(0, 0);

    const element = document.querySelector('.print-area');
    const opt = {
      margin: 0, 
      filename: `planejamento-${formData.theme.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 3, // Otimizado para mobile (evita crash de memória em telefones)
        useCORS: true, 
        letterRendering: true, 
        scrollY: 0,
        windowWidth: 1200 // Simula desktop para layout correto
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    // @ts-ignore
    await window.html2pdf().set(opt).from(element).save();
  };

  if (step === 'form') {
    return (
      <PageLayout title="Novo Planejamento" onBack={onBack}>
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-brand-orange text-sm font-bold mb-4 flex items-center gap-2">
                <span>💡</span> Preencha os detalhes para criarmos sua aula.
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
                label="Qual o tema da aula?" 
                placeholder="Ex: Substantivos, Soma..."
                value={formData.theme}
                onChange={e => setFormData({...formData, theme: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6">
                <Select 
                  label="Duração"
                  options={['30', '40', '50', '60']}
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                />
                <Select 
                  label="Nível (Diferenciação)"
                  options={['Regular', 'Reforço', 'Avançada']}
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value as ClassLevel})}
                />
              </div>
              <Input 
                label="Objetivo específico (Opcional)" 
                placeholder="Ex: Identificar a letra A..."
                value={formData.objective}
                onChange={e => setFormData({...formData, objective: e.target.value})}
              />
              
              <div className="pt-6">
                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? '✨ PENSANDO...' : '✨ Criar Aula Mágica'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Planejamento Gerado" 
      onBack={() => setStep('form')}
      actions={
        <Button variant="primary" onClick={handleDownloadPDF} className="text-sm md:text-base px-3 md:px-6">
          <span className="hidden md:inline">📥 </span>Baixar PDF
        </Button>
      }
    >
      {generatedPlan && (
        <div className="flex flex-col gap-6 items-center w-full">
           
          {/* Aviso UX */}
          <div className="no-print bg-slate-100 text-slate-500 text-xs py-1 px-3 rounded-full flex items-center gap-1 text-center">
             <span>📲</span> Arraste para o lado para ver a folha inteira
          </div>

          {/* Container Scrollável para Mobile - Essencial para não quebrar layout */}
          <div className="w-full overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="print-area bg-white p-12 shadow-sheet min-h-[29.7cm] w-[210mm] min-w-[210mm] relative text-pencil print:shadow-none print:p-0 mx-auto">
              
              {/* Header decorativo (some na impressão) */}
              <div className="no-print absolute top-0 left-0 w-full h-4 bg-brand-orange/80"></div>
              <div className="no-print absolute top-[-15px] left-[50%] transform -translate-x-1/2 w-32 h-8 bg-yellow-100/50 rotate-[-1deg] backdrop-blur-sm border border-white shadow-sm"></div>

              <div className="mb-10 mt-6 text-center border-b pb-4 print:mt-0 print:text-left print:border-black">
                <h2 className="text-4xl font-bold mb-3 text-pencil tracking-tight print:text-black">{generatedPlan.theme}</h2>
                <div className="flex justify-center gap-3 text-sm font-bold text-slate-500 uppercase tracking-widest print:justify-start print:text-black">
                  <span className="bg-brand-orange text-white border border-brand-orange px-3 py-1 rounded-full print:bg-white print:border-black print:text-black print:px-0">
                    {generatedPlan.gradeLevel}
                  </span>
                  <span className="print:hidden">•</span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full print:bg-white print:border-black print:px-0">{generatedPlan.subject}</span>
                  <span className="print:hidden">•</span>
                  <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full print:bg-white print:border-black print:px-0">{generatedPlan.duration} min</span>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-100 mb-10 relative overflow-hidden print:bg-white print:border print:border-black print:rounded-none avoid-break">
                <h3 className="text-brand-orange font-bold text-sm uppercase mb-2 tracking-wider print:text-black">🎯 Objetivo da Aula</h3>
                <p className="text-xl font-medium leading-relaxed print:text-black">{generatedPlan.objective}</p>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-8 relative pl-4 print:pl-0">
                <div className="no-print absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200/80 border-l border-dashed border-slate-300"></div>

                {generatedPlan.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group avoid-break">
                    <div className="flex-shrink-0 z-10 print:hidden">
                      <div className="bg-brand-blue text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm shadow-md border-[3px] border-white">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="pt-1 w-full">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider bg-white inline-block px-1 print:text-black print:border-b print:border-black print:w-full print:mb-2">
                        <span className="print:inline-block print:mr-2 font-black">{idx+1}.</span>
                        {step.time} • {step.title}
                      </div>
                      <p className="text-lg text-slate-700 leading-relaxed font-medium print:text-black">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-10 border-dashed border-2 border-slate-200 print:border-black print:border-t-2 print:border-solid" />

              {/* Materials & Differentiation */}
              <div className="grid grid-cols-2 gap-10 print:block">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-none print:p-0 print:mb-6 avoid-break">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg print:text-black">
                    <span>🎒</span> Materiais
                  </h3>
                  <ul className="text-slate-600 space-y-3 print:text-black">
                    {generatedPlan.materials.map(m => (
                      <li key={m} className="flex items-start gap-3">
                        <div className="no-print w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center mt-0.5 bg-white">
                           <span className="text-brand-green font-bold text-sm">✓</span>
                        </div>
                        <span className="print:list-item print:ml-4">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4 avoid-break">
                   <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-lg px-2 print:text-black print:px-0">
                    <span>⭐</span> Adaptações ({generatedPlan.level})
                  </h3>
                  <div className="text-sm space-y-3">
                     <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-brand-yellow print:bg-white print:border print:border-black print:rounded-none avoid-break">
                       <strong className="text-slate-900 block mb-1 uppercase text-xs tracking-wide print:text-black">Reforço</strong>
                       <span className="text-slate-700 leading-snug print:text-black">{generatedPlan.differentiation.remedial}</span>
                     </div>
                     <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-brand-blue print:bg-white print:border print:border-black print:rounded-none print:mt-4 avoid-break">
                       <strong className="text-slate-900 block mb-1 uppercase text-xs tracking-wide print:text-black">Avançado</strong>
                       <span className="text-slate-700 leading-snug print:text-black">{generatedPlan.differentiation.advanced}</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Sources / Grounding */}
              {generatedPlan.sources && generatedPlan.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 no-print avoid-break">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fontes Consultadas (Google Search)</h4>
                  <ul className="text-xs text-slate-500 space-y-1">
                    {generatedPlan.sources.map((source, idx) => (
                      <li key={idx}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue underline truncate block max-w-md">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-16 text-center border-t pt-4 border-black hidden print:block">
                 <span className="text-xs font-bold text-black uppercase tracking-widest">EduBrinca • Planejamento Pedagógico</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};