/*
 * File: ChangePassword.tsx
 * Authors: Mary Allison Chen, Marwin Tan, Julia Irene Sia
 * Created: May 8, 2026
 * Description: Component for changing user password with validation and confirmation.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { Box, Button, TextField, Typography, IconButton, InputAdornment } from "@mui/material"
import { useState } from "react"
import type { KeyboardEvent } from "react"
import { supabase } from "../supabaseClient"
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

// Main ChangePassword component
function ChangePassword() {
    console.log('🔑 ChangePassword component mounted')

    // State variables
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)

    // Handle Enter key press
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            changePassword()
        }
    }

    // Function to change password
    async function changePassword() {
        setErrors({ password: '', confirmPassword: '' })
        setMessage('')
        setMessageType('')

        // Validation checks
        if (!password.trim()) {
            setErrors({ password: 'New password is required', confirmPassword: '' })
            return
        }

        if (!confirmPassword.trim()) {
            setErrors({ password: '', confirmPassword: 'Please confirm the password' })
            return
        }

        if (password !== confirmPassword) {
            setErrors({ password: 'Passwords do not match', confirmPassword: 'Passwords do not match' })
            return
        }

        if (password.length < 6) {
            setErrors({ password: 'Password must be at least 6 characters', confirmPassword: '' })
            return
        }

        setLoading(true)
        try {
            // Update password via Supabase
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setMessage(error.message)
                setMessageType('error')
                return
            }

            setMessage('Password updated successfully ❤️')
            setMessageType('success')
            setPassword('')
            setConfirmPassword('')
        } catch (error) {
            setMessage('Could not update password. Please try again.')
            setMessageType('error')
            console.error('ChangePassword error', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 5,
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: 'background.paper',
                color: 'text.primary'
            }}
        >

            {/* Title */}
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#d81b60',
                    textAlign: 'center'
                }}
            >
                🔒 Change Password
            </Typography>

            {/* New Password Field */}
            <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                error={Boolean(errors.password)}
                helperText={errors.password}
                sx={{ mb: 2 }}
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
            />

            {/* Confirm Password Field */}
            <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                sx={{ mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                onClick={changePassword}
                disabled={loading}
                sx={{
                    backgroundColor: 'primary.main',
                    py: 1.2,
                    fontWeight: 'bold',
                    '&:hover': {
                        backgroundColor: 'primary.dark'
                    }
                }}
            >
                {loading ? 'Saving...' : 'Save New Password'}
            </Button>

            {/* Message Display */}
            {message && (
                <Typography
                    sx={{
                        mt: 2,
                        textAlign: 'center',
                        color: messageType === 'success' ? 'success.main' : 'error.main'
                    }}
                >
                    {message}
                </Typography>
            )}

        </Box>
    )
}

export default ChangePassword