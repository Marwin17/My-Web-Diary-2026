import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    IconButton,
    InputAdornment
} from "@mui/material"

import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useNavigate } from "react-router"
import { useState } from "react"

function Register() {

    const navigate = useNavigate()

    const emptyEntry = {
        name: '',
        email: '',
        course: '',
        year: '',
        password: '',
        retypePassword: '',
    }

    const [entry, setEntry] = useState(emptyEntry)
    const [error, setError] = useState(emptyEntry)
    const [showPassword, setShowPassword] = useState(false)

    function save() {
        if (entry.password !== entry.retypePassword) {
            setError({
                ...error,
                password: 'Password did not Match'
            })
            return
        }

        // TODO save later alligator
        navigate('/login')
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>
                Register
            </Typography>

            <TextField
                fullWidth
                id="name"
                label="name"
                variant="outlined"
                value={entry.name}
                onChange={event =>
                    setEntry({
                        ...entry, name: event.target.value
                    })
                }
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
                id="email"
                label="email"
                variant="outlined"
                value={entry.email}
                onChange={event =>
                    setEntry({
                        ...entry, email: event.target.value
                    })
                }
                sx={{ mb: 1.5 }}
            />

            {/* Course */}
            <TextField
                fullWidth
                id="course"
                label="Course"
                variant="outlined"
                value={entry.course}
                onChange={event =>
                    setEntry({
                        ...entry, course: event.target.value
                    })
                }
                sx={{ mb: 1.5 }}
            />

            {/* Year Select */}
            <TextField
                select
                fullWidth
                id="year"
                label="Year"
                value={entry.year}
                onChange={event =>
                    setEntry({
                        ...entry, year: event.target.value
                    })
                }
                sx={{ mb: 1.5 }}
            >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
            </TextField>

            <TextField
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                error={error.password.length > 0}
                helperText={error.password}
                variant="outlined"
                value={entry.password}
                onChange={event =>
                    setEntry({
                        ...entry, password: event.target.value
                    })
                }
                sx={{ mb: 2 }}
                InputProps={{
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
                }}
            />

            <TextField
                fullWidth
                id="retypePassword"
                label="Retype Password"
                type={showPassword ? "text" : "password"}
                error={error.password.length > 0}
                helperText={error.password}
                variant="outlined"
                value={entry.retypePassword}
                onChange={event =>
                    setEntry({
                        ...entry, retypePassword: event.target.value
                    })
                }
                sx={{ mb: 2 }}
                InputProps={{
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
                }}
            />

            <Button variant="outlined" onClick={() => navigate('/')}>
                Cancel
            </Button>

            <Button variant="contained" onClick={() => save()} sx={{ ml: 1 }}>
                Register
            </Button>
        </Box>
    )
}

export default Register