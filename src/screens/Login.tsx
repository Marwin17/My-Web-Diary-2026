/*
 * File: Login.tsx
 * Authors: Marwin Tan, Mary Allison Chen, Julia Irene Sia
 * Created: March 25, 2026
 * Description: Component for user authentication and login functionality.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router";
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { IconButton, InputAdornment } from "@mui/material"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Main Login component
function Login() {
    console.log('🔐 Login component mounted')

    // Navigation hook
    const navigate = useNavigate()

    // Empty entry template
    const emptyEntry = {
        email: '',
        password: '',
    }

    // State variables
    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [otherError, setOtherError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // Email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Handle Enter key press
    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
            login()
        }
    }

    // Login function
    function login() {
        setError(emptyEntry)
        setOtherError('')

        // Validation checks
        if (!entry.email.trim() || !emailPattern.test(entry.email)) {
            setError({ ...emptyEntry, email: 'Enter a valid email address' })
            return
        }

        if (!entry.password.trim()) {
            setError({ ...emptyEntry, password: 'Password is required' })
            return
        }

        setLoading(true)

        supabase.auth.signInWithPassword({
            email: entry.email,
            password: entry.password.trim()
        }).then(({ data, error }) => {

            if (error) {
                console.log(error.message)
                setOtherError(error.message)
            } else {
                console.log(data)
                navigate('/')
            }

        }).catch((error) => {
            console.log(error)
            setOtherError(error.error_description || error.message)
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <Box sx={{ padding: 1 }}>

            {/* Title */}
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>
                Login
            </Typography>

            {/* Email Field */}
            <TextField
                fullWidth
                id="email"
                label="Email"
                error={error.email.length > 0}
                helperText={error.email}
                variant="outlined"
                value={entry.email}
                onKeyDown={handleKeyDown}
                onChange={event => {
                    setEntry({
                        ...entry,
                        email: event.target.value
                    })
                }}
                sx={{
                    "& .MuiInputBase-root": {
                        height: '65px'
                    },
                    mr: 0.5,
                    mb: 1.5
                }}
            />

            {/* Password Field */}
            <TextField
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                error={error.password.length > 0}
                helperText={error.password}
                variant="outlined"
                value={entry.password}
                onKeyDown={handleKeyDown}
                onChange={event => setEntry({
                    ...entry,
                    password: event.target.value
                })}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                sx={{
                    mb: 1.5
                }}
            />

            {/* Error Message */}
            <Typography color='error'>{otherError}</Typography>

            {/* Cancel Button */}
            <Button
                variant="outlined"
                onClick={() => navigate('/')}
            >
                Cancel
            </Button>

            {/* Login Button */}
            <Button
                variant="contained"
                disabled={loading}
                onClick={() => login()}
                sx={{ ml: 1 }}
            >
                {loading ? 'Signing in...' : 'Login'}
            </Button>

        </Box>
    )
}

export default Login