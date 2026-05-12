/*
 * File: src/screens/Searchbar.tsx
 * Authors: Mary Allison Chen, Marwin Tan
 * Created: May 11, 2026
 * Description: Component that provides search and filter interface for diary entries.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { useState, useEffect, type KeyboardEvent } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Divider from "@mui/material/Divider"
import Drawer from "@mui/material/Drawer"
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { moodList } from "../diary/Diary"

export type SearchState = {
    filter: string
    filterMood: number
    filterStar: number
    sortOrder: 'asc' | 'desc'        // asc = Oldest → Latest, desc = Latest → Oldest
    sortByStar: 'none' | 'asc' | 'desc'
    dateFrom: string
    dateTo: string
}

type SearchbarProps = {
    params: SearchState
    onChange: (params: SearchState) => void
    onSearch: (params: SearchState) => void
    onClear: () => void
    children?: React.ReactNode
}

export default function Searchbar({ params, onChange, onSearch, onClear, children }: SearchbarProps) {
    const theme = useTheme()
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))
    const [openMore, setOpenMore] = useState(false)

    const isDark = theme.palette.mode === 'dark'
    const searchPaperBg = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.88)'
    const searchPaperBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.4)'
    const controlBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.88)'
    const drawerBg = isDark ? 'rgba(10, 18, 33, 0.92)' : 'rgba(255,255,255,0.82)'
    const drawerBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.15)'
    const activeFieldset = isDark ? 'rgba(233,30,99,0.35)' : 'rgba(233,30,99,0.15)'

    useEffect(() => {
        // Auto-open drawer on large screens
        if (isLargeScreen) {
            setOpenMore(true)
        }
    }, [isLargeScreen])

    const moodListExtra = [
        {
            mood: -1,
            text: 'All',
            icon: <AlternateEmailIcon sx={{ color: '#0099ff', fontSize: 'inherit' }} />
        },
        ...moodList
    ]

    const updateParams = (changes: Partial<SearchState>) => {
        const updated = {
            ...params,
            ...changes
        }
        // Notify parent of the change
        onChange(updated)

        // Trigger an immediate search after parent receives the updated params.
        setTimeout(() => onSearch(updated), 0)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            onSearch(params)
            event.preventDefault()
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Search Bar - Full Width and Sticky */}
            {/* Search Bar - Modern Style */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 760,
                    mx: 'auto',
                    mt: 1,
                    mb: 2,
                    p: 2,
                    borderRadius: 5,
                    position: 'sticky',
                    top: 10,
                    zIndex: 10,

                            background: searchPaperBg,
                    backdropFilter: 'blur(12px)',

                    border: searchPaperBorder,

                    boxShadow: isDark
                        ? '0 12px 40px rgba(0,0,0,0.45)'
                        : `
            0 8px 30px rgba(233, 30, 99, 0.12),
            0 2px 10px rgba(0,0,0,0.06)
        `
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        width: '100%'
                    }}
                >
                    {/* Search Field */}
                    <TextField
                        id="search-field"
                        placeholder="Search memories, feelings, moments..."
                        variant="outlined"
                        size="small"
                        value={params.filter}
                        onChange={event =>
                            updateParams({ filter: event.target.value })
                        }
                        onKeyDown={handleKeyDown}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon
                                        sx={{
                                            color: '#e91e63',
                                            fontSize: 24
                                        }}
                                    />
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                background: controlBg,
                                color: theme.palette.text.primary,

                                transition: 'all 0.25s ease',

                                '& fieldset': {
                                    borderColor: activeFieldset
                                },

                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 14px rgba(233,30,99,0.08)'
                                },

                                '&:hover fieldset': {
                                    borderColor: '#e91e63'
                                },

                                '&.Mui-focused': {
                                    boxShadow: '0 0 0 4px rgba(233,30,99,0.10)'
                                },

                                '&.Mui-focused fieldset': {
                                    borderColor: '#e91e63'
                                }
                            }
                        }}
                    />

                    {/* Filter Button */}
                    <IconButton
                        onClick={() => setOpenMore(true)}
                        sx={{
                            height: 56,
                            width: 56,
                            borderRadius: '18px',

                            background: isDark ? 'rgba(233,30,99,0.14)' : 'rgba(233,30,99,0.08)',

                            border: isDark ? '1px solid rgba(233,30,99,0.25)' : '1px solid rgba(233,30,99,0.15)',

                            transition: 'all 0.25s ease',

                            '&:hover': {
                                background: 'rgba(233,30,99,0.16)',
                                transform: 'translateY(-2px)'
                            },

                            display: isLargeScreen ? 'none' : 'flex'
                        }}
                        title="Advanced Filters"
                    >
                        <FilterListIcon
                            sx={{
                                color: '#e91e63',
                                fontSize: 26
                            }}
                        />
                    </IconButton>

                    {/* Search Button */}
                    <Button
                        variant="contained"
                        onClick={() => onSearch(params)}
                        sx={{
                            height: 58,
                            px: 4,
                            minWidth: 130,

                            borderRadius: '999px',

                            background:
                                'linear-gradient(135deg, #ff4f93 0%, #e91e63 100%)',

                            color: '#fff',

                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'none',
                            letterSpacing: '0.4px',

                            boxShadow: '0 8px 20px rgba(233,30,99,0.28)',

                            transition: 'all 0.25s ease',

                            '&:hover': {
                                background:
                                    'linear-gradient(135deg, #ff5fa0 0%, #d81b60 100%)',

                                transform: 'translateY(-2px)',

                                boxShadow: '0 12px 24px rgba(233,30,99,0.35)'
                            },

                            '&:active': {
                                transform: 'scale(0.98)'
                            }
                        }}
                    >
                        Search
                    </Button>
                </Box>
            </Paper>

            {/* Main Content Area - Entries and Filters Side by Side */}
            <Box sx={{ display: 'flex', overflow: 'visible' }}>
                {/* Entries Area - Left Side */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {children}
                </Box>

                {/* Drawer - Right Side (Permanent on large screens) */}
                <Drawer
                    anchor="right"
                    open={openMore}
                    onClose={() => !isLargeScreen && setOpenMore(false)}
                    variant={isLargeScreen ? 'permanent' : 'temporary'}
                    sx={{
                        '& .MuiDrawer-paper': {
                            position: isLargeScreen ? 'relative' : 'fixed',

                            width: 360,
                            height: isLargeScreen ? 'auto' : '100vh',

                            borderLeft: 'none',

                            background: drawerBg,
                            backdropFilter: 'blur(18px)',
                            border: drawerBorder,

                            boxShadow: isDark
                                ? '-8px 0 30px rgba(0,0,0,0.45), -2px 0 10px rgba(0,0,0,0.20)'
                                : `
                                    -8px 0 30px rgba(233,30,99,0.10),
                                     -2px 0 10px rgba(0,0,0,0.05) `,

                            overflowY: 'auto'
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            px: 2.5,
                            py: 3,

                            bgcolor: 'transparent',
                            color: 'text.primary'
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 800,
                                        color: '#e91e63',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Advanced Filters
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        mt: 0.5
                                    }}
                                >
                                    Find your special memories faster ✨
                                </Typography>
                            </Box>

                            {!isLargeScreen && (
                                <IconButton
                                    onClick={() => setOpenMore(false)}
                                    sx={{
                                        background: 'rgba(233,30,99,0.08)',

                                        '&:hover': {
                                            background: 'rgba(233,30,99,0.16)'
                                        }
                                    }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            )}
                        </Box>

                        <Divider
                            sx={{
                                mb: 3,
                                borderColor: 'rgba(233,30,99,0.12)'
                            }}
                        />
                        {/* Content Wrapper */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2.5
                            }}
                        >
                            {/* Mood Filter */}
                            <FormControl fullWidth>
                                <InputLabel sx={{ fontWeight: 600 }}>
                                    Mood
                                </InputLabel>

                                <Select
                                    value={params.filterMood}
                                    label="Mood"
                                    onChange={(event) =>
                                        updateParams({
                                            filterMood: Number(event.target.value)
                                        })
                                    }
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 4,
                                            background: controlBg,
                                            color: theme.palette.text.primary
                                        },

                                        borderRadius: 4,
                                        background: controlBg,

                                        '&.Mui-focused': {
                                            boxShadow: '0 0 0 4px rgba(233,30,99,0.10)'
                                        },

                                        '&.Mui-focused fieldset': {
                                            borderColor: '#e91e63'
                                        }
                                    }}
                                >
                                    {moodListExtra.map((item, index) => (
                                        <MenuItem value={item.mood} key={index}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.2
                                                }}
                                            >
                                                <Box sx={{ fontSize: '1.3em' }}>
                                                    {item.icon}
                                                </Box>

                                                <Typography>
                                                    {item.text}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2.5 }}>
                                <InputLabel sx={{ fontWeight: 'bold' }}>Star Rating</InputLabel>
                                <Select
                                    value={params.filterStar}
                                    label="Star Rating"
                                    onChange={(event) =>
                                        updateParams({ filterStar: Number(event.target.value) })
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <MenuItem value={-1}>All Ratings</MenuItem>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <MenuItem key={star} value={star}>
                                            <Box sx={{ color: '#ffb300', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{'★'.repeat(star)}</span>
                                                <span>({star})</span>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2.5 }}>
                                <InputLabel sx={{ fontWeight: 'bold' }}>Sort by Stars</InputLabel>
                                <Select
                                    value={params.sortByStar}
                                    label="Sort by Stars"
                                    onChange={(event) =>
                                        updateParams({ sortByStar: event.target.value as 'none' | 'asc' | 'desc' })
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <MenuItem value="none">None</MenuItem>
                                    <MenuItem value="asc">★ → ★★★★★</MenuItem>
                                    <MenuItem value="desc">★★★★★ → ★</MenuItem>
                                </Select>
                            </FormControl>

                            <Divider sx={{ my: 2.5 }} />

                            <FormControl fullWidth sx={{ mb: 2.5 }}>
                                <InputLabel sx={{ fontWeight: 'bold' }}>Sort by Date</InputLabel>
                                <Select
                                    value={params.sortOrder}
                                    label="Sort by Date"
                                    onChange={(event) =>
                                        updateParams({ sortOrder: event.target.value as 'asc' | 'desc' })
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    <MenuItem value="desc">Latest → Oldest</MenuItem>
                                    <MenuItem value="asc">Oldest → Latest</MenuItem>
                                </Select>
                            </FormControl>

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, mt: 1 }}>
                                📅 Date Range
                            </Typography>
                            <TextField
                                fullWidth
                                type="date"
                                label="From"
                                InputLabelProps={{
                                    shrink: true
                                }}
                                value={params.dateFrom}
                                onChange={(event) =>
                                    updateParams({ dateFrom: event.target.value })
                                }
                                sx={{
                                    mb: 1.5,
                                    '& .MuiInputBase-root': {
                                        backgroundColor: controlBg,
                                        color: theme.palette.text.primary
                                    }
                                }}
                            />

                            <TextField
                                fullWidth
                                type="date"
                                label="To"
                                InputLabelProps={{
                                    shrink: true
                                }}
                                value={params.dateTo}
                                onChange={(event) =>
                                    updateParams({ dateTo: event.target.value })
                                }
                                sx={{
                                    mb: 2.5,
                                    '& .MuiInputBase-root': {
                                        backgroundColor: controlBg,
                                        color: theme.palette.text.primary
                                    }
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<FilterListIcon />}
                                onClick={() => {
                                    setOpenMore(false)
                                    setTimeout(() => onSearch(params), 0)
                                }}
                                sx={{
                                    py: 1.6,
                                    borderRadius: '999px',

                                    background:
                                        'linear-gradient(135deg, #ff4f93 0%, #e91e63 100%)',

                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textTransform: 'none',

                                    boxShadow: '0 10px 20px rgba(233,30,99,0.25)',

                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 14px 24px rgba(233,30,99,0.35)'
                                    }
                                }}
                            >
                                Apply Filters
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={() => {
                                    onClear()
                                    setOpenMore(false)
                                }}
                                sx={{
                                    py: 1.4,
                                    borderRadius: '999px',

                                    borderColor: 'rgba(233,30,99,0.25)',
                                    color: '#e91e63',

                                    textTransform: 'none',
                                    fontWeight: 600,

                                    '&:hover': {
                                        borderColor: '#e91e63',
                                        background: 'rgba(233,30,99,0.05)'
                                    }
                                }}
                            >
                                Clear Filters
                            </Button>

                        </Box>
                    </Box>
                </Drawer>
            </Box >
        </Box >
    )
}