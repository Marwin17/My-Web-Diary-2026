import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router";
import { useState } from "react";
import { user } from "../App";
import { supabase } from "../supabaseClient";

function Login() {

    const navigate = useNavigate()
    const emptyEntry = {
        email: '',
        password: '',
    }
    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [otherError, setOtherError] = useState('')

    function login() {
        // validate
        setError(emptyEntry)
        if (entry.email === '' || entry.password === '') {
            const err = { ...error }
            if (entry.email === '') {
                err.email = 'Email is required'
            }
            if (entry.password === '') {
                err.password = 'Password is required'
            }
            setError(err)
            return
        }
        // login to Supabase
        supabase.auth.signInWithPassword({
            email: entry.email,
            password: entry.password.trim()
        }).then(({ data, error }) => {
            //Log.d(data)
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
        //testprofile
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>Login</Typography>
            <TextField
                fullWidth
                id="email"
                label="Email"
                error={error.email.length > 0}
                helperText={error.email}
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
            <Typography color='error'>{otherError}</Typography>
            <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
            <Button variant="contained" onClick={() => login()} sx={{ ml: 1 }}>Login</Button>
        </Box>
    )
}

export default Login
