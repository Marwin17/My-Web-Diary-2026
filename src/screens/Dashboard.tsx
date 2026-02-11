import { Typography } from "@mui/material"
import { sampleDiary } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"

function Dashboard() {

    return (
        <>
            <Typography>Dashboard Po alex tangpos</Typography>
            <Typography>number of entry: {sampleDiary.length}</Typography>
            <Typography>Latest enter</Typography>
            <DiaryEntry entry={sampleDiary[0]} show={true} />
        </>
    )
}

export default Dashboard
