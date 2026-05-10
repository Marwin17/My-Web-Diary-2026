import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Tooltip from '@mui/material/Tooltip'
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useEffect, useState } from "react"
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
import TooltipMui from '@mui/material/Tooltip'

function DiaryList({ results }: { results?: any[] }) {

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

    // ✅ EXISTING (DB fetch)
    useEffect(() => {
        loadEntries()
    }, [])

    // ✅ ADD THIS HERE (search results override)
    useEffect(() => {

        // search results
        if (results && results.length > 0) {

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
        }

        // normal loading
        else {
            loadEntries()
        }

    }, [results])

    // ⬇️ THEN your functions
    function loadEntries(params: SearchState = searchParams) {

        let query = supabase
            .from('entries')
            .select('*')

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

        query
            .order('title', {
                ascending: params.sortOrder === 'asc'
            })
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

    const handleSearch = () => {
        setCurrentPage(1)
        setFavoritePage(1)
        loadEntries(searchParams)
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
        <>
            {/* Added a wrapper Box to match the margin (m: 1.5) of the diary entries below */}
            <Box sx={{ mx: 1.5, mt: 3.5, mb: 1.5 }}>
                <Searchbar
                    params={searchParams}
                    onChange={setSearchParams}
                    onSearch={handleSearch}
                    onClear={handleClearFilters}
                />
            </Box>

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <Paper
                    elevation={5}
                    sx={{
                        p: 2.5,
                        mx: 1.5,
                        mb: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe4ec 50%, #fff0f5 100%)',
                        border: '2px solid #ff80ab',
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
                    px: 2,
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
        </>
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

    const { entry, show } = prop

    const navigate = useNavigate()

    const [expand, setExpand] = useState(show)

    const [openMap, setOpenMap] = useState(false)

    const [selectedLocation, setSelectedLocation] = useState('')

    const theme = useTheme()

    function handleEdit(): void {

        navigate(`/diaryedit/${entry.id}`, {
            state: entry
        })
    }

    const [openFiles, setOpenFiles] = useState(false)

    const [selectedFiles, setSelectedFiles] = useState<
        {
            id: string
            name: string
            url: string
        }[]
    >([])

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

        const regex =
            /\[(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\]/g

        return regex.test(text)
    }

    function extractFirstCoords(text: string): { lat: string, lng: string } | null {
        const regex = /\[(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/g
        const match = regex.exec(text)
        if (match) {
            return { lat: match[1], lng: match[2] }
        }
        return null
    }

    return (
        <>
            <Paper
                elevation={4}
                sx={{
                    display: 'flex',
                    p: 2.5,
                    m: 1.5,
                    borderRadius: 4,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #2c1b24 0%, #44263a 100%)'
                            : 'linear-gradient(135deg, #fff0f5 0%, #ffffff 100%)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1.5px solid #ffd6e7',
                    position: 'relative',
                    overflow: expand ? 'visible' : 'hidden',
                    maxHeight: expand ? 'auto' : 190,

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
                        {moodList[entry.mood].icon}
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
                                    onClick={() => {
                                        const coords = extractFirstCoords(entry.content)
                                        if (coords) {
                                            setSelectedLocation(`${coords.lat},${coords.lng},19`)
                                            setOpenMap(true)
                                        }
                                    }}
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
                                    sx={{
                                        color: theme.palette.text.primary,
                                        lineHeight: 1.8,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    <Box
                                        sx={{ fontSize: '0.95rem' }}
                                        dangerouslySetInnerHTML={{
                                            __html: entry.content
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
                                                const coords = extractFirstCoords(entry.content)
                                                if (coords) {
                                                    setSelectedLocation(`${coords.lat},${coords.lng},19`)
                                                    setOpenMap(true)
                                                }
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
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        minWidth: 85,
                        gap: 1.5
                    }}
                >

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
                                width: 48,
                                height: 48,
                                transition: 'all 0.3s ease',
                                transform: prop.favorite ? 'scale(1.1)' : 'scale(1)',

                                '&:hover': {
                                    backgroundColor: '#ffd6e7',
                                    transform: 'scale(1.15)',
                                }
                            }}
                        >
                            <FavoriteIcon
                                sx={{
                                    color: prop.favorite ? '#e91e63' : '#ccc',
                                    fontSize: '1.8rem',
                                    transition: '0.3s'
                                }}
                            />
                        </IconButton>
                    </Tooltip>

                    {/* Stars Rating */}
                    <Box
                        sx={{
                            fontSize: '20px',
                            color: '#ffb300',
                            minHeight: 32,
                            display: 'flex',
                            alignItems: 'center',
                            textShadow: '0 2px 4px rgba(255, 179, 0, 0.3)'
                        }}
                    >
                        {"★".repeat(entry.star)}
                    </Box>

                    {/* File indicator button (visible on card) */}
                    {entry.attachments?.length ? (
                        <TooltipMui title={`Open ${entry.attachments.length} attachment(s)`}>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedFiles(Array.isArray(entry.attachments) ? entry.attachments : [])
                                    setOpenFiles(true)
                                }}
                                aria-label="attachments"
                                sx={{
                                    backgroundColor: '#fff0f5',
                                    width: 44,
                                    height: 44,
                                    transition: '0.3s',
                                    '&:hover': {
                                        backgroundColor: '#ffd6e7',
                                        transform: 'rotate(5deg)'
                                    }
                                }}
                            >
                                <AttachFileIcon sx={{ color: '#e91e63' }} />
                            </IconButton>
                        </TooltipMui>
                    ) : (
                        <Box sx={{ height: 44 }} />
                    )}

                    {/* Edit Button */}
                    <Tooltip title="Edit this memory">
                        <IconButton
                            aria-label="edit"
                            onClick={handleEdit}
                            sx={{
                                backgroundColor: '#fff0f5',
                                width: 48,
                                height: 48,
                                transition: '0.3s',

                                '&:hover': {
                                    backgroundColor: '#ffd6e7',
                                    transform: 'rotate(10deg)'
                                }
                            }}
                        >
                            <EditIcon sx={{ color: '#e91e63' }} />
                        </IconButton>
                    </Tooltip>

                </Box>

            </Paper>

            {/* MAP POPUP */}
            <Dialog
                open={openMap}
                onClose={() => {
                    setOpenMap(false)
                    setSelectedLocation('')
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
                    📍 Memory Location
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
                                        deleteFileFromEntry(file.id)
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