/*
 * File: src/Theme.ts
 * Authors: Marwin Tan
 * Created: Feb 25, 2026
 * Description: Theme definitions and utilities for light and dark modes.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { createTheme } from "@mui/material";
import { pink, blue, amber } from "@mui/material/colors";

// Shared typography configuration
const sharedTypography = {
    fontFamily: "Inter, system-ui, sans-serif",
};

// Light theme configuration
export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: pink[500],
            contrastText: '#ffffff'
        },
        secondary: {
            main: blue[600],
            contrastText: '#ffffff'
        },
        background: {
            default: '#fbf5ff',
            paper: '#ffffff'
        },
        text: {
            primary: '#111827',
            secondary: '#4b5563'
        },
        divider: 'rgba(15, 23, 42, 0.08)'
    },
    typography: sharedTypography,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#fbf5ff',
                    color: '#111827'
                }
            }
        }
    }
})

// Dark theme configuration
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: pink[300],
            contrastText: '#0f172a'
        },
        secondary: {
            main: amber[500],
            contrastText: '#0f172a'
        },
        background: {
            default: '#070b18',
            paper: '#111827'
        },
        text: {
            primary: '#e2e8f0',
            secondary: '#94a3b8'
        },
        divider: 'rgba(226, 232, 240, 0.12)'
    },
    typography: sharedTypography,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#070b18',
                    color: '#e2e8f0'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: '#111827'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#111827'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    boxShadow: '0 8px 24px rgba(255, 255, 255, 0.06)'
                }
            }
        }
    }
})

