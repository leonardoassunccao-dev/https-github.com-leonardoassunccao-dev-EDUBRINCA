
import React, { useEffect, useState, useRef } from 'react';
import { restoreFromFile } from '../services/libraryRestore';

interface HomeProps {
  onNavigate: (view: 'planner' | 'activity' | 'library') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const triggerFileSelect = () => {
    // Aciona o clique no input oculto
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      await restoreFromFile(file);
      setIsRestoreModalOpen(false);
      alert("Backup importado com sucesso! Você será redirecionado para a biblioteca.");
      onNavigate('library');
    } catch (error: any) {
      console.error(error);
      // Mostra a mensagem específica do erro para ajudar no diagnóstico
      alert(`Erro ao importar: ${error.message || "Verifique se o arquivo é um JSON válido."}`);
    } finally {
      setIsRestoring(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente se falhar
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden pb-24">
      <div className="absolute top-[-10%] left-[-20%] md:left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-yellow/20 rounded-full blur-[60px] md:blur-[80px] -z-10 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] md:right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-blue/20 rounded-full blur-[60px] md:blur-[80px] -z-10 mix-blend-multiply"></div>

      <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12 z-10 relative">
        <div className="space-y-4 md:space-y-6">
          <div className="inline-block transform -rotate-2 hover:rotate-2 transition-transform cursor-default">
             <span className="bg-brand-orange text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase shadow-md border-2 border-white/50">
               Assistente Offline-First
             </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-pencil leading-none tracking-tight">
            Edu<span className="text-brand-orange underline decoration-wavy decoration-4 decoration-brand-yellow">Brinca</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-xs md:max-w-lg mx-auto leading-relaxed font-medium">
            Planeje suas aulas e atividades em qualquer lugar, com ou sem internet.
          </p>
          
          {/* BOTÃO IMPORTAR BACKUP */}
          <button 
            onClick={() => setIsRestoreModalOpen(true)}
            className="mt-4 bg-brand-orange text-white font-bold py-3 px-8 rounded-full shadow-button shadow-red-300 hover:bg-[#FF7A5C] transition-all active:translate-y-1 active:shadow-none flex items-center gap-3 mx-auto w-full max-w-[320px] justify-center text-lg md:text-xl"
          >
            <span>📂</span> IMPORTAR BACKUP
          </button>

          {/* Input oculto para arquivo */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
          />

          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="pwa-install-btn animate-bounce inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-700 transition-colors mt-4"
            >
              <span>📲</span> Instalar App no Celular
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-0 md:px-4 w-full">
          <button 
            onClick={() => onNavigate('planner')}
            className="group relative bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 shadow-neopop hover:-translate-y-1 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform inline-block">📝</div>
            <h3 className="text-lg font-bold text-pencil mb-1 group-hover:text-brand-orange">Planejamento</h3>
            <p className="text-slate-400 text-xs">Roteiros de aula completos.</p>
          </button>

          <button 
            onClick={() => onNavigate('activity')}
            className="group relative bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 shadow-neopop hover:-translate-y-1 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform inline-block">✂️</div>
            <h3 className="text-lg font-bold text-pencil mb-1 group-hover:text-brand-blue">Atividades</h3>
            <p className="text-slate-400 text-xs">Folhas prontas para imprimir.</p>
          </button>

          <button 
            onClick={() => onNavigate('library')}
            className="group relative bg-brand-yellow p-6 md:p-8 rounded-[2rem] border-2 border-pencil/10 shadow-neopop hover:-translate-y-1 transition-all text-left overflow-hidden active:scale-[0.98]"
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform inline-block">📚</div>
            <h3 className="text-lg font-bold text-pencil mb-1">Biblioteca</h3>
            <p className="text-pencil/50 text-xs">Seus arquivos salvos localmente.</p>
          </button>
        </div>
      </div>

      {/* MODAL DE RESTAURAÇÃO */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-6 md:p-8 text-center transform transition-all scale-100 border-4 border-brand-orange/10">
            <div className="w-20 h-20 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">
              📂
            </div>
            <h3 className="text-2xl font-display font-bold text-pencil mb-3">Restaurar Biblioteca</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Selecione um arquivo de backup (<strong>.json</strong>) do seu computador para recuperar suas aulas e atividades salvas.
            </p>
            
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <button 
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors w-full md:w-auto"
                disabled={isRestoring}
              >
                Cancelar
              </button>
              <button 
                onClick={triggerFileSelect}
                className="px-8 py-3 rounded-xl font-bold bg-brand-orange text-white shadow-button shadow-red-200 hover:bg-[#FF7A5C] transition-colors flex items-center justify-center gap-2 w-full md:w-auto active:translate-y-1 active:shadow-none"
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Lendo arquivo...
                  </>
                ) : (
                  'Selecionar Arquivo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
