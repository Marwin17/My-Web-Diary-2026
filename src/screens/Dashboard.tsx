import { useEffect, useState } from "react"
import Grid from "@mui/material/GridLegacy"
import { Typography, Card, CardContent, Box, Divider, Button } from "@mui/material"
import { sampleDiary, moodList, type DiaryEntryType } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"
import { user } from "../App"
import { supabase } from "../supabaseClient"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router"

const MOOD_COLORS: Record<number, string> = {
    0: '#d4a302',
    1: '#109900',
    2: '#ee0000',
    3: '#fc7b03',
    4: '#ff0000',
    5: '#ee00ee',
    6: '#0468bf',
    7: '#5a5ae8',
    8: '#888888',
    9: '#dd0000',
}

const MOOD_MAP: Record<number, { name: string, color: string }> = moodList.reduce((map, item) => {
    map[item.mood] = {
        name: item.text,
        color: MOOD_COLORS[item.mood] ?? '#8884d8'
    }
    return map
}, {} as Record<number, { name: string, color: string }>)

function Dashboard() {
    const navigate = useNavigate()
    const [count, setCount] = useState(0)
    const [latestEntry, setLatestEntry] = useState<DiaryEntryType | null>(null)
    const [moodDist, setMoodDist] = useState<{ name: string, value: number }[]>([])

    useEffect(() => {
        if (!user.email) return;

        const fetchDashboardData = async () => {
            // 1. Fetch count and latest entry
            const { data: latest, count: totalCount } = await supabase
                .from('entries')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .limit(1);

            setCount(totalCount ?? 0);
            if (latest && latest.length > 0) {
                setLatestEntry({
                    id: latest[0].id,
                    date: new Date(latest[0].created_at ?? new Date().toISOString()),
                    title: latest[0].title ?? '',
                    mood: latest[0].mood ?? 0,
                    content: latest[0].content ?? '',
                    star: latest[0].star ?? 0
                });
            } else {
                setLatestEntry(null);
            }

            // 2. Fetch ALL moods to compute the chart dynamically
            const { data: allMoods } = await supabase
                .from('entries')
                .select('mood');

            if (allMoods) {
                const counts: Record<string, number> = {};
                allMoods.forEach(item => {
                    const moodKey = typeof item.mood === 'number' && MOOD_MAP[item.mood] ? item.mood : 1;
                    const label = MOOD_MAP[moodKey].name;
                    counts[label] = (counts[label] || 0) + 1;
                });

                const chartData = Object.keys(counts).map(key => ({
                    name: key,
                    value: counts[key]
                }));
                setMoodDist(chartData);
            }
        }

        fetchDashboardData();
    }, [user.email]);

    return (
        <Box sx={{ 
            p: { xs: 2, md: 4 }, // FIXED: Simplified padding so it is equal on all sides
            backgroundColor: '#f5f5f5', 
            minHeight: '100vh', 
            boxSizing: 'border-box', 
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
                <Typography variant="h4" fontWeight="700" color="primary">
                    Welcome Back!
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => navigate('/diaryedit')}
                    sx={{ borderRadius: 20 }}
                >
                    New Entry
                </Button>
            </Box>

            {/* FIXED: Removed width='100%' so the Grid's negative margins don't push it off-center */}
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                
                {/* Stats Summary Section */}
                {/* FIXED: Added 'item' prop, required for GridLegacy to handle padding correctly */}
                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3, width: '100%' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Memories</Typography>
                            <Typography variant="h2" fontWeight="bold">{count}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="textSecondary">
                                You have written {count} entries since you started your journey.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pie Chart Section */}
                <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3, width: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" gutterBottom>Mood Distribution</Typography>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={moodDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} 
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {moodDist.map((entry, index) => {
                                                const moodItem = moodList.find(item => item.text === entry.name);
                                                const fillColor = moodItem ? MOOD_COLORS[moodItem.mood] : '#8884d8';
                                                return <Cell key={`cell-${index}`} fill={fillColor} />;
                                            })}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>Latest Entry</Typography>
            <Box sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                <DiaryEntry 
                    entry={user.email && latestEntry ? latestEntry : sampleDiary[0]} 
                    id={0} 
                    show={true} 
                />
            </Box>
        </Box>
    )
}

export default Dashboard