import { createClient } from '@supabase/supabase-js'
import type { Database } from './database/supabase'


export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
)
