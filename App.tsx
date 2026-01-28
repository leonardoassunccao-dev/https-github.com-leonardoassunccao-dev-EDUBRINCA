import React, { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Home } from './views/Home';
import { Planner } from './views/Planner';
import { ActivityCreator } from './views/ActivityCreator';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'planner' | 'activity'>('home');

  return (
    // Removido 'bg-paper' para deixar o fundo texturizado do body (definido no index.html) aparecer
    <div className="min-h-screen text-slate-800 font-sans relative">
      {view === 'home' && (
        <Home 
          onNavigate={(target) => setView(target as 'planner' | 'activity')} 
        />
      )}

      {view === 'planner' && (
        <Planner 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'activity' && (
        <ActivityCreator 
          onBack={() => setView('home')} 
        />
      )}

      <footer className="fixed bottom-0 left-0 w-full text-center py-2 bg-white/60 backdrop-blur-sm border-t border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest z-50 print:hidden select-none">
        Projeto educacional em desenvolvimento • Leonardo Assunção
      </footer>
      <SpeedInsights />
    </div>
  );
};

export default App;