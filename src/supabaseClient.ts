/*
 * File: src/supabaseClient.ts
 * Authors: Mary Allison Chen, Marwin Tan, Julia Irene Sia
 * Created: May 5, 2026
 * Description: Supabase client configuration for database and authentication.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database/supabase'

// Supabase client instance
export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
)
