/*
 * File: src/screens/Searchbar.tsx
 * Authors: Mary Allison Chen, Marwin Tan
 * Created: May 11, 2026
 * Description: Component that provides search and filter interface for diary entries.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { useState, type KeyboardEvent } from "react"
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
}

export default function Searchbar({ params, onChange, onSearch, onClear }: SearchbarProps) {
    const [openMore, setOpenMore] = useState(false)

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
        <>
            <Paper
                elevation={3}
                sx={{
                    mx: 'auto',
                    width: '100%',
                    maxWidth: 720,
                    p: 1.5,
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '1 1 0%', minWidth: 0, width: '100%' }}>
                        <TextField
                            id="search-field"
                            label="Search memories..."
                            variant="outlined"
                            size="small"
                            value={params.filter}
                            onChange={event => updateParams({ filter: event.target.value })}
                            onKeyDown={handleKeyDown}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'primary.main' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '42px',
                                    borderRadius: 3,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main'
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                        <IconButton
                            onClick={() => setOpenMore(true)}
                            sx={{
                                height: '42px',
                                width: '42px',
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                            title="Advanced Filters"
                        >
                            <FilterListIcon sx={{ color: 'primary.main' }} />
                        </IconButton>
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={() => onSearch(params)}
                            sx={{
                                height: '42px',
                                minWidth: 110,
                                borderRadius: 3,
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Search
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Drawer anchor changed to "right" */}
            <Drawer anchor="right" open={openMore} onClose={() => setOpenMore(false)}>
                <Box
                    sx={{
                        width: 340,
                        p: 3,
                        height: '100vh',
                        overflowY: 'auto',
                        bgcolor: 'background.default',
                        color: 'text.primary'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                color: 'primary.main'
                            }}
                        >
                            Advanced Filters
                        </Typography>
                        <IconButton onClick={() => setOpenMore(false)} size="small">
                            <ClearIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 2.5 }} />

                    <FormControl fullWidth sx={{ mb: 2.5 }}>
                        <InputLabel sx={{ fontWeight: 'bold' }}>Mood</InputLabel>
                        <Select
                            value={params.filterMood}
                            label="Mood"
                            onChange={(event) =>
                                updateParams({ filterMood: Number(event.target.value) })
                            }
                            sx={{
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main'
                                }
                            }}
                        >
                            {moodListExtra.map((item, index) => (
                                <MenuItem value={item.mood} key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ fontSize: '1.3em' }}>{item.icon}</Box>
                                        <span>{item.text}</span>
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
                        sx={{ mb: 1.5, '& .MuiInputBase-root': { backgroundColor: 'background.paper' } }}
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
                        sx={{ mb: 2.5 }}
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
                            py: 1.5,
                            borderRadius: 3,
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontWeight: 'bold',
                            textTransform: 'none'
                        }}
                    >
                        Apply Filters
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        startIcon={<ClearIcon />}
                        onClick={() => {
                            onClear()
                            setOpenMore(false)
                        }}
                        sx={{
                            mt: 1,
                            color: '#999',
                            textTransform: 'none'
                        }}
                    >
                        Clear Filters
                    </Button>
                </Box>
            </Drawer>
        </>
    )
}