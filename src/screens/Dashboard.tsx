import { useEffect, useState } from "react"

import { Typography } from "@mui/material"
import { sampleDiary, type DiaryEntryType } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"
import { user } from "../App"
import { supabase } from "../supabaseClient"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

function Dashboard() {

    const [count, setCount] = useState(0)
    const [entry, setEntry] = useState<DiaryEntryType | null>(null)

    useEffect(() => {
        supabase.from('entries').select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(1)
            .then(({ data, error, count }) => {
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

    const moodDist = [
        { name: 'Happy', value: 3 },
        { name: 'Excited', value: 2 },
        { name: 'Love', value: 7 },
        { name: 'Hungry', value: 5 },
        { name: 'Angry', value: 5 },
    ]
    const totalMood = moodDist.reduce((accumulator, current) => accumulator + current.value, 0)

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <>
            <Typography>Dashboard Po ito talaga....</Typography>

            <Typography>Number of entries: {user.email ? count : sampleDiary.length}</Typography>

            <Typography>Latest entry</Typography>
            <DiaryEntry entry={user.email && entry ? entry : sampleDiary[0]} id={0} show={true} />
            <div style={{ width: '100%', height: 400 }}>
                <h2>Moody</h2>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={moodDist}
                            cx="50%" // Horizontal center
                            cy="50%" // Vertical center
                            labelLine={false}
                            label={({ name, value }) => `${name} ${(value / totalMood * 100).toFixed(0)}%`}
                            outerRadius={95
                            }
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {moodDist.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}

export default Dashboard
