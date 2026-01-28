import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente, prevenindo erro se process.cwd falhar em alguns ambientes
  // (process as any) é usado para evitar erro de TS caso a tipagem Node não esteja completa
  const cwd = (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');
  
  return {
    plugins: [react()],
    define: {
      // Garante que a API KEY seja uma string, mesmo que vazia, para não quebrar o site na inicialização
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    },
    server: {
      host: true
    }
  };
});