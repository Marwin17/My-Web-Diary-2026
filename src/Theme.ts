import { createTheme } from "@mui/material";
import { blue, green, orange, pink, purple, red } from "@mui/material/colors";

export const theme = createTheme({
    palette: {
        primary: {
            main: pink[500],
        },
        secondary: {
            main: green[500],
        },
        
    },
})

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: pink[500],
        },
        secondary: {
            main: green[500],
        },
    },
})

