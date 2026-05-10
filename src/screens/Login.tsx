import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router";
import { useState } from "react";
import { user } from "../App";
import { supabase } from "../supabaseClient";
import { IconButton, InputAdornment } from "@mui/material"
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {

    const navigate = useNavigate()

    const emptyEntry = {
        email: '',
        password: '',
    }

    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [otherError, setOtherError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Enter') {
            login()
        }
    }

    function login() {
        // login to Supabase
        supabase.auth.signInWithPassword({
            email: entry.email,
            password: entry.password.trim()
        }).then(({ data, error }) => {

            if (error) {
                console.log(error.message)
                setOtherError(error.message)
            } else {
                console.log(data)
                user.session = data.session
                user.email = data.user.email ?? null
                navigate('/')
            }

        }).catch((error) => {

            console.log(error)
            setOtherError(error.error_description || error.message)

        }).finally(() => {
            //setLoading(false)
        })
    }

    return (
        <Box sx={{ padding: 1 }}>

            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>
                Login
            </Typography>

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
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
                sx={{
                    mb: 1.5
                }}
            />

            <Typography color='error'>{otherError}</Typography>

            <Button
                variant="outlined"
                onClick={() => navigate('/')}
            >
                Cancel
            </Button>

            <Button
                variant="contained"
                onClick={() => login()}
                sx={{ ml: 1 }}
            >
                Login
            </Button>

        </Box>
    )
}

export default Login