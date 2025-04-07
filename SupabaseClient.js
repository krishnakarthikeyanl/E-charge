import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://twbwurtabsrsfybhpmtb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3Ynd1cnRhYnNyc2Z5YmhwbXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NzkwOTksImV4cCI6MjA1OTA1NTA5OX0.RUqj0hM0NMzmf1JKo8B-xF3Q14Q68v3s8hXsvPmh-bI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
