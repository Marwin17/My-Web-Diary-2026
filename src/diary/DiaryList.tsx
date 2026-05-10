import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'
import { blue, green } from "@mui/material/colors"
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useTheme } from "@mui/material/styles"
import { supabase } from "../supabaseClient"
import { user } from "../App"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import type { PostgrestError } from "@supabase/supabase-js"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Map from "../screens/Maps"


function DiaryList({ results }: { results?: any[] }) {

    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])
    const [filter, setFilter] = useState('')
    const [filterMood, setFilterMood] = useState(-1)
    const [openDate, setOpenDate] = useState(false)

    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // ✅ EXISTING (DB fetch)
    useEffect(() => {
        loadEntries()
    }, [])

    // ✅ ADD THIS HERE (search results override)
    useEffect(() => {

        // search results
        if (results && results.length > 0) {

            const entries = results.map(item => ({
                id: item.id,
                date: item.created_at
                    ? new Date(item.created_at)
                    : new Date(),
                title: item.title ?? '',
                mood: item.mood ?? 1,
                content: item.content ?? '',
                star: item.star ?? 1,
            }))

            setDiaryList(entries)
        }

        // normal loading
        else {
            loadEntries()
        }

    }, [results])

    // ⬇️ THEN your functions
    function loadEntries() {

        let query = supabase
            .from('entries')
            .select()

        // 🔹 apply text search
        if (filter) {
            query = query.textSearch(
                'search_vector',
                filter,
                { type: 'websearch' }
            )
        }

        // 🔹 apply mood filter
        if (filterMood !== -1) {
            query = query.eq('mood', filterMood)
        }

        // 🔹 apply date range
        if (dateFrom) {
            query = query.gte('created_at', dateFrom)
        }

        if (dateTo) {
            query = query.lte(
                'created_at',
                `${dateTo}T23:59:59`
            )
        }

        query
            .order('created_at', { ascending: false })
            .limit(20)
            .then(({ data, error }) => {
                processEntries(data, error)
            })
    }

    function processEntries(data: { content: string | null; created_at: string | null; id: string; mood: number | null; star: number | null; title: string | null; user_id: string }[] | null, error: PostgrestError | null) {
        console.log(data)
        console.log(error)
        if (!error && data) {
            const entries = data.map(item => {
                const entry = {
                    id: item.id,
                    date: item.created_at ? new Date(item.created_at) : new Date(),
                    title: item.title ?? '',
                    mood: item.mood ?? 1,
                    content: item.content ?? '',
                    star: item.star ?? 1,
                }
                return entry
            })
            setDiaryList(entries)
        } else {
            setDiaryList(sampleDiary)
        }
    }

    function search() {
        loadEntries()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            loadEntries()
            event.preventDefault()
        }
    }

    const moodListExtra = [{
        mood: -1,
        text: 'All',
        icon: <AlternateEmailIcon sx={{ color: '#0099ff', fontSize: 'inherit' }} />,
    }, ...moodList
    ]

    return (
        <>

            <Tooltip title="Filter by Date">
                <IconButton
                    onClick={() => setOpenDate(true)}
                    sx={{
                        mt: 1.3,
                        mx: 0.5
                    }}
                >
                    <CalendarMonthIcon />
                </IconButton>
            </Tooltip>

            <Dialog
                open={openDate}
                onClose={() => setOpenDate(false)}
                disableRestoreFocus
            >
                <DialogTitle>Date Filter</DialogTitle>

                <DialogContent>

                    <TextField
                        fullWidth
                        type="date"
                        label="From"
                        InputLabelProps={{ shrink: true }}
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                        sx={{ mt: 1 }}
                    />

                    <TextField
                        fullWidth
                        type="date"
                        label="To"
                        InputLabelProps={{ shrink: true }}
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                        sx={{ mt: 2 }}
                    />

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() => {
                            setDateFrom('')
                            setDateTo('')
                        }}
                    >
                        Clear
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            loadEntries()
                            setOpenDate(false)
                        }}
                    >
                        Apply
                    </Button>

                </DialogActions>
            </Dialog>

            <FormControl
                size="small"
                sx={{ mx: 0.5, mt: 1.5, minWidth: 100 }}
            >
                <InputLabel id="mood-label">Mood</InputLabel>

                <Select
                    labelId="mood-label"
                    id="mood-select"
                    value={filterMood}
                    label="Mood"
                    onChange={(event) => {
                        setFilterMood(event.target.value as number)
                    }}
                    MenuProps={{
                        PaperProps: {
                            onKeyDown: handleKeyDown
                        }
                    }}
                    sx={{
                        height: '40px'
                    }}
                >
                    {moodListExtra.map((item, index) => (
                        <MenuItem value={item.mood} key={index}>
                            <Box
                                component='span'
                                sx={{
                                    mt: 1,
                                    fontSize: '1.6em'
                                }}
                            >
                                {item.icon}
                            </Box>

                            <span style={{ paddingLeft: '.5em' }}>
                                {item.text}
                            </span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                id="filter"
                label="Search"
                variant="outlined"
                size="small"
                value={filter}
                onChange={event => setFilter(event.target.value)}
                onKeyDown={handleKeyDown}
                sx={{
                    mt: 1.5,
                    mb: 0.5,
                    mx: 1,
                    '& .MuiInputBase-root': {
                        height: '40px'
                    }
                }}
            />

            <Button
                variant="contained"
                onClick={() => search()}
                sx={{
                    mt: 1.5,
                    height: '40px',
                    boxShadow: 'none'
                }}
            >
                Search
            </Button>

            {diaryList.map((entry, index) => (
                <DiaryEntry
                    entry={entry}
                    id={index}
                    key={index}
                />
            ))}

        </>
    )
}

export function DiaryEntry(prop: { entry: DiaryEntryType, id: number, show?: boolean }) {

    const { entry, id, show } = prop

    const navigate = useNavigate()

    const [expand, setExpand] = useState(show)

    const [openMap, setOpenMap] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState('')

    function handleEdit(): void {
        navigate(`/diaryedit/${entry.id}`, {
            state: entry
        })
    }

    const theme = useTheme()


    return (
        <>
            <Paper
                elevation={4}
                sx={{
                    display: 'flex',
                    p: 2,
                    m: 1.5,
                    borderRadius: 4,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #2c1b24 0%, #44263a 100%)'
                            : 'linear-gradient(135deg, #fff0f5 0%, #ffffff 100%)',
                    transition: '0.25s',
                    border: '1px solid #ffd6e7',

                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 8
                    }
                }}
            >

                {/* Mood */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                    }}
                >
                    <Typography sx={{ fontSize: '52px' }}>
                        {moodList[entry.mood].icon}
                    </Typography>
                </Box>

                {/* Content */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1
                    }}
                >

                    {/* Date */}
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            color: 'gray'
                        }}
                    >
                        {entry.date.toLocaleString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>

                    {/* Title */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >

                        <Typography
                            onClick={() => setExpand(!expand)}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                color: '#d81b60'
                            }}
                        >
                            {entry.title}
                        </Typography>

                        {hasMap(entry.content) && (
                            <LocationOnIcon
                                sx={{
                                    color: '#e91e63',
                                    fontSize: '20px'
                                }}
                            />
                        )}

                    </Box>

                    {/* Content */}
                    {expand && (
                        <Fade in={expand}>
                            <Box sx={{ mt: 1 }}>

                                <Typography
                                    sx={{
                                        color: theme.palette.text.primary,
                                        lineHeight: 1.8
                                    }}
                                >
                                    {processContent(entry.content)}
                                </Typography>

                            </Box>
                        </Fade>
                    )}

                </Box>

                {/* Right Side */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        minWidth: 70,
                        gap: 1
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: '22px',
                            color: '#ffb300',
                            minHeight: 32,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {"★".repeat(entry.star)}
                    </Typography>

                    <Tooltip title="Edit Diary">
                        <IconButton
                            aria-label="edit"
                            onClick={handleEdit}
                            sx={{
                                backgroundColor: '#fff0f5',
                                '&:hover': {
                                    backgroundColor: '#ffd6e7'
                                }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>

                </Box>

            </Paper>

            {/* MAP POPUP */}
            <Dialog
                open={openMap}
                onClose={() => {
                    setOpenMap(false)
                    setSelectedLocation('')
                }}
                maxWidth="lg"
                fullWidth
                keepMounted={false}
            >


                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #e91e63 0%, #ff80ab 100%)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    📍 Memory Location
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>

                    <Map loc={selectedLocation} />


                </DialogContent>

                <DialogActions>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenMap(false)}
                    >
                        Close
                    </Button>

                </DialogActions>

            </Dialog>
        </>
    )

    function processContent(text: string) {

        // ✅ remove html tags
        text = text.replace(/<[^>]*>/g, '')

        // ✅ remove html entities like &nbsp;
        text = text.replace(/&nbsp;/g, ' ')

        const regex = /\[(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\]/g

        const elements = []
        let lastIndex = 0
        let match

        while ((match = regex.exec(text)) !== null) {

            const lat = match[1]
            const lng = match[3]

            // normal text before map
            if (match.index > lastIndex) {
                elements.push(
                    <span key={`text-${match.index}`}>
                        {text.substring(lastIndex, match.index).trimEnd()}
                        {" "}
                    </span>
                )
            }

            // map button
            elements.push(
                <Box
                    key={`map-${match.index}`}
                    onClick={() => {
                        setSelectedLocation(`${lat},${lng},19`)
                        setOpenMap(true)
                    }}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        ml: 2,
                        mx: 0.5,
                        mt: 1,
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #ffe4ec 0%, #ffd6e7 100%)',
                        color: '#d81b60',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.2s',
                        boxShadow: 2,

                        '&:hover': {
                            background: '#ffc1d6',
                            transform: 'scale(1.03)'
                        }
                    }}
                >
                    <LocationOnIcon fontSize="small" />
                    View Memory Location
                </Box>
            )

            lastIndex = regex.lastIndex
        }

        // remaining text
        if (lastIndex < text.length) {
            elements.push(
                <span key="last-text">
                    {text.substring(lastIndex)}
                </span>
            )
        }

        return elements
    }
    function hasMap(text: string): boolean {
        const regex = /\[(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\]/g
        return regex.test(text)
    }

}

export default DiaryList
