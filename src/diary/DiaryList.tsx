/*
 * File: src/diary/DiaryList.tsx
 * Authors: Mary Allison Chen, Marwin Tan, Julia Irene Sia
 * Created: jan 28, 2026
 * Description: Component that renders the list of diary entries with filtering, sorting, and pagination.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import { moodList, sampleDiary, type DiaryEntryType, type DiaryAttachment } from "./Diary"
import { useEffect, useState } from "react"
import type { Session } from '@supabase/supabase-js'
import { useNavigate } from "react-router"
import { useTheme } from "@mui/material/styles"
import { supabase } from "../supabaseClient"
import Button from "@mui/material/Button"
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import type { PostgrestError } from "@supabase/supabase-js"
import Pagination from '@mui/material/Pagination'
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Map from "../screens/Maps"
import Searchbar, { type SearchState } from "../screens/Searchbar"
import DOMPurify from 'dompurify'

function stripAttachmentLinks(html: string, attachments?: DiaryAttachment[]) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 1) Remove explicit file links referencing attachments (anchors + imgs)
    if (attachments?.length) {
        const attachmentUrls = attachments.map(a => a.url).filter(Boolean)
        doc.querySelectorAll('a').forEach(anchor => {
            const anchorText = anchor.textContent?.trim() ?? ''
            const href = anchor.getAttribute('href') ?? ''
            if (
                attachmentUrls.some(u => href.includes(u)) ||
                attachments.some(a => anchorText === a.name || anchorText.includes(a.name))
            ) {
                anchor.remove()
            }
        })

        // remove <img> tags referencing attachment URLs
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') ?? ''
            if (attachmentUrls.some(u => src.includes(u))) img.remove()
        })
    }

    // 2) Ensure structured location elements don't show any visible text
    doc.querySelectorAll('[data-lat][data-lng]').forEach(el => {
        // keep metadata attributes, but clear visible content
        el.textContent = ''
    })

    // 3) Remove visible bracket coordinates and any short appended label text from text-only nodes
    doc.querySelectorAll('*').forEach(el => {
        if (!el.children.length) {
            const inner = el.innerHTML
            // remove bracket coords + up to 100 chars of simple label following them
            const replaced = inner.replace(/(\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\])\s*[A-Za-z0-9_\-()., ]{0,100}/g, '')
            if (replaced !== inner) el.innerHTML = replaced
        }
    })

    // 4) Final cleanup: remove any stray bracket occurrences left
    const finalHtml = doc.body.innerHTML.replace(/\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\]/g, '')

    return DOMPurify.sanitize(finalHtml, {
        ALLOWED_TAGS: [
            'b',
            'i',
            'em',
            'strong',
            'p',
            'br',
            'ul',
            'ol',
            'li',
            'span',
            'div'
        ],
        ALLOWED_ATTR: [
            'data-lat',
            'data-lng',
            'data-name'
        ]
    })
}

// New helper: extract location blocks (prefer structured diary-loc elements, fallback to bracket pattern)
function extractLocationsFromHtml(html: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const locations: { lat: string, lng: string, name: string }[] = []

    // 1) Find elements with data-lat/data-lng (structured insertion)
    doc.querySelectorAll('[data-lat][data-lng]').forEach(el => {
        const lat = el.getAttribute('data-lat') ?? ''
        const lng = el.getAttribute('data-lng') ?? ''
        const name = el.getAttribute('data-name') ?? ''
        if (lat && lng) {
            locations.push({ lat, lng, name })
        }
    })

    // 2) Fallback: bracket coordinates like [lat, lng]
    if (locations.length === 0) {
        const bracketRegex = /\[(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/g
        let match
        while ((match = bracketRegex.exec(html)) !== null) {
            const lat = match[1]
            const lng = match[2]
            // we don't try to capture a visible label (user asked labels be hidden).
            const name = `${lat}, ${lng}`
            locations.push({ lat, lng, name })
        }
    }

    return locations
}

function DiaryList({ results }: { results?: any[] }) {
    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])

    const [searchParams, setSearchParams] = useState<SearchState>({
        filter: '',
        filterMood: -1,
        filterStar: -1,
        sortOrder: 'desc',
        sortByStar: 'none',
        dateFrom: '',
        dateTo: ''
    })

    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('favorite-diaries')
        return saved ? JSON.parse(saved) : []
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [favoritePage, setFavoritePage] = useState(1)
    const favoritesPerPage = 3
    const entriesPerPage = 10

    // ✅ ADD THIS HERE (search results override)
    useEffect(() => {

        // if the parent passed search results, show those and reset pagination
        if (Array.isArray(results)) {
            const entries = results.map(item => ({
                id: item.id,
                date: item.created_at
                    ? new Date(item.created_at)
                    : new Date(),
                title: item.title ?? '',
                mood: item.mood ?? 1,
                content: item.content ?? '',
                star: item.star ?? 1,
                attachments: item.attachments ?? []
            }))

            setDiaryList(entries)
            setCurrentPage(1)
            setFavoritePage(1)
            return
        }

        // normal loading when there are no external results
        if (!results && !authLoading) {
            loadEntries()
        }

    }, [results, session, authLoading])

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return
            setSession(data.session)
            setAuthLoading(false)
        }).catch((error) => {
            console.error('DiaryList: failed to get session', error)
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

    // NEW: respond immediately when search parameters change (instant search)
    useEffect(() => {
        // reset pagination and load entries using the new params
        setCurrentPage(1)
        setFavoritePage(1)
        loadEntries(searchParams)
    }, [searchParams])

    // NEW: listen for favorites changes (storage events from other tabs + custom same-tab event)
    useEffect(() => {
        function onStorage(e: StorageEvent) {
            if (e.key === 'favorite-diaries') {
                try {
                    const newFavs = e.newValue ? JSON.parse(e.newValue) : []
                    setFavorites(Array.isArray(newFavs) ? newFavs : [])
                } catch {
                    setFavorites([])
                }
            }
        }

        function onCustom(e: Event) {
            // event.detail contains updated array
            try {
                const detail = (e as CustomEvent).detail
                if (detail && Array.isArray(detail)) {
                    setFavorites(detail)
                } else {
                    const saved = localStorage.getItem('favorite-diaries')
                    setFavorites(saved ? JSON.parse(saved) : [])
                }
            } catch {
                const saved = localStorage.getItem('favorite-diaries')
                setFavorites(saved ? JSON.parse(saved) : [])
            }
        }

        window.addEventListener('storage', onStorage)
        window.addEventListener('favorite-diaries-updated', onCustom as EventListener)

        return () => {
            window.removeEventListener('storage', onStorage)
            window.removeEventListener('favorite-diaries-updated', onCustom as EventListener)
        }
    }, [])

    // ⬇️ THEN your functions
    function loadEntries(params: SearchState = searchParams) {
        if (!session?.user?.id) {
            setDiaryList([])
            return
        }

        let query = supabase
            .from('entries')
            .select('*')
            .eq('user_id', session.user.id)

        // 🔹 apply text search
        if (params.filter) {
            query = query.textSearch(
                'search_vector',
                params.filter,
                { type: 'websearch' }
            )
        }

        // 🔹 apply mood filter
        if (params.filterMood !== -1) {
            query = query.eq('mood', params.filterMood)
        }

        // 🔹 apply star filter
        if (params.filterStar !== -1) {
            query = query.eq('star', params.filterStar)
        }

        // 🔹 apply date range
        if (params.dateFrom) {
            query = query.gte('created_at', params.dateFrom)
        }

        if (params.dateTo) {
            query = query.lte(
                'created_at',
                `${params.dateTo}T23:59:59`
            )
        }

        if (params.sortByStar !== 'none') {
            query = query.order('star', {
                ascending: params.sortByStar === 'asc'
            })
            query = query.order('created_at', {
                ascending: params.sortOrder === 'asc'
            })
        } else {
            query = query.order('created_at', {
                ascending: params.sortOrder === 'asc'
            })
        }

        query
            .limit(100)
            .then(({ data, error }) => {
                processEntries(data, error, params.sortByStar)
            })
    }

    function processEntries(data: { content: string | null; created_at: string | null; id: string; mood: number | null; star: number | null; title: string | null; user_id: string }[] | null, error: PostgrestError | null, sortByStarValue: 'none' | 'asc' | 'desc') {
        console.log(data)
        console.log(error)
        if (!error && data) {
            let entries = data.map(item => {
                const entry: DiaryEntryType = {
                    id: item.id,
                    date: item.created_at ? new Date(item.created_at) : new Date(),
                    title: item.title ?? '',
                    mood: item.mood ?? 1,
                    content: item.content ?? '',
                    star: item.star ?? 1,

                    attachments: (item as any).attachments ?? []
                }
                return entry
            })

            // Apply star sorting if enabled
            if (sortByStarValue !== 'none') {
                entries.sort((a, b) => {
                    if (sortByStarValue === 'asc') {
                        return a.star - b.star
                    } else {
                        return b.star - a.star
                    }
                })
            }

            setDiaryList(entries)
        } else {
            setDiaryList(sampleDiary)
        }
    }

    const handleSearch = (paramsToUse: SearchState = searchParams) => {
        setCurrentPage(1)
        setFavoritePage(1)
        loadEntries(paramsToUse)
    }

    const handleClearFilters = () => {
        const resetParams: SearchState = {
            filter: '',
            filterMood: -1,
            filterStar: -1,
            sortOrder: 'desc',
            sortByStar: 'none',
            dateFrom: '',
            dateTo: ''
        }

        setSearchParams(resetParams)
        setCurrentPage(1)
        setFavoritePage(1)
        loadEntries(resetParams)
    }

    const toggleFavorite = (id: string) => {
        let updated = [...favorites]

        if (updated.includes(id)) {
            updated = updated.filter(item => item !== id)
        } else {
            updated.unshift(id)
        }

        setFavorites(updated)
        localStorage.setItem('favorite-diaries', JSON.stringify(updated))
        // Also notify same-tab listeners
        window.dispatchEvent(new CustomEvent('favorite-diaries-updated', { detail: updated }))
    }

    const favoriteEntries = favorites
        .map(favId => diaryList.find(entry => entry.id === favId))
        .filter((entry): entry is DiaryEntryType => Boolean(entry))

    const favoritePageCount = Math.max(1, Math.ceil(favoriteEntries.length / favoritesPerPage))
    const favoritePageEntries = favoriteEntries.slice(
        (favoritePage - 1) * favoritesPerPage,
        favoritePage * favoritesPerPage
    )

    const nonFavoriteEntries = diaryList.filter(item => !favorites.includes(item.id ?? ''))
    const totalPages = Math.max(1, Math.ceil(nonFavoriteEntries.length / entriesPerPage))
    const pageEntries = nonFavoriteEntries.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    )

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleFavoritePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setFavoritePage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <Searchbar
            params={searchParams}
            onChange={setSearchParams}
            onSearch={handleSearch}
            onClear={handleClearFilters}
        >
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', px: 1.5, pt: 2, pb: 3 }}>
                {/* Favorites Section */}
                {favorites.length > 0 && (
                    <Paper
                        elevation={5}
                        sx={{
                            p: 2.5,
                            mb: 3,
                            borderRadius: 4,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #e91e63, #ff80ab, #e91e63)'
                            }
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                color: '#e91e63',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <FavoriteIcon sx={{ fontSize: '1.3rem' }} />
                            Favorite Memories ({favorites.length})
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {favoritePageEntries.map((entry, index) => (
                                <DiaryEntry
                                    key={`favorite-${favoritePage}-${index}`}
                                    entry={entry}
                                    id={index}
                                    favorite={true}
                                    onFavorite={toggleFavorite}
                                />
                            ))}
                        </Box>

                        {favoritePageCount > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Pagination
                                    count={favoritePageCount}
                                    page={favoritePage}
                                    onChange={handleFavoritePageChange}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </Paper>
                )}

                {/* All Entries */}
                <Typography
                    sx={{
                        px: 1,
                        mt: 3,
                        mb: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#999'
                    }}
                >
                    All Entries ({diaryList.filter(item => !favorites.includes(item.id ?? '')).length})
                </Typography>

                {pageEntries.map((entry, index) => (
                    <DiaryEntry
                        entry={entry}
                        id={(currentPage - 1) * entriesPerPage + index}
                        key={`${currentPage}-${index}`}
                        favorite={favorites.includes(entry.id ?? '')}
                        onFavorite={toggleFavorite}
                    />
                ))}

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        </Searchbar>
    )
}

