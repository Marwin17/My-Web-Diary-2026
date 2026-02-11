import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import { blue } from "@mui/material/colors"
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useState } from "react"

function DiaryList() {
    const diarylist = sampleDiary

    return (
        <Box sx={{ p: 2 }}>
            {diarylist.map((entry, index) => (
                <DiaryEntry entry={entry} key={index} />
            ))}
        </Box>
    )
}

export function DiaryEntry(prop: { entry: DiaryEntryType, show?: Boolean }) {
    const { entry, show } = prop
    const [expand, setExpand] = useState(show)

   
    const starIcons = "★".repeat(entry.star)

    return (
        <Paper elevation={1} sx={{
            display: 'flex',
            p: 1,
            backgroundColor: blue[100],
            mb: 1 
        }}>

            <Typography sx={{ fontSize: '48px' }}>
                {moodList[entry.mood].icon}
            </Typography>

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                pl: 1,
                flexGrow: 1, 
            }}>
                <Typography sx={{ textAlign: 'left' }}>
                    {entry.date.toUTCString()}
                </Typography>
                <Typography onClick={() => setExpand(!expand)} sx={{ cursor: 'pointer' }}>
                    {entry.title}
                </Typography>
                {expand && (
                    <Typography>
                        {entry.content}
                    </Typography>
                )}
            </Box>

            {
            }
            {/* Gradient Star Display */}
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
                {starIcons}
            </Typography>

        </Paper>
    )
}

export default DiaryList