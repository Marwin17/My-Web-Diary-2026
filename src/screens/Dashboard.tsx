import { useEffect, useState, useCallback } from "react"
import { Typography, Card, CardContent, Box, Divider, Button } from "@mui/material"
import GridMui from "@mui/material/Grid"
import type { GridProps as MuiGridProps, GridSize } from "@mui/material/Grid"
import { sampleDiary, moodList, type DiaryEntryType } from "../diary/Diary"
import { DiaryEntry } from "../diary/DiaryList"
import { user } from "../App"
import { supabase } from "../supabaseClient"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router"

// local Grid wrapper so existing JSX using size={{ xs: 12, md: 4 }} continues to work
type SizeProp = {
    xs?: GridSize,
    sm?: GridSize,
    md?: GridSize,
    lg?: GridSize,
    xl?: GridSize
}
type WrappedGridProps = MuiGridProps & { size?: SizeProp }
const Grid = (props: WrappedGridProps) => {
    const { size, children, ...rest } = props
    if (size) {
        const itemProps: any = { item: true }
        if (typeof size.xs !== 'undefined') itemProps.xs = size.xs
        if (typeof size.sm !== 'undefined') itemProps.sm = size.sm
        if (typeof size.md !== 'undefined') itemProps.md = size.md
        if (typeof size.lg !== 'undefined') itemProps.lg = size.lg
        if (typeof size.xl !== 'undefined') itemProps.xl = size.xl
        return (
            <GridMui {...itemProps} {...(rest as any)}>
                {children}
            </GridMui>
        )
    }
    return <GridMui {...(rest as any)}>{children}</GridMui>
}

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

    // fetch data (uses supabase.auth.getUser to avoid depending on a non-reactive import)
    const fetchDashboardData = useCallback(async () => {
        try {
            const { data: sessionData } = await supabase.auth.getUser()
            const activeUser = sessionData?.user ?? user.session?.user
            const activeUserId = activeUser?.id

            if (!activeUserId) {
                setLatestEntry(null)
                setCount(0)
                setMoodDist([])
                return
            }

            const [latestRes, countRes, moodRes] = await Promise.all([
                supabase
                    .from('entries')
                    .select('*')
                    .eq('user_id', activeUserId)
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: false })
                    .limit(1)
                    .maybeSingle(),

                supabase
                    .from('entries')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', activeUserId),

                supabase
                    .from('entries')
                    .select('mood')
                    .eq('user_id', activeUserId)
            ])

            if (latestRes?.data) {
                setLatestEntry({
                    id: latestRes.data.id,
                    date: new Date(latestRes.data.created_at ?? new Date().toISOString()),
                    title: latestRes.data.title ?? '',
                    mood: latestRes.data.mood ?? 0,
                    content: latestRes.data.content ?? '',
                    star: latestRes.data.star ?? 0,
                    attachments: (latestRes.data as any).attachments ?? []
                })
            } else {
                setLatestEntry(null)
            }

            setCount(typeof countRes?.count === 'number' ? countRes.count : 0)

            if (Array.isArray(moodRes?.data)) {
                const counts: Record<string, number> = {}
                moodRes.data.forEach(item => {
                    const moodKey = typeof item.mood === 'number' && MOOD_MAP[item.mood] ? item.mood : 1
                    const label = MOOD_MAP[moodKey].name
                    counts[label] = (counts[label] || 0) + 1
                })
                setMoodDist(Object.keys(counts).map(k => ({ name: k, value: counts[k] })))
            } else {
                setMoodDist([])
            }
        } catch (err) {
            console.error('Error fetching dashboard data', err)
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
        window.addEventListener('focus', fetchDashboardData)

        let channelRef: any = null
        ;(async () => {
            try {
                const { data: sessionData } = await supabase.auth.getUser()
                const activeUserId = sessionData?.user?.id ?? user.session?.user?.id
                const filter = activeUserId ? { filter: `user_id=eq.${activeUserId}` } : {}

                channelRef = supabase
                    .channel('dashboard-updates')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'entries',
                            ...filter
                        },
                        () => setTimeout(fetchDashboardData, 200)
                    )
                    .subscribe()
            } catch (err) {
                console.warn('Realtime channel initialization failed', err)
            }
        })()

        return () => {
            window.removeEventListener('focus', fetchDashboardData)
            if (channelRef) {
                try { supabase.removeChannel(channelRef) } catch (e) { /* ignore */ }
            }
        }
    }, [fetchDashboardData])

    // custom label renderer for outside labels with percentages
    const renderCustomizedLabel = (props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props
        const RADIAN = Math.PI / 180
        const radius = outerRadius + (outerRadius - innerRadius) * 0.25 // push labels a bit further out
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)
        const textAnchor = x > cx ? 'start' : 'end'
        const name = moodDist[index]?.name ?? ''
        const valueText = `${(percent * 100).toFixed(0)}%`
        return (
            <text x={x} y={y} fill="#333" textAnchor={textAnchor} dominantBaseline="central" style={{ fontSize: 13 }}>
                {name} <tspan fill="#999"> {valueText}</tspan>
            </text>
        )
    }

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
                        <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" fontWeight="600" gutterBottom>Mood Distribution</Typography>

                            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* Chart area with enough height for outside labels */}
                                <Box sx={{ width: '100%', maxWidth: 640, height: 320 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 10 }}>
                                            <Pie
                                                data={moodDist}
                                                dataKey="value"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={6}
                                                labelLine={true}
                                                label={renderCustomizedLabel}
                                            >
                                                {moodDist.map((entry, index) => {
                                                    const moodItem = moodList.find(item => item.text === entry.name)
                                                    return <Cell key={`cell-${index}`} fill={moodItem ? MOOD_COLORS[moodItem.mood] : '#8884d8'} />
                                                })}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>

                                {/* Horizontal legend centered below the pie */}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 1 }}>
                                    {moodDist.length === 0 ? (
                                        <Typography color="textSecondary">No data</Typography>
                                    ) : moodDist.map((m) => {
                                        const moodItem = moodList.find(item => item.text === m.name)
                                        const color = moodItem ? MOOD_COLORS[moodItem.mood] : '#8884d8'
                                        return (
                                            <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 14, height: 14, backgroundColor: color, borderRadius: 1 }} />
                                                <Typography sx={{ fontSize: '.95rem' }}>{m.name}</Typography>
                                            </Box>
                                        )
                                    })}
                                </Box>
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
                    show={true}
                    id={0}
                />
            </Box>
        </Box>
    )
}

export default Dashboard