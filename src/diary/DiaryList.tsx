import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'
import { blue } from "@mui/material/colors"
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useTheme } from "@mui/material/styles"
import { supabase } from "../supabaseClient"
import { user } from "../App"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

function DiaryList() {

    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])
    const [filter, setFilter] = useState('')

    useEffect(() => {
        loadEntries()
    }, [user.email])

    function loadEntries() {
        supabase.from('entries')
            .select()
            .or(`title.ilike.%${filter}%,content.ilike.%${filter}%`)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                console.log(data)
                console.log(error)
                if (!error) {
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
            })
    }

    function search() {
        loadEntries()
    }

    return (
        <>
            <TextField
                id="filter"
                label="Search"
                variant="outlined"
                size="small"
                value={filter}
                onChange={event => setFilter(event.target.value)}
                sx={{
                    mt: 1.5,
                    mb: 0.5,
                    mx: 1
                }}
            />
            <Button variant="contained" onClick={() => search()} sx={{ mt: 1.7 }}>Search</Button>
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
            backgroundColor: blue[theme.palette.mode === 'dark' ? 800 : 100],
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
                    {entry.date.toUTCString()}
                </Typography>
                <Typography onClick={() => setExpand(!expand)} >
                    {entry.title}
                </Typography>
                {expand && (
                    <Typography>
                        <div dangerouslySetInnerHTML={{ __html: entry.content }}></div>
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
}

export default DiaryList
