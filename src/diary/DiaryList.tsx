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
import type { PostgrestError } from "@supabase/supabase-js"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

function DiaryList({ results }: { results?: any[] }) {

    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])
    const [filter, setFilter] = useState('')
    const [filterMood, setFilterMood] = useState(-1)

    // ✅ EXISTING (DB fetch)
    useEffect(() => {
        if (!results || results.length === 0) {
            loadEntries()
        }
    }, [user.email, results])

    // ✅ ADD THIS HERE (search results override)
    useEffect(() => {
        if (results && results.length > 0) {
            const entries = results.map(item => ({
                id: item.id,
                date: item.created_at ? new Date(item.created_at) : new Date(),
                title: item.title ?? '',
                mood: item.mood ?? 1,
                content: item.content ?? '',
                star: item.star ?? 1,
            }))
            setDiaryList(entries)
        }
    }, [results])

    // ⬇️ THEN your functions
    function loadEntries() {
        let query = supabase
            .from('entries')
            .select()

        // 🔹 apply text search
        if (filter) {
            query = query.textSearch('search_vector', filter, { type: 'websearch' })
        }

        // 🔹 apply mood filter (ONLY if not "All" = -1)
        if (filterMood !== -1) {
            query = query.eq('mood', filterMood)
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
            <FormControl size="small" sx={{ mx: 0.5, mt: 1.5, minWidth: 100 }}>
                <InputLabel id="mood-label">Mood</InputLabel>
                <Select
                    labelId="mood-label"
                    id="mood-select"
                    value={filterMood}
                    label="Mood"
                    onChange={(event) => {
                        //TODO entry.mood = event.target.value as number
                        setFilterMood(event.target.value as number)
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
                    '& .MuiInputBase-root': { height: '40px' }
                }}
            />
            <Button variant="contained" onClick={() => search()}
                sx={{
                    mt: 1.5,
                    height: '40px',
                    boxShadow: 'none'
                }}>Search</Button>
            {diaryList.map((entry, index) => (
                <DiaryEntry entry={entry} id={index} key={index} />
            ))}
        </>
    )
}

export function DiaryEntry(prop: { entry: DiaryEntryType, id: number, show?: boolean }) {

    const { entry, id, show } = prop

    const navigate = useNavigate()

    const [expand, setExpand] = useState(show)

    function handleEdit(): void {
        navigate(`/diaryedit/${entry.id}`, {
            state: entry
        })
    }

    const theme = useTheme()

    return (
        <Paper elevation={1} sx={{
            display: 'flex',
            p: 1,
            m: 1,
            backgroundColor: green[theme.palette.mode === 'dark' ? 800 : 100],
        }}>

            <Typography sx={{ fontSize: '48px' }}>
                {moodList[entry.mood].icon}
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                pl: 1,
            }}>
                <Typography sx={{ textAlign: 'left' }}>
                    {entry.date.toLocaleString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Typography>
                <Typography onClick={() => setExpand(!expand)} >
                    {entry.title}
                </Typography>
                {expand && (
                    <Typography>
                        <div dangerouslySetInnerHTML={{ __html: processContent(entry.content) }}></div>
                    </Typography>
                )}
            </Box>
            <Typography sx={{ fontSize: '24px', color: '#cc9d02' }}>
                {"★".repeat(entry.star)}
            </Typography>
            <Tooltip title="Edit">
                <IconButton aria-label="edit" onClick={handleEdit}>
                    <EditIcon />
                </IconButton>
            </Tooltip>
        </Paper>
    )

    function processContent(text: string): string {
        // Match [lat,lng]
        const regex = /\[(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\]/g

        return text.replace(regex, (_, lat, _d1, lng) => {
            const loc = `${lat},${lng},19` // include zoom to match your Map.tsx
            return `<a href="/map/${loc}" style="color:#1976d2; text-decoration:underline;">
                    📍 (${lat}, ${lng})
                </a>`
        })
    }
}

export default DiaryList
