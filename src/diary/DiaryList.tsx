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

function DiaryList() {

    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])

    useEffect(() => {
        // TODO sort later
        supabase.from('entries').select().then(({ data, error }) => {
            console.log(data)
            console.log(error)
            if (!error) {
                const entries = data.map(item => {
                    const entry = {
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
    }, [user.email])

    return (
        <>
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
        navigate(`/diaryedit/${id}`)
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
                        {entry.content}
                    </Typography>
                )}
            </Box>
            <Typography sx={{
                fontSize: '24px',
                pl: 1,
                alignSelf: 'flex-start',
                fontWeight: 'bold',
                // Gradient Logic:
                background: 'linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                // Fallback for older browsers
                display: 'inline-block'
            }}>
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
