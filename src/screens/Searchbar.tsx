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
import Drawer from "@mui/material/Drawer"
import Divider from "@mui/material/Divider"
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { moodList } from "../diary/Diary"

export type SearchState = {
    filter: string
    filterMood: number
    filterStar: number
    sortOrder: 'asc' | 'desc'
    sortByStar: 'none' | 'asc' | 'desc'
    dateFrom: string
    dateTo: string
}

type SearchbarProps = {
    params: SearchState
    onChange: (params: SearchState) => void
    onSearch: () => void
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
        onChange({
            ...params,
            ...changes
        })
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            onSearch()
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
                    background: 'linear-gradient(135deg, #ffffff 0%, #fff5f7 100%)',
                    border: '1px solid #ffe4ec'
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
                                        <SearchIcon sx={{ color: '#e91e63' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '42px',
                                    borderRadius: 3,
                                    '&:hover fieldset': {
                                        borderColor: '#e91e63'
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={onSearch}
                            sx={{
                                height: '42px',
                                minWidth: 110,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #e91e63, #ff80ab)',
                                textTransform: 'none',
                                fontWeight: 'bold'
                            }}
                        >
                            Search
                        </Button>

                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<TuneIcon />}
                            onClick={() => setOpenMore(true)}
                            sx={{
                                height: '42px',
                                borderRadius: 3,
                                border: '2px solid #e91e63',
                                color: '#e91e63',
                                textTransform: 'none'
                            }}
                        >
                            Filters
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
                        overflowY: 'auto'
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
                                background: 'linear-gradient(135deg, #e91e63, #ff80ab)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
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
                                updateParams({ filterMood: event.target.value as number })
                            }
                            sx={{
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e91e63'
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
                                updateParams({ filterStar: event.target.value as number })
                            }
                            sx={{
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e91e63'
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
                                    borderColor: '#e91e63'
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
                        <InputLabel sx={{ fontWeight: 'bold' }}>Sort Title</InputLabel>
                        <Select
                            value={params.sortOrder}
                            label="Sort Title"
                            onChange={(event) =>
                                updateParams({ sortOrder: event.target.value as 'asc' | 'desc' })
                            }
                            sx={{
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e91e63'
                                }
                            }}
                        >
                            <MenuItem value="asc">A → Z</MenuItem>
                            <MenuItem value="desc">Z → A</MenuItem>
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
                        sx={{ mb: 1.5 }}
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
                            onSearch()
                            setOpenMore(false)
                        }}
                        sx={{
                            py: 1.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #e91e63, #ff80ab)',
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