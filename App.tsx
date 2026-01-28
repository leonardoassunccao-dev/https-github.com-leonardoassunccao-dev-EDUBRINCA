
import React, { useState, useEffect } from 'react';
import { Home } from './views/Home';
import { Planner } from './views/Planner';
import { ActivityCreator } from './views/ActivityCreator';
import { Library } from './views/Library';
import { getAllFromDB, deleteFromDB } from './services/db';
import { AppState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'planner' | 'activity' | 'library'>('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbData, setDbData] = useState<AppState>({ plans: [], activities: [] });

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    loadData();

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const loadData = async () => {
    const plans = await getAllFromDB('plans');
    const activities = await getAllFromDB('activities');
    setDbData({ plans, activities });
  };

  const handleDelete = async (type: 'plan' | 'activity', id: string) => {
    await deleteFromDB(type === 'plan' ? 'plans' : 'activities', id);
    loadData();
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans relative">
      {/* Conectivity Indicator - Top Bar */}
      <div className={`fixed top-0 left-0 w-full h-1 z-[60] transition-colors duration-500 ${isOnline ? 'bg-green-400' : 'bg-orange-400'}`}></div>
      
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-[60] shadow-md animate-bounce">
          📴 Modo Offline Ativo
        </div>
      )}

      <main className="pb-16"> {/* Padding bottom para não cobrir conteúdo com o rodapé */}
        {view === 'home' && (
          <Home 
            onNavigate={(target) => {
              if (target === 'library') loadData();
              setView(target as any);
            }} 
          />
        )}

        {view === 'planner' && <Planner onBack={() => { loadData(); setView('home'); }} />}
        {view === 'activity' && <ActivityCreator onBack={() => { loadData(); setView('home'); }} />}
        {view === 'library' && (
          <Library 
            data={dbData} 
            onBack={() => setView('home')} 
            onDelete={handleDelete}
            onLoadPlan={() => {}}
            onLoadActivity={() => {}}
          />
        )}
      </main>

      {/* Rodapé Restaurado com Assinatura do Usuário */}
      <footer className="fixed bottom-0 left-0 w-full py-3 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 print:hidden select-none">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></span>
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              {isOnline ? 'Sistema Online' : 'Motor Local Offline'} • EduBrinca v2.1
            </span>
          </div>
          
          <div className="text-pencil/40 text-[10px] font-medium tracking-tight">
            Desenvolvido com ❤️ por <span className="font-bold text-brand-orange uppercase">Leonardo Assunção</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
