import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://itifeowdpmrqjntvncua.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aWZlb3dkcG1ycWpudHZuY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMDExMzcsImV4cCI6MjA4MTg3NzEzN30.hy4NVwQj5ugP8RR7AyGrWw48GKG_iLwSMzl56ukN87g'

export const supabase = createClient(supabaseUrl, supabaseKey)

export { createClient }
