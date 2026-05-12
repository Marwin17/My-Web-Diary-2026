/*
 * File: src/screens/DiaryItems.tsx
 * Authors: Marwin Tan, Mary Allison Chen
 * Created: Feb 11, 2026
 * Description: Component that fetches and displays list of diary entries with search functionality.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import Fab from "@mui/material/Fab"
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useNavigate } from "react-router";
import DiaryList from "../diary/DiaryList";
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type DiaryItemsProps = {
    results?: any[]
}

function DiaryItems({ results: searchResults }: DiaryItemsProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return
            setSession(data.session)
            setAuthLoading(false)
        }).catch((error) => {
            console.error('DiaryItems: failed to get session', error)
            if (mounted) {
                setSession(null)
                setAuthLoading(false)
            }
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return
            setSession(session)
            setAuthLoading(false)
        })

        return () => {
            mounted = false
            listener.subscription?.unsubscribe?.()
        }
    }, [])

    useEffect(() => {
        if (searchResults !== undefined) {
            setResults(searchResults)
            setLoadError(searchResults.length === 0 ? 'No memories found.' : '')
            setLoading(false)
            return
        }

        const fetchDiaryEntries = async () => {
            if (authLoading) {
                console.log('📖 DiaryItems: Auth still loading, skipping fetch')
                return
            }

            if (!session?.user) {
                console.warn('⚠️ DiaryItems: No active user session available')
                setLoadError('You must be signed in to view diary entries.')
                setResults([])
                setLoading(false)
                return
            }

            console.log('📖 DiaryItems: Starting fetch for user:', session.user.id)

            try {
                console.log('📖 DiaryItems: Fetching diary entries...')
                const activeUserId = session.user.id

                const { data, error } = await supabase
                    .from('entries')
                    .select('*')
                    .eq('user_id', activeUserId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ DiaryItems: Error fetching entries:', error);
                    setLoadError(error.message ?? 'Unable to load your diary entries.');
                    setResults([]);
                } else {
                    console.log('✅ DiaryItems: Fetched entries:', data?.length || 0, 'entries');
                    setLoadError('');
                    setResults(data || []);
                }
            } catch (err) {
                console.error('❌ DiaryItems: Failed to fetch entries:', err);
                setLoadError('Unable to load your diary entries.');
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDiaryEntries();
    }, [searchResults, authLoading, session]);

    console.log('📖 DiaryItems component mounted, results:', results?.length);

    return (
        <>
            <Box sx={{ width: '100%', minHeight: '70vh', p: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 6 }}>
                        <CircularProgress />
                        <Typography color="text.secondary">Fetching your memories...</Typography>
                    </Box>
                ) : loadError ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 6 }}>
                        <Typography color="error" fontWeight={600}>{loadError}</Typography>
                        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
                    </Box>
                ) : (
                    <DiaryList results={results} />
                )}
            </Box>

            <Fab
                color="secondary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    right: '16px',
                    bottom: '16px'
                }}
                onClick={() => navigate('/diaryedit')}
            >
                <AddIcon />
            </Fab>
        </>
    );
}

export default DiaryItems;