/*
 * File: HelpScreen.tsx
 * Authors: Marwin Tan, Mary Allison Chen, 
 * Created: May 13, 2026
 * Description: Alternative help screen component with different layout and content.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

// HelpScreen.tsx

import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Divider,
    Button,
    Chip
} from "@mui/material"

import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import FavoriteIcon from '@mui/icons-material/Favorite'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import MapIcon from '@mui/icons-material/Map'
import LockIcon from '@mui/icons-material/Lock'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'

import { useNavigate } from "react-router"

// Props interface
interface HelpScreenProps {
    toggleDarkMode?: () => void
}

// Main HelpScreen component
function HelpScreen({
    toggleDarkMode = () => {}
}: HelpScreenProps) {

    // Navigation hook
    const navigate = useNavigate()

    // Help cards data
    const helpCards = [

        {
            title: 'Dashboard',
            description:
                'View your statistics and mood analytics.',
            icon: <DashboardIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/'),
            color: '#ff4081'
        },

        {
            title: 'Diary Entries',
            description:
                'View all saved memories and emotions.',
            icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diarylist'),
            color: '#ff6f91'
        },

        {
            title: 'Create Entry',
            description:
                'Write a new memory with mood and stars.',
            icon: <AddCircleIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diaryedit'),
            color: '#ff0055'
        },

        {
            title: 'Favorites',
            description:
                'Save your favorite memories.',
            icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diarylist'),
            color: '#ff1744'
        },

        {
            title: 'Edit Entries',
            description:
                'Update memories anytime.',
            icon: <EditIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diarylist'),
            color: '#e91e63'
        },

        {
            title: 'Search',
            description:
                'Search memories instantly.',
            icon: <SearchIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diarylist'),
            color: '#ff9800'
        },

        {
            title: 'Map Locations',
            description:
                'Open memory locations.',
            icon: <MapIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diarylist'),
            color: '#00bcd4'
        },

        {
            title: 'Photos',
            description:
                'Upload memory pictures and files.',
            icon: <PhotoLibraryIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/diaryedit'),
            color: '#3f51b5'
        },

        {
            title: 'Dark Mode',
            description:
                'Switch dark/light themes.',
            icon: <DarkModeIcon sx={{ fontSize: 40 }} />,
            action: toggleDarkMode,
            color: '#673ab7'
        },

        {
            title: 'Security',
            description:
                'Protect your account.',
            icon: <LockIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/password'),
            color: '#4caf50'
        },

        {
            title: 'Helpful Tips',
            description:
                'Learn how to maximize the app.',
            icon: <TipsAndUpdatesIcon sx={{ fontSize: 40 }} />,
            action: () =>
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                }),
            color: '#ff5722'
        },

        {
            title: 'More Features',
            description:
                'Discover future updates.',
            icon: <ExpandMoreIcon sx={{ fontSize: 40 }} />,
            action: () => navigate('/about'),
            color: '#9c27b0'
        }
    ]

    return (

        <Box
            sx={{
                width: '100%',
                flexGrow: 1,
                boxSizing: 'border-box',
                p: { xs: 2, md: 4 },
                bgcolor: 'background.default',
                minHeight: '100vh',

                animation: 'fadeIn .5s ease',

                '@keyframes fadeIn': {
                    from: {
                        opacity: 0,
                        transform: 'translateY(10px)'
                    },

                    to: {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                }
            }}
        >

            {/* HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        md: 'center'
                    },
                    flexDirection: {
                        xs: 'column',
                        md: 'row'
                    },
                    gap: 2,
                    mb: 5
                }}
            >

                <Box>

                    <Typography
                        variant="h3"
                        fontWeight="800"
                        sx={{
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >

                        <HelpOutlineIcon
                            sx={{ fontSize: 45 }}
                        />

                        Help Center

                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Learn how to use Love Diary ✨
                    </Typography>

                </Box>

                <Chip
                    label="Responsive Support UI"
                    sx={{
                        px: 1,
                        py: 2.5,
                        fontWeight: 'bold',
                        background:
                            'linear-gradient(45deg, #ff2e7a, #ff0055)',
                        color: 'white'
                    }}
                />

            </Box>

            {/* QUICK NAV */}
            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{ mb: 4 }}
            >

                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                >
                    Dashboard
                </Button>

                <Button
                    variant="contained"
                    onClick={() => navigate('/diarylist')}
                >
                    Diary
                </Button>

                <Button
                    variant="contained"
                    onClick={() => navigate('/diaryedit')}
                >
                    New Entry
                </Button>

            </Stack>

            {/* GRID */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, minmax(0, 1fr))'
                    },
                    gap: 3
                }}
            >

                {helpCards.map((item, index) => (

                    <Card
                        key={index}
                        sx={{
                            borderRadius: 5,
                            boxShadow: 4,
                            transition: '.25s',
                            position: 'relative',
                            overflow: 'hidden',

                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'linear-gradient(135deg, rgba(255,255,255,.08), transparent)',
                                opacity: 0,
                                transition: '.3s'
                            },

                            '&:hover::before': {
                                opacity: 1
                            },

                            '&:hover': {
                                transform:
                                    'translateY(-6px)',
                                boxShadow: 8
                            }
                        }}
                    >

                        <CardContent>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >

                                <Box
                                    sx={{
                                        color: item.color
                                    }}
                                >
                                    {item.icon}
                                </Box>

                                <Chip
                                    label="Guide"
                                    size="small"
                                />

                            </Stack>

                            <Typography
                                variant="h6"
                                fontWeight="700"
                                mb={1}
                            >
                                {item.title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    minHeight: 70
                                }}
                            >
                                {item.description}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={item.action}
                                sx={{
                                    borderRadius: 100,
                                    py: 1.2,
                                    fontWeight: 'bold',
                                    background:
                                        `linear-gradient(45deg, ${item.color}, #ff80ab)`
                                }}
                            >
                                Open
                            </Button>

                        </CardContent>

                    </Card>
                ))}

            </Box>

        </Box>
    )
}

export default HelpScreen