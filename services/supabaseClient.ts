import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Chaves inseridas conforme solicitado.
// Nota: Em um projeto profissional público, utilize variáveis de ambiente (.env).
// Para gerar o APK agora, essas chaves funcionarão diretamente.

// Usamos optional chaining (?.env?.) para evitar erro caso o ambiente não tenha suporte a import.meta.env
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://obfxljtfmkykvzbpmsbg.supabase.co';
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZnhsanRmbWt5a3Z6YnBtc2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTY5ODMsImV4cCI6MjA4MTAzMjk4M30.dumbUdAzH0kUay3g7F-8tG8xvq2fnKTtMli5MMHk5Ko';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);