/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://xhgfzmsegirflfyumkdd.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ2Z6bXNlZ2lyZmxmeXVta2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NzY3MDgsImV4cCI6MjEwNDQ1MjcwOH0.cw7X7D2JMV0EULCgfsH4plGpdt8E0nu66BqFnogPbiI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
