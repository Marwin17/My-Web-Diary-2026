/*
 * File: vite.config.ts
 * Authors: Mary Allison Chen, Marwin Tan, Julia Irene Sia
 * Created: May 5, 2026
 * Description: Vite build tool configuration.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
