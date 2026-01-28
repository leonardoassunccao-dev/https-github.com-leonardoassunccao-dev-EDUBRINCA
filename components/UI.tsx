import React from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  // Base: Pílula arredondada, transição de clique, min-h-[44px] para touch
  const baseStyles = "font-bold rounded-2xl transition-all active:translate-y-[2px] md:active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2 border-2 border-transparent relative min-h-[44px] touch-manipulation";
  
  const variants = {
    // Primary: Coral
    primary: "bg-brand-orange text-white shadow-button shadow-red-300 hover:bg-[#FF7A5C]",
    // Secondary: Azul
    secondary: "bg-brand-blue text-white shadow-button shadow-blue-300 hover:bg-[#60C0F0]",
    // Accent: Amarelo
    accent: "bg-brand-yellow text-pencil shadow-button shadow-yellow-300 hover:bg-[#FBBF24]",
    // Outline: Borda simples
    outline: "bg-white border-2 border-slate-200 text-pencil shadow-button shadow-slate-200 hover:border-brand-orange hover:text-brand-orange",
    // Ghost: Texto simples
    ghost: "bg-transparent text-slate-400 hover:text-brand-orange hover:bg-orange-50 shadow-none border-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm shadow-[0px_2px_0px_0px]",
    md: "px-5 py-3 text-base md:text-lg",
    lg: "px-6 py-4 text-lg md:text-xl tracking-wide w-full md:w-auto"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Card ---
// Responsivo: Padding menor no mobile
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 shadow-neopop p-5 md:p-8 w-full ${className}`}>
    {children}
  </div>
);

// --- Inputs ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 mb-5 group w-full">
    <label className="text-pencil font-bold text-base md:text-lg ml-1 group-focus-within:text-brand-orange transition-colors cursor-text">{label}</label>
    <input 
      className={`w-full bg-slate-50/50 border-b-4 border-slate-200 rounded-t-xl px-4 py-3 text-base md:text-lg text-pencil placeholder-slate-400 focus:border-brand-orange focus:bg-white focus:outline-none transition-all ${className}`}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[] | { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  return (
    <div className="flex flex-col gap-2 mb-5 group w-full">
      <label className="text-pencil font-bold text-base md:text-lg ml-1 group-focus-within:text-brand-orange transition-colors cursor-pointer">{label}</label>
      <div className="relative w-full">
        <select 
          className={`w-full appearance-none bg-slate-50/50 border-b-4 border-slate-200 rounded-t-xl px-4 py-3 text-base md:text-lg text-pencil focus:border-brand-orange focus:bg-white focus:outline-none transition-all cursor-pointer ${className}`}
          {...props}
        >
          {normalizedOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

// --- Layout Wrapper ---
export const PageLayout: React.FC<{ 
  title: string; 
  onBack?: () => void; 
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, onBack, children, actions }) => (
  <div className="min-h-screen pb-24 md:pb-20 w-full overflow-hidden">
    {/* Header flutuante */}
    <header className="no-print bg-white/85 backdrop-blur-md px-4 py-3 sticky top-0 z-30 border-b border-slate-200/50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          {onBack && (
            <button onClick={onBack} className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-brand-orange hover:text-white transition-all shadow-sm active:scale-95 touch-manipulation">
              <span className="text-xl md:text-2xl pb-1">←</span>
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-pencil tracking-tight truncate">{title}</h1>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {actions}
        </div>
      </div>
    </header>
    <main className="w-full max-w-5xl mx-auto p-4 md:p-6 mt-4 md:mt-8">
      {children}
    </main>
  </div>
);