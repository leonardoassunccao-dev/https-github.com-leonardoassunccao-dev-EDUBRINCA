import React, { useState } from 'react';
import { PageLayout, Card, Button, Input } from '../components/UI';
import { AppState, LessonPlan, ActivitySheet } from '../types';

interface LibraryProps {
  onBack: () => void;
  data: AppState;
  onDelete: (type: 'plan' | 'activity', id: string) => void;
  onLoadPlan: (plan: LessonPlan) => void; // For re-viewing (not implemented fully in MVP, just view)
  onLoadActivity: (activity: ActivitySheet) => void;
}

export const Library: React.FC<LibraryProps> = ({ onBack, data, onDelete }) => {
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'activities'>('plans');

  const filteredPlans = data.plans.filter(p => 
    p.theme.toLowerCase().includes(filter.toLowerCase()) || 
    p.subject.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredActivities = data.activities.filter(a => 
    a.theme.toLowerCase().includes(filter.toLowerCase()) || 
    a.subject.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <PageLayout title="Meus Materiais" onBack={onBack}>
      <div className="mb-6">
        <Input 
          label="Pesquisar" 
          placeholder="Busque por tema ou disciplina..." 
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`text-xl font-bold pb-2 ${activeTab === 'plans' ? 'text-primary border-b-4 border-primary' : 'text-slate-400'}`}
        >
          Planejamentos ({data.plans.length})
        </button>
        <button 
          onClick={() => setActiveTab('activities')}
          className={`text-xl font-bold pb-2 ${activeTab === 'activities' ? 'text-secondary border-b-4 border-secondary' : 'text-slate-400'}`}
        >
          Atividades ({data.activities.length})
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeTab === 'plans' ? (
          filteredPlans.length === 0 ? <p className="text-slate-400 italic">Nenhum planejamento encontrado.</p> :
          filteredPlans.map(plan => (
            <Card key={plan.id} className="relative group hover:border-primary transition-colors cursor-default">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">{plan.subject}</span>
                <span className="text-slate-400 text-xs">{new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-xl text-ink mb-1">{plan.theme}</h3>
              <p className="text-slate-500 text-sm line-clamp-2">{plan.objective}</p>
              
              <div className="mt-4 flex gap-2 justify-end">
                <button 
                   onClick={() => onDelete('plan', plan.id)}
                   className="text-red-400 text-sm hover:text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </Card>
          ))
        ) : (
          filteredActivities.length === 0 ? <p className="text-slate-400 italic">Nenhuma atividade encontrada.</p> :
          filteredActivities.map(activity => (
            <Card key={activity.id} className="relative group hover:border-secondary transition-colors cursor-default">
               <div className="flex justify-between items-start mb-2">
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded uppercase">{activity.subject}</span>
                <span className="text-slate-400 text-xs">{new Date(activity.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-xl text-ink mb-1">{activity.theme}</h3>
              <p className="text-slate-500 text-sm">
                {activity.questions.length} questões • {activity.type}
              </p>
               <div className="mt-4 flex gap-2 justify-end">
                <button 
                   onClick={() => onDelete('activity', activity.id)}
                   className="text-red-400 text-sm hover:text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
};