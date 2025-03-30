import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nsfsnuvkispdcemezeln.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZnNudXZraXNwZGNlbWV6ZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMTkwMzcsImV4cCI6MjA1ODg5NTAzN30.ocBgBnDnAwbODe5wNqzr6UaxZGWUnZ0P7R87O6BmVFw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
