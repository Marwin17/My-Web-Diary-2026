import { useEffect, useState } from "react"

import { Typography } from "@mui/material"
import { sampleDiary, type DiaryEntryType } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"
import { user } from "../App"
import { supabase } from "../supabaseClient"

function Dashboard() {

    const [count, setCount] = useState(0)
    const [entry, setEntry] = useState<DiaryEntryType | null>(null)

    useEffect(() => {
        // TODO sort later
        supabase.from('entries').select('*', { count: 'exact' }).then(({ data, error, count }) => {
            console.log(data)
            console.log(error)
            if (!error) {
                setCount(count ?? 0)
                if (count ?? 0 > 0) {
                    const item = data[0]
                    console.log(item)
                    const entry = {
                        date: item.created_at ? new Date(item.created_at) : new Date(),
                        title: item.title ?? '',
                        mood: item.mood ?? 1,
                        content: item.content ?? '',
                        star: item.star ?? 1,
                    }
                    setEntry(entry)
                }
            }
        })
    }, [user.email])

    return (
        <>
            <Typography>Dashboard Po ito talaga....</Typography>

            <Typography>Number of entries: {user.email ? count : sampleDiary.length}</Typography>

            <Typography>Latest entry</Typography>
            <DiaryEntry entry={user.email && entry ? entry : sampleDiary[0]} id={0} show={true} />
        </>
    )
}

export default Dashboard
