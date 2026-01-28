import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // NÃO injetamos mais process.env.API_KEY aqui.
  // A chave fica restrita ao servidor (Netlify Functions).
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    host: true,
    // Proxy para simular o ambiente serverless localmente sem Netlify CLI (opcional, mas útil)
    // Se o usuário rodar apenas 'npm run dev', chamadas para /.netlify/functions vão falhar
    // e cair no modo offline, o que é o comportamento esperado e seguro.
  }
});