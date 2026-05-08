import { Box, Button, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { supabase } from "../supabaseClient"

function ChangePassword() {

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')

    async function changePassword() {

        if (password !== confirmPassword) {
            setMessage("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters")
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setMessage(error.message)
            return
        }

        setMessage("Password updated successfully ❤️")
        setPassword('')
        setConfirmPassword('')
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
                backgroundColor: '#fff'
            }}
        >

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

            <TextField
                fullWidth
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                fullWidth
                variant="contained"
                onClick={changePassword}
                sx={{
                    backgroundColor: '#e91e63',
                    py: 1.2,
                    fontWeight: 'bold',
                    '&:hover': {
                        backgroundColor: '#d81b60'
                    }
                }}
            >
                Save New Password
            </Button>

            {message && (
                <Typography
                    sx={{
                        mt: 2,
                        textAlign: 'center',
                        color: message.includes('success')
                            ? 'green'
                            : 'red'
                    }}
                >
                    {message}
                </Typography>
            )}

        </Box>
    )
}

export default ChangePassword