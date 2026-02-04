import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import { blue } from "@mui/material/colors"
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useState } from "react"

function DiaryList() {

    const diarylist = sampleDiary

    return (
        <>
            {diarylist.map((entry, index) => (
                <DiaryEntry entry={entry} key={index} />
            ))}
        </>
    )
}

function DiaryEntry(prop: { entry: DiaryEntryType }) {

    const { entry } = prop

    const [expand, setExpand] = useState(false)

    return (
        <Paper elevation={1} sx={{
            display: 'flex',
            p: 1,
            backgroundColor: blue[100],
        }}>

            <Typography sx={{ fontSize: '48px' }}>
                {moodList[entry.mood].icon}
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                pl: 1,
            }}>
                <Typography sx={{ textAlign: 'left' }}>
                    {entry.date.toUTCString()}
                </Typography>
                <Typography onClick={() => setExpand(!expand)}>
                    {entry.title}
                </Typography>
                {expand && (
                    <Typography>
                        {entry.content}
                    </Typography>
                )}

            </Box>
        </Paper>
    )

}

export default DiaryList 
