import React, { useEffect, useState } from 'react';

interface HomeProps {
  onNavigate: (view: 'planner' | 'activity') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Previne o mini-infobar padrão do Chrome
      e.preventDefault();
      // Salva o evento para disparar depois
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostra o prompt de instalação
    deferredPrompt.prompt();
    
    // Espera a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Limpa o prompt (só pode ser usado uma vez)
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden pb-24">
      
      {/* Blobs de fundo ajustados para não vazar */}
      <div className="absolute top-[-10%] left-[-20%] md:left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-yellow/20 rounded-full blur-[60px] md:blur-[80px] -z-10 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-20%] md:right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-blue/20 rounded-full blur-[60px] md:blur-[80px] -z-10 mix-blend-multiply"></div>

      <div className="max-w-3xl w-full text-center space-y-8 md:space-y-12 z-10">
        
        <div className="space-y-4 md:space-y-6">
          <div className="inline-block transform -rotate-2 hover:rotate-2 transition-transform cursor-default">
             <span className="bg-brand-orange text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase shadow-md border-2 border-white/50">
               Para Professoras do 2º Ano
             </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-pencil leading-none tracking-tight">
            Edu<span className="text-brand-orange underline decoration-wavy decoration-4 decoration-brand-yellow">Brinca</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-xs md:max-w-lg mx-auto leading-relaxed font-medium">
            Seu assistente criativo para planejar aulas e criar atividades imprimíveis em minutos.
          </p>

          {/* Botão de Instalação (PWA) - Só aparece se suportado */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="pwa-install-btn animate-bounce inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-700 transition-colors"
            >
              <span>📲</span> Instalar App no Celular
            </button>
          )}
        </div>

        {/* Grid de Ações Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-12 px-0 md:px-4 w-full">
          <button 
            onClick={() => onNavigate('planner')}
            className="group relative bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-neopop hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg transition-all text-left overflow-hidden w-full touch-manipulation active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity text-7xl md:text-9xl">📝</div>
            <div className="text-5xl md:text-6xl mb-4 md:mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block">📝</div>
            <h3 className="text-xl md:text-2xl font-bold text-pencil mb-1 md:mb-2 group-hover:text-brand-orange transition-colors">Planejamento</h3>
            <p className="text-slate-400 font-medium text-sm md:text-base">Crie roteiros de aula completos, passo a passo.</p>
          </button>

          <button 
            onClick={() => onNavigate('activity')}
            className="group relative bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border-2 border-slate-100 shadow-neopop hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg transition-all text-left overflow-hidden w-full touch-manipulation active:scale-[0.98]"
          >
             <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity text-7xl md:text-9xl">✂️</div>
            <div className="text-5xl md:text-6xl mb-4 md:mb-6 transform group-hover:scale-110 transition-transform duration-300 inline-block">✂️</div>
            <h3 className="text-xl md:text-2xl font-bold text-pencil mb-1 md:mb-2 group-hover:text-brand-blue transition-colors">Atividades</h3>
            <p className="text-slate-400 font-medium text-sm md:text-base">Gere folhas de exercícios prontas para imprimir.</p>
          </button>
        </div>
      </div>
    </div>
  );
};