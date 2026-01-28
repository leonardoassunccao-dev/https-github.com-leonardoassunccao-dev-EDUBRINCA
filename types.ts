
export type Subject = 'Português' | 'Matematica' | 'Ciências' | 'História' | 'Geografia';
export type ClassLevel = 'Reforço' | 'Regular' | 'Avançada';
export type ActivityType = 'Complete' | 'Ligue' | 'MultiplaEscolha' | 'VerdadeiroFalso' | 'DesenheEscreva' | 'CaçaPalavras' | 'Probleminhas' | 'AtividadeAvaliativa';
export type GradeLevel = '2º Ano' | '3º Ano' | '4º Ano';

export interface Source {
  uri: string;
  title: string;
}

export interface LessonPlan {
  id: string;
  createdAt: number;
  subject: Subject;
  theme: string;
  gradeLevel: GradeLevel; // Novo campo
  duration: number; // minutes
  level: ClassLevel;
  objective: string;
  materials: string[];
  steps: {
    time: string;
    title: string;
    description: string;
  }[];
  differentiation: {
    remedial: string; // Reforço
    advanced: string; // Regular/Avançado
  };
  sources?: Source[];
}

export interface ActivityQuestion {
  id: string;
  instruction: string;
  content: string; // The question text or items
  answer?: string; // For answer key
}

export interface ActivitySheet {
  id: string;
  createdAt: number;
  subject: Subject;
  theme: string;
  gradeLevel: GradeLevel; // Novo campo
  type: ActivityType;
  level: ClassLevel;
  schoolHeader: {
    studentName: boolean;
    date: boolean;
    teacherName: boolean;
  };
  questions: ActivityQuestion[];
  sources?: Source[];
}

export interface AppState {
  plans: LessonPlan[];
  activities: ActivitySheet[];
}
