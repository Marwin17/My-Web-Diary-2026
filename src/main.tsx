/*
 * File: src/main.tsx
 * Authors: Marwin Tan
 * Description: Entry point for the React application.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { BrowserRouter } from 'react-router'

// Render the React application
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
