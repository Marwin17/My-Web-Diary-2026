/*
 * File: src/screens/Dashboard.tsx
 * Authors: Mary Allison Chen, Marwin Tan, Julia Irene Sia
 * Created: May 5, 2026
 * Description: Component that displays user dashboard with statistics, recent entries, and mood/star charts.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import { useEffect, useState, useCallback } from "react"
import type { Session } from '@supabase/supabase-js'

import {
    Typography,
    Card,
    CardContent,
    Box,
    Divider,
    Button,
    LinearProgress,
    Stack
} from "@mui/material"

import { moodList, type DiaryEntryType } from "../diary/Diary"
import { supabase } from "../supabaseClient"
import { DiaryEntry } from "../diary/DiaryList"

import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts"

import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import StarIcon from '@mui/icons-material/Star'

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

const MOOD_MAP: Record<number, { name: string, color: string }> =
    moodList.reduce((map, item) => {

        map[item.mood] = {
            name: item.text,
            color: MOOD_COLORS[item.mood] ?? '#8884d8'
        }

        return map

    }, {} as Record<number, { name: string, color: string }>)

function Dashboard() {
    console.log('📊 Dashboard component mounted')

    const navigate = useNavigate()
    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [count, setCount] = useState(0)

    const [latestEntry, setLatestEntry] =
        useState<DiaryEntryType | null>(null)

    const [moodDist, setMoodDist] =
        useState<{ name: string, value: number }[]>([])

    const [starDist, setStarDist] = useState([
        { star: '⭐', value: 0 },
        { star: '⭐⭐', value: 0 },
        { star: '⭐⭐⭐', value: 0 },
        { star: '⭐⭐⭐⭐', value: 0 },
        { star: '⭐⭐⭐⭐⭐', value: 0 }
    ])

    const activeUserId = session?.user?.id ?? null

    const resetDashboard = useCallback(() => {
        setLatestEntry(null)
        setCount(0)
        setMoodDist([])
        setStarDist([
            { star: '⭐', value: 0 },
            { star: '⭐⭐', value: 0 },
            { star: '⭐⭐⭐', value: 0 },
            { star: '⭐⭐⭐⭐', value: 0 },
            { star: '⭐⭐⭐⭐⭐', value: 0 }
        ])
    }, [])

    const fetchDashboardData = useCallback(async (userId: string | null) => {
        console.log('🔄 Dashboard: Fetching data...')

        if (!userId) {
            console.log('🔄 Dashboard: No active user, clearing data')
            resetDashboard()
            return
        }

        try {
            const { data, error } = await supabase
                .from('entries')
                .select('id, title, content, mood, star, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) {
                console.warn('⚠️ Dashboard: Entries query error:', error)
                resetDashboard()
                return
            }

            const entries = Array.isArray(data) ? data : []
            setCount(entries.length)

            if (entries.length > 0) {
                const latestEntryData = entries[0]
                setLatestEntry({
                    id: latestEntryData.id,
                    date: new Date(latestEntryData.created_at ?? new Date().toISOString()),
                    title: latestEntryData.title ?? '',
                    mood: latestEntryData.mood ?? 0,
                    content: latestEntryData.content ?? '',
                    star: latestEntryData.star ?? 0,
                    attachments: []
                })
            } else {
                setLatestEntry(null)
            }

            const moodCounts: Record<string, number> = {}
            const starCounts: Record<number, number> = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            }

            entries.forEach(entry => {
                const moodKey = typeof entry.mood === 'number' && MOOD_MAP[entry.mood] ? entry.mood : 1
                const moodLabel = MOOD_MAP[moodKey].name
                moodCounts[moodLabel] = (moodCounts[moodLabel] || 0) + 1

                const starValue = Number(entry.star)
                if (starValue >= 1 && starValue <= 5) {
                    starCounts[starValue] += 1
                }
            })

            setMoodDist(Object.keys(moodCounts).map(k => ({ name: k, value: moodCounts[k] })))
            setStarDist([
                { star: '⭐', value: starCounts[1] },
                { star: '⭐⭐', value: starCounts[2] },
                { star: '⭐⭐⭐', value: starCounts[3] },
                { star: '⭐⭐⭐⭐', value: starCounts[4] },
                { star: '⭐⭐⭐⭐⭐', value: starCounts[5] }
            ])
        } catch (err) {
            console.error('❌ Dashboard: Error fetching dashboard data', err)
            resetDashboard()
        }
    }, [resetDashboard])

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return
            setSession(data.session)
            setAuthLoading(false)
        }).catch((error) => {
            console.error('Dashboard: failed to get session', error)
            if (mounted) {
                setSession(null)
                setAuthLoading(false)
            }
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!mounted) return
            setSession(newSession)
            setAuthLoading(false)
        })

        return () => {
            mounted = false
            if (listener) {
                listener.subscription?.unsubscribe?.()
            }
        }
    }, [])

    useEffect(() => {
        if (authLoading) return

        if (!activeUserId) {
            resetDashboard()
            return
        }

        let mounted = true

        fetchDashboardData(activeUserId)

        const onFocus = () => fetchDashboardData(activeUserId)
        window.addEventListener('focus', onFocus)

        const channel = supabase
            .channel('dashboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'entries',
                    filter: `user_id=eq.${activeUserId}`
                },
                () => {
                    if (!mounted) return
                    setTimeout(() => fetchDashboardData(activeUserId), 200)
                }
            )
            .subscribe()

        return () => {
            mounted = false
            window.removeEventListener('focus', onFocus)
            try {
                supabase.removeChannel(channel)
            } catch {
                // ignore cleanup failures
            }
        }
    }, [activeUserId, authLoading, fetchDashboardData])

    return (

        <Box
            sx={{
                p: { xs: 2, md: 4 },
                bgcolor: 'background.default',
                minHeight: '100vh'
            }}
        >

            {/* HEADER */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'flex-start',
                        sm: 'center'
                    },
                    flexDirection: {
                        xs: 'column',
                        sm: 'row'
                    },
                    gap: 2,
                    mb: 4
                }}
            >

                <Box>

                    <Typography
                        variant="h3"
                        fontWeight="800"
                        sx={{
                            color: 'primary.main'
                        }}
                    >
                        Welcome Back!
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mt: .5
                        }}
                    >
                        Your emotions and memories all in one place ✨
                    </Typography>

                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/diaryedit')}
                    sx={{
                        borderRadius: 100,
                        px: 3,
                        py: 1.2,
                        fontWeight: 700,
                        background:
                            'linear-gradient(45deg, #ff2e7a, #ff0055)',
                        boxShadow: 4
                    }}
                >
                    New Entry
                </Button>

            </Box>

            {/* DASHBOARD GRID */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 3,
                    alignItems: 'stretch'
                }}
            >

                <Card
                    sx={{
                        width: '100%',
                        borderRadius: 5,
                        boxShadow: 4,
                        bgcolor: 'background.paper',
                        transition: '.2s',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            transform: 'translateY(-4px)'
                        }
                    }}
                >

                    <CardContent>

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >

                            <Typography
                                color="text.secondary"
                                fontWeight={700}
                            >
                                Total Memories
                            </Typography>

                            <FavoriteIcon
                                sx={{
                                    color: '#ff4081'
                                }}
                            />

                        </Stack>

                        <Typography
                            variant="h1"
                            fontWeight="800"
                        >
                            {count}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography
                            color="text.secondary"
                        >
                            You have written {count} diary entries filled with memories and emotions.
                        </Typography>

                    </CardContent>

                </Card>

                <Card
                    sx={{
                        width: '100%',
                        borderRadius: 5,
                        boxShadow: 4,
                        transition: '.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)'
                        }
                    }}
                >

                    <CardContent>

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                        >

                            <Typography
                                variant="h6"
                                fontWeight="700"
                            >
                                Emotion Journal
                            </Typography>

                            <AutoAwesomeIcon
                                sx={{
                                    color: '#ff9800'
                                }}
                            />

                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                        >
                            Your emotional journey based on diary moods.
                        </Typography>

                        <Box
                            sx={{
                                width: '100%',
                                minHeight: 320,
                                height: 320,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >

                            {moodDist.length === 0 ? (
                                <Typography color="text.secondary">
                                    No mood data available yet.
                                </Typography>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height={320}
                                >

                                    <PieChart>

                                        <Pie
                                            data={moodDist}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            label
                                        >

                                        {moodDist.map((entry, index) => {

                                            const moodItem =
                                                moodList.find(
                                                    item =>
                                                        item.text === entry.name
                                                )

                                            return (
                                                <Cell
                                                    key={index}
                                                    fill={
                                                        moodItem
                                                            ? MOOD_COLORS[moodItem.mood]
                                                            : '#8884d8'
                                                    }
                                                />
                                            )
                                        })}

                                    </Pie>

                                    <Tooltip />
                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>
                            )}

                        </Box>

                    </CardContent>

                </Card>

                <Card
                    sx={{
                        width: '100%',
                        borderRadius: 5,
                        boxShadow: 4,
                        bgcolor: 'background.paper',
                        transition: '.2s',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            transform: 'translateY(-4px)'
                        }
                    }}
                >

                    <CardContent>

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                        >

                            <Typography
                                variant="h6"
                                fontWeight="700"
                            >
                                Rating Overview
                            </Typography>

                            <StarIcon
                                sx={{
                                    color: '#ffb300'
                                }}
                            />

                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={3}
                        >
                            Distribution of your diary ratings.
                        </Typography>

                        <Stack spacing={3}>

                            {starDist.map((item) => {

                                const percentage =
                                    count > 0
                                        ? (item.value / count) * 100
                                        : 0

                                return (

                                    <Box key={item.star}>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                mb: .8
                                            }}
                                        >

                                            <Typography
                                                fontWeight={700}
                                            >
                                                {item.star}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#ff9800'
                                                }}
                                            >
                                                {item.value}
                                            </Typography>

                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                                height: 12,
                                                borderRadius: 10,
                                                bgcolor: 'divider',

                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 10,
                                                    background: 'linear-gradient(90deg, #ffb300, #ff6f00)'
                                                }
                                            }}
                                        />

                                    </Box>
                                )
                            })}

                        </Stack>

                    </CardContent>

                </Card>

            </Box>
            <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                    mt: 5,
                    mb: 2
                }}
            >
                Recent Entries
            </Typography>

            <Box
                sx={{
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: 4
                }}
            >

                {latestEntry ? (
                    <DiaryEntry
                        entry={latestEntry}
                        show={true}
                        id={0}
                    />
                ) : (
                    <Typography sx={{ p: 3, color: 'text.secondary' }}>
                        No diary entries yet.
                    </Typography>
                )}

            </Box>

        </Box>
    )
}

export default Dashboard