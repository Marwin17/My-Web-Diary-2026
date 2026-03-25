import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router"
import { useState } from "react"

function Login() {

    const navigate = useNavigate()

    const emptyEntry = {
        email: '',
        password: '',
    }

    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)

    function login() {

        let hasError = false
        let newError = { ...emptyEntry }


        if (!entry.email) {
            newError.email = "Email is required"
            hasError = true
        }


        if (!entry.password) {
            newError.password = "Password is required"
            hasError = true
        }

        setError(newError)

        if (hasError) return

        navigate('/')
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
                variant="outlined"
                value={entry.email}
                error={error.email?.length > 0}
                helperText={error.email}
                onChange={event =>
                    setEntry({
                        ...entry,
                        email: event.target.value
                    })
                }
                sx={{ mb: 1.5 }}
            />

            <TextField
                fullWidth
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                value={entry.password}
                error={error.password?.length > 0}
                helperText={error.password}
                onChange={event =>
                    setEntry({
                        ...entry,
                        password: event.target.value
                    })
                }
                sx={{ mb: 2 }}
            />

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