export function DiaryEntry(
    prop: {
        entry: DiaryEntryType,
        id: number,
        show?: boolean,
        favorite?: boolean,
        onFavorite?: (id: string) => void
    }
) {
    console.log('📄 DiaryEntry component rendered, id:', prop.id)

    const { entry, show } = prop

    const navigate = useNavigate()

    const [expand, setExpand] = useState(show)

    const [openMap, setOpenMap] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState('')

    // NEW: location picker dialog when multiple locations present
    const [locationPickerOpen, setLocationPickerOpen] = useState(false)
    const [locationOptions, setLocationOptions] = useState<{ lat: string, lng: string, name: string }[]>([])

    const [selectedLocationLabel, setSelectedLocationLabel] = useState('')

    const [openFiles, setOpenFiles] = useState(false)

    const [selectedFiles, setSelectedFiles] = useState<DiaryAttachment[]>([])

    async function deleteAttachmentFromStorage(attachmentId: string) {
        try {
            const { error } = await supabase
                .storage
                .from('Diary_File_Upoad')
                .remove([attachmentId])

            if (error) {
                console.log('Error deleting file:', error)
                return false
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async function deleteFileFromEntry(attachmentId: string) {
        const deleted = await deleteAttachmentFromStorage(attachmentId)
        if (deleted) {
            const updated = selectedFiles.filter(f => f.id !== attachmentId)
            setSelectedFiles(updated)
        }
    }

    function hasMap(text: string): boolean {
        const locations = extractLocationsFromHtml(text ?? '')
        return locations.length > 0
    }

    function handleEdit(): void {

        navigate(`/diaryedit/${entry.id}`, {
            state: entry
        })
    }

    const theme = useTheme()

    function handleOpenLocationChooser(e: React.MouseEvent) {
        e.stopPropagation()
        const locations = extractLocationsFromHtml(entry.content ?? '')
        if (locations.length === 0) return

        if (locations.length === 1) {
            const loc = locations[0]
            setSelectedLocation(`${loc.lat},${loc.lng},19`)
            setSelectedLocationLabel(loc.name ?? `${loc.lat}, ${loc.lng}`)
            setOpenMap(true)
        } else {
            // multiple -> open picker dialog
            setLocationOptions(locations)
            setLocationPickerOpen(true)
        }
    }

    function handlePickLocation(loc: { lat: string, lng: string, name: string }) {
        setSelectedLocation(`${loc.lat},${loc.lng},19`)
        setSelectedLocationLabel(loc.name ?? `${loc.lat}, ${loc.lng}`)
        setLocationPickerOpen(false)
        setOpenMap(true)
    }

    return (
        <>
            <Paper
                elevation={4}
                sx={{
                    display: 'flex',
                    p: 2,
                    m: 1.25,
                    borderRadius: 4,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #2c1b24 0%, #44263a 100%)'
                            : 'linear-gradient(135deg, #fff0f5 0%, #ffffff 100%)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1.5px solid #ffd6e7',
                    position: 'relative',
                    overflow: expand ? 'visible' : 'hidden',
                    maxHeight: expand ? 'auto' : 170,

                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: prop.favorite
                            ? 'linear-gradient(90deg, #e91e63, #ff80ab, #e91e63)'
                            : 'linear-gradient(90deg, #f0f0f0, #f0f0f0)'
                    },

                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(233, 30, 99, 0.2)'
                    }
                }}
            >

                {/* Mood Emoji */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2.5,
                        minWidth: 70,
                        minHeight: 70,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe4ec 100%)',
                    }}
                >
                    <Typography sx={{ fontSize: '56px' }}>
                        {moodList[entry.mood]?.icon ?? '❓'}
                    </Typography>
                </Box>

                {/* Content Section */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1
                    }}
                >

                    {/* Date & Info Bar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                            sx={{
                                fontSize: '0.85rem',
                                color: '#999',
                                fontWeight: 500
                            }}
                        >
                            {entry.date.toLocaleString('en-PH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {hasMap(entry.content) && (
                                <Chip
                                    icon={<LocationOnIcon />}
                                    label="Has Location"
                                    size="small"
                                    variant="outlined"
                                    clickable
                                    onClick={handleOpenLocationChooser}
                                    sx={{
                                        borderColor: '#e91e63',
                                        color: '#e91e63',
                                        height: 28,
                                        cursor: 'pointer',
                                        transition: '0.25s',
                                        '&:hover': {
                                            backgroundColor: '#ffe4ec',
                                            transform: 'scale(1.04)'
                                        }
                                    }}
                                />
                            )}
                            {entry.attachments?.length ? (
                                <Chip
                                    icon={<AttachFileIcon />}
                                    label={`${entry.attachments.length} file${entry.attachments.length > 1 ? 's' : ''}`}
                                    clickable
                                    onClick={() => {
                                        setSelectedFiles(
                                            Array.isArray(entry.attachments)
                                                ? entry.attachments
                                                : []
                                        )
                                        setOpenFiles(true)
                                    }}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#ff80ab',
                                        color: '#e91e63',
                                        height: 28,
                                        cursor: 'pointer',
                                        transition: '0.25s',

                                        '&:hover': {
                                            backgroundColor: '#ffe4ec',
                                            transform: 'scale(1.04)'
                                        }
                                    }}
                                />
                            ) : null}
                        </Box>
                    </Box>

                    {/* Title */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1
                        }}
                    >

                        <Typography
                            onClick={() => setExpand(!expand)}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.15rem',
                                cursor: 'pointer',
                                color: '#e91e63',
                                transition: '0.2s',
                                '&:hover': {
                                    color: '#c2185b',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {entry.title}
                        </Typography>

                    </Box>

                    {/* Content */}
                    {expand && (
                        <Fade in={expand}>
                            <Box sx={{ mt: 1, mb: 1 }}>

                                <Typography
                                    component="div"
                                    sx={{
                                        color: theme.palette.text.primary,
                                        lineHeight: 1.8,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <Box
                                        sx={{ fontSize: '0.95rem' }}
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                                stripAttachmentLinks(entry.content, entry.attachments),
                                                {
                                                    ALLOWED_TAGS: [
                                                        'b',
                                                        'i',
                                                        'em',
                                                        'strong',
                                                        'p',
                                                        'br',
                                                        'ul',
                                                        'ol',
                                                        'li',
                                                        'span',
                                                        'div'
                                                    ],
                                                    ALLOWED_ATTR: [
                                                        'data-lat',
                                                        'data-lng',
                                                        'data-name'
                                                    ],
                                                    FORBID_TAGS: [
                                                        'script',
                                                        'iframe',
                                                        'object',
                                                        'embed',
                                                        'style',
                                                        'link'
                                                    ],
                                                    FORBID_ATTR: [
                                                        'onerror',
                                                        'onclick',
                                                        'onload',
                                                        'style'
                                                    ]
                                                }
                                            )
                                        }}
                                    />
                                </Typography>

                                {/* If entry has coordinates, show a clear clickable button (in-app map) */}
                                {hasMap(entry.content) && (
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            startIcon={<LocationOnIcon />}
                                            variant="contained"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // reuse the same chooser logic used by the chip
                                                handleOpenLocationChooser(e as any)
                                            }}
                                            sx={{
                                                background:
                                                    'linear-gradient(135deg, #ffe4ec 0%, #ffd6e7 100%)',
                                                color: '#d81b60',
                                                fontWeight: 'bold',
                                                borderRadius: '999px',
                                                px: 2,
                                                textTransform: 'none',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    background: '#ffc1d6'
                                                }
                                            }}
                                        >
                                            <Box component="span" sx={{ mr: 1, display: 'inline-flex', alignItems: 'center' }}>
                                                View Memory Location
                                            </Box>
                                        </Button>
                                    </Box>
                                )}

                                {entry.attachments?.length ? (
                                    <Chip
                                        icon={<AttachFileIcon />}
                                        label={`📎 Open ${entry.attachments?.[0]?.name ?? 'File'}${entry.attachments.length > 1
                                            ? ` (+${entry.attachments.length - 1})`
                                            : ''
                                            }`}
                                        clickable
                                        onClick={(e) => {
                                            e.stopPropagation()

                                            setSelectedFiles(
                                                Array.isArray(entry.attachments)
                                                    ? entry.attachments
                                                    : []
                                            )

                                            setOpenFiles(true)
                                        }}
                                        sx={{
                                            mt: 2,
                                            height: 42,
                                            borderRadius: '999px',
                                            px: 1.5,
                                            fontWeight: 'bold',
                                            fontSize: '.95rem',
                                            background:
                                                'linear-gradient(135deg, #ffe4ec 0%, #ffd6e7 100%)',
                                            color: '#d81b60',
                                            cursor: 'pointer',

                                            '&:hover': {
                                                background: '#ffc1d6',
                                                transform: 'scale(1.03)'
                                            }
                                        }}
                                    />
                                ) : null}

                            </Box>
                        </Fade>
                    )}

                </Box>

                {/* Right Side Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        minWidth: 90,
                        gap: 1,
                        pt: 0.25
                    }}
                >

                    {/* Stars Rating */}
                    <Box
                        sx={{
                            fontSize: '20px',
                            color: '#ffb300',
                            minHeight: 28,
                            display: 'flex',
                            alignItems: 'center',
                            textShadow: '0 2px 4px rgba(255, 179, 0, 0.3)'
                        }}
                    >
                        {"★".repeat(entry.star)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        {/* Favorite Heart Button */}
                        <Tooltip title={prop.favorite ? "Remove from favorites" : "Add to favorites"}>
                            <IconButton
                                onClick={() => {
                                    if (entry.id && prop.onFavorite) {
                                        prop.onFavorite(entry.id)
                                    }
                                }}
                                sx={{
                                    backgroundColor: prop.favorite ? '#ffe4ec' : '#f5f5f5',
                                    width: 42,
                                    height: 42,
                                    transition: 'all 0.3s ease',
                                    transform: prop.favorite ? 'scale(1.05)' : 'scale(1)',

                                    '&:hover': {
                                        backgroundColor: '#ffd6e7',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                <FavoriteIcon
                                    sx={{
                                        color: prop.favorite ? '#e91e63' : '#ccc',
                                        fontSize: '1.5rem',
                                        transition: '0.3s'
                                    }}
                                />
                            </IconButton>
                        </Tooltip>

                        {/* Edit Button */}
                        <Tooltip title="Edit this memory">
                            <IconButton
                                aria-label="edit"
                                onClick={handleEdit}
                                sx={{
                                    backgroundColor: '#fff0f5',
                                    width: 42,
                                    height: 42,
                                    transition: '0.3s',

                                    '&:hover': {
                                        backgroundColor: '#ffd6e7',
                                        transform: 'rotate(10deg) scale(1.05)'
                                    }
                                }}
                            >
                                <EditIcon sx={{ color: '#e91e63' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

            </Paper>

            {/* MAP POPUP */}
            <Dialog
                open={openMap}
                onClose={() => {
                    setOpenMap(false)
                    setSelectedLocation('')
                    setSelectedLocationLabel('')
                }}
                maxWidth="lg"
                fullWidth
                keepMounted={false}
            >

                <DialogTitle
                    sx={{
                        background:
                            'linear-gradient(135deg, #e91e63 0%, #ff80ab 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}
                >
                    📍 {selectedLocationLabel || 'Memory Location'}
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    <Map loc={selectedLocation} />
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenMap(false)}
                    >
                        Close
                    </Button>
                </DialogActions>

            </Dialog>

            {/* LOCATION PICKER DIALOG (when multiple locations exist) */}
            <Dialog
                open={locationPickerOpen}
                onClose={() => setLocationPickerOpen(false)}
            >
                <DialogTitle>Select Location</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        {locationOptions.map((loc, idx) => (
                            <Button key={`${loc.lat}-${loc.lng}-${idx}`} variant="outlined" onClick={() => handlePickLocation(loc)}>
                                {loc.name || `${loc.lat}, ${loc.lng}`}
                            </Button>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLocationPickerOpen(false)} color="inherit">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* FILES POPUP */}
            <Dialog
                open={openFiles}
                onClose={() => {
                    setOpenFiles(false)
                    setSelectedFiles([])
                }}
                maxWidth="md"
                fullWidth
            >

                <DialogTitle
                    sx={{
                        background:
                            'linear-gradient(135deg, #e91e63 0%, #ff80ab 100%)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    📎 Memory Attachments
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 3
                    }}
                >

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill,minmax(180px,1fr))',
                            gap: 2
                        }}
                    >

                        {selectedFiles.map((file) => (

                            <Paper
                                key={file.id}
                                elevation={3}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    transition: '0.25s',
                                    cursor: 'pointer',
                                    position: 'relative',

                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: 6,
                                        backgroundColor: '#fff5f8'
                                    }
                                }}
                            >

                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 160,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        mb: 1
                                    }}
                                    onClick={() => window.open(file.url, '_blank')}
                                >

                                    <img
                                        src={file.url}
                                        alt={file.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160"%3E%3Crect fill="%23f0f0f0" width="160" height="160"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EFile not found%3C/text%3E%3C/svg%3E'
                                        }}
                                    />

                                </Box>

                                <Typography
                                    noWrap
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '.9rem',
                                        mb: 1
                                    }}
                                >
                                    {file.name}
                                </Typography>

                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (file.id) {
                                            deleteFileFromEntry(file.id)
                                        }
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        color: '#e91e63',
                                        '&:hover': {
                                            backgroundColor: '#fff5f8'
                                        }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>

                            </Paper>

                        ))}

                    </Box>

                </DialogContent>

                <DialogActions>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            setOpenFiles(false)
                            setSelectedFiles([])
                        }}
                    >
                        Close
                    </Button>

                </DialogActions>

            </Dialog>
        </>
    )
}

export default DiaryList