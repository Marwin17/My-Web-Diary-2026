/*
 * File: Register.tsx
 * Authors: Marwin Tan, Mary Allison Chen
 * Created: Feb 25, 2026
 * Description: Component for user registration and account creation.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router";
import { useState } from "react";
import { supabase } from "../supabaseClient";

// Main Register component
function Register() {
    console.log('📝 Register component mounted')

    // Navigation hook
    const navigate = useNavigate()

    // Empty entry template
    const emptyEntry = {
        name: '',
        email: '',
        password: '',
        retypePassword: '',
    }

    // State variables
    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [otherError, setOtherError] = useState('')
    const [loading, setLoading] = useState(false)

    // Email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Save function
    function save() {
        // validate
        setError(emptyEntry)
        if (!entry.name.trim()) {
            setError({ ...emptyEntry, name: 'Name is required' })
            return
        }

        if (!entry.email.trim() || !emailPattern.test(entry.email)) {
            setError({ ...emptyEntry, email: 'Enter a valid email address' })
            return
        }

        if (entry.password.length < 6) {
            setError({ ...emptyEntry, password: 'Password must be at least 6 characters' })
            return
        }

        if (entry.password !== entry.retypePassword) {
            setError({
                ...error, password: 'Passwords did not match', retypePassword: 'Passwords did not match'
            })
            return
        }

        setLoading(true)
        // register to Supabase
        supabase.auth.signUp({
            email: entry.email,
            password: entry.password.trim(),
            options: {
                data: {
                    full_name: entry.name,
                },
            },
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
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>Register</Typography>

            {/* Name Field */}
            <TextField
                fullWidth
                id="name"
                label="Name"
                variant="outlined"
                value={entry.name}
                onChange={event => {
                    setEntry({
                        ...entry, name: event.target.value
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

            {/* Email Field */}
            <TextField
                fullWidth
                id="email"
                label="Email"
                variant="outlined"
                value={entry.email}
                onChange={event => {
                    setEntry({
                        ...entry, email: event.target.value
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
                type="password"
                error={error.password.length > 0}
                helperText={error.password}
                variant="outlined"
                value={entry.password}
                onChange={event => setEntry({
                    ...entry, password: event.target.value
                })}
                sx={{
                    mb: 1.5
                }}
            />

            {/* Retype Password Field */}
            <TextField
                fullWidth
                id="retypePassword"
                label="Retype Password"
                type="password"
                error={error.retypePassword.length > 0}
                helperText={error.retypePassword}
                variant="outlined"
                value={entry.retypePassword}
                onChange={event => setEntry({
                    ...entry, retypePassword: event.target.value
                })}
                sx={{
                    mb: 1.5
                }}
            />
            <Typography color='error'>{otherError}</Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
            <Button variant="contained" disabled={loading} onClick={() => save()} sx={{ ml: 1 }}>
                {loading ? 'Registering...' : 'Register'}
            </Button>
        </Box>
    )
}

export default Register
