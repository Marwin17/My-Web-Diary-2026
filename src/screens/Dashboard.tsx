import { useEffect, useState, useCallback } from "react"
import { Typography, Card, CardContent, Box, Divider, Button, Grid } from "@mui/material"
import { sampleDiary, moodList, type DiaryEntryType } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"
import { user } from "../App"
import { supabase } from "../supabaseClient"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router"

const MOOD_COLORS: Record<number, string> = {
    0: '#d4a302', 1: '#109900', 2: '#ee0000', 3: '#fc7b03',
    4: '#ff0000', 5: '#ee00ee', 6: '#0468bf', 7: '#5a5ae8',
    8: '#888888', 9: '#dd0000',
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

    // 1. Wrap fetch logic in useCallback so it can be reused by the real-time listener
    const fetchDashboardData = useCallback(async () => {
        const activeUserId = user.session?.user?.id;
        if (!user.email || !activeUserId) return;

        // Fetch count, latest entry, and moods in parallel for better performance
        const [latestRes, countRes, moodRes] = await Promise.all([
            supabase
                .from('entries')
                .select('*')
                .eq('user_id', activeUserId)
                .order('created_at', { ascending: false })
                .order('id', { ascending: false }) // Ensures absolute latest is always first
                .limit(1)
                .maybeSingle(), // Safely fetches just one item without array errors
            
            supabase
                .from('entries')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', activeUserId),

            supabase
                .from('entries')
                .select('mood')
                .eq('user_id', activeUserId)
        ]);

        // Process Latest Entry
        if (latestRes.data) {
            setLatestEntry({
                id: latestRes.data.id,
                date: new Date(latestRes.data.created_at ?? new Date().toISOString()),
                title: latestRes.data.title ?? '',
                mood: latestRes.data.mood ?? 0,
                content: latestRes.data.content ?? '',
                star: latestRes.data.star ?? 0
            });
        } else {
            setLatestEntry(null);
        }

        // Process Count
        setCount(countRes.count ?? 0);

        // Process Moods for Chart
        if (moodRes.data) {
            const counts: Record<string, number> = {};
            moodRes.data.forEach(item => {
                const moodKey = typeof item.mood === 'number' && MOOD_MAP[item.mood] ? item.mood : 1;
                const label = MOOD_MAP[moodKey].name;
                counts[label] = (counts[label] || 0) + 1;
            });
            setMoodDist(Object.keys(counts).map(key => ({ name: key, value: counts[key] })));
        }
    }, []);

    useEffect(() => {
        // 2. Initial Fetch
        fetchDashboardData();

        // 3. Force refresh if user clicks away to another tab and comes back
        window.addEventListener('focus', fetchDashboardData);

        // 4. Set up Realtime Subscription
        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'entries',
                    filter: `user_id=eq.${user.session?.user?.id}` // Only listen to this user's changes
                },
                () => {
                    console.log("Change detected! Refreshing dashboard...");
                    setTimeout(fetchDashboardData, 200); // 200ms delay ensures DB is ready
                }
            )
            .subscribe();

        // Cleanup subscription and listeners on unmount
        return () => {
            window.removeEventListener('focus', fetchDashboardData);
            supabase.removeChannel(channel);
        }
    }, [user.email, user.session?.user?.id, fetchDashboardData]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
                <Typography variant="h4" fontWeight="700" color="primary">Welcome Back!</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/diaryedit')} sx={{ borderRadius: 20 }}>
                    New Entry
                </Button>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
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

                <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
                    <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3, width: '100%' }}>
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>Mood Distribution</Typography>
                            <Box sx={{ width: '100%', height: 300, minHeight: 300, flex: 1, overflow: 'hidden' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, right: 40, left: 40, bottom: 0 }}>
                                        <Pie
                                            data={moodDist}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50} 
                                            outerRadius={70} 
                                            paddingAngle={6.5}
                                            dataKey="value"
                                            labelLine={true}
                                            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {moodDist.map((entry, index) => {
                                                const moodItem = moodList.find(item => item.text === entry.name);
                                                return <Cell key={`cell-${index}`} fill={moodItem ? MOOD_COLORS[moodItem.mood] : '#8884d8'} />;
                                            })}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
                Latest Entry
            </Typography>
            <Box sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                <DiaryEntry
                    entry={user.email && latestEntry ? latestEntry : sampleDiary[0]}
                    show={true} id={0}                    // NOTICE: 'id={0}' HAS BEEN DELETED FROM HERE!
                />
            </Box>
        </Box>
    )
}

export default Dashboard