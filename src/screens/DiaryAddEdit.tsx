/*
 * File: DiaryAddEdit.tsx
 * Authors: Marwin Tan, Mary Allison Chen, Julia Irene Sia
 * Created: Feb 11, 2026
 * Description: Component for adding new diary entries or editing existing ones with rich text editor and metadata.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

// DiaryAddEdit.tsx
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router"

import {
    moodList,
    type DiaryEntryType,
    type DiaryAttachment
} from "../diary/Diary"

import {
    useEffect,
    useRef,
    useState
} from "react"
import type { Session } from '@supabase/supabase-js'

import { format } from 'date-fns'

import { supabase } from "../supabaseClient"
import { Editor } from "@tinymce/tinymce-react"

import DeleteIcon from "@mui/icons-material/Delete"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import SaveIcon from "@mui/icons-material/Save"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MyLocationIcon from "@mui/icons-material/MyLocation"
import FavoriteIcon from "@mui/icons-material/Favorite"
import EditCalendarIcon from "@mui/icons-material/EditCalendar"

// Main DiaryAddEdit component
function DiaryAddEdit() {
    console.log('✏️ DiaryAddEdit component mounted, id:', useParams().id)

    // Get URL parameters
    const { id } = useParams()

    // Navigation hook
    const navigate = useNavigate()

    // Session state
    const [session, setSession] = useState<Session | null>(null)

    // Location hook
    const location = useLocation()

    // Add these states near your other useState hooks
    const [openDateDialog, setOpenDateDialog] = useState(false)
    const [manualDateTime, setManualDateTime] = useState('')

    // Determine if creating new entry
    const isNew = id === undefined
    console.log('📝 DiaryAddEdit: isNew =', isNew)

    // Delete confirmation dialog state
    const [openDelete, setOpenDelete] = useState(false)

    // Get entry from location state
    const state = location.state as DiaryEntryType | undefined

    // Entry state with fallback values
    const [entry, setEntry] = useState<DiaryEntryType>(() => {
        return {
            id: state?.id ?? id,   // 🔥 fallback to URL param
            date: state?.date ? new Date(state.date) : new Date(),
            title: state?.title ?? '',
            mood: state?.mood ?? 0,
            content: state?.content ?? '',
            star: state?.star ?? 1,
            attachments: state?.attachments ?? []
        }
    })

    // Attachments state
    const [attachments, setAttachments] = useState<DiaryAttachment[]>(state?.attachments ?? [])

    // Selected attachment for preview
    const [selectedAttachment, setSelectedAttachment] = useState<DiaryAttachment | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    const draftKey = isNew ? "diary-draft-new" : `diary-draft-${id}`

    const [isDraft, setIsDraft] = useState(false)

    // pendingFavorite: used when entry.id is not present (new form)
    const [pendingFavorite, setPendingFavorite] = useState(false)

    // --- Minimal additions for favorites (reads/writes same key as DiaryList) ---
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('favorite-diaries')
        let favs: string[] = []
        try {
            favs = saved ? JSON.parse(saved) : []
        } catch {
            favs = []
        }
        setIsFavorite(Boolean(entry.id && favs.includes(entry.id as string)) || Boolean(pendingFavorite && !entry.id))
    }, [entry.id, pendingFavorite])

    function handleToggleFavorite() {
        // If editing existing entry (has id) -> update favorite-diaries immediately
        if (entry.id) {
            const saved = localStorage.getItem('favorite-diaries')
            let favs: string[] = []
            try {
                favs = saved ? JSON.parse(saved) : []
            } catch {
                favs = []
            }

            console.debug('handleToggleFavorite (existing): entry.id=', entry.id, 'current favs=', favs)

            let updated: string[]
            if (favs.includes(entry.id as string)) {
                updated = favs.filter(f => f !== entry.id)
                setIsFavorite(false)
                setSnackbar({ open: true, message: 'Removed from favorites', severity: 'info' })
            } else {
                updated = [entry.id as string, ...favs]
                setIsFavorite(true)
                setSnackbar({ open: true, message: 'Added to favorites', severity: 'success' })
            }

            localStorage.setItem('favorite-diaries', JSON.stringify(updated))
            window.dispatchEvent(new CustomEvent('favorite-diaries-updated', { detail: updated }))

            console.debug('handleToggleFavorite (existing): favorites updated=', updated)
            return
        }

        // New-entry case: toggle pendingFavorite and update UI; we'll add to favorites after save
        const newPending = !pendingFavorite
        setPendingFavorite(newPending)
        setIsFavorite(newPending)
        setSnackbar({ open: true, message: newPending ? 'Will favorite when saved' : 'Removed favorite mark', severity: newPending ? 'success' : 'info' })

        console.debug('handleToggleFavorite (new): pendingFavorite ->', newPending)
    }

    // helper to check whether HTML content has visible text
    function isContentEmpty(html: string | undefined) {
        if (!html) return true
        // remove tags and &nbsp; and non-breaking spaces, then trim
        const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ').trim()
        return text.length === 0
    }

    // consistent button sizing for the action buttons
    const actionButtonSx = {
        borderRadius: 3,
        minWidth: { xs: 120, sm: 160 },
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'none'
    }
    // --- end additions ---

    // --- Snackbar state ---
    function setSnackbar(payload: { open: boolean; message: string; severity?: 'success' | 'info' | 'warning' | 'error' }) {
        setSnackbarState(state => ({ ...state, ...payload } as any))
    }

    // internal state for setSnackbar (avoid name conflict)
    const [snackbarState, setSnackbarState] = useState<{ open: boolean; message: string; severity?: 'success' | 'info' | 'warning' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    })

    const handleCloseSnackbar = (_: any, reason?: string) => {
        if (reason === 'clickaway') return
        setSnackbarState(s => ({ ...s, open: false }))
    }
    // --- end snackbar ---

    // Version B: Restore 'diary-draft-new' when opening New (if present).
    // Load per-key draft (diary-draft-new for new, diary-draft-<id> for edit).
    useEffect(() => {
        const saved = localStorage.getItem(draftKey)

        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // restore pendingFavorite if present
                if ((parsed as any).pendingFavorite) {
                    setPendingFavorite(Boolean((parsed as any).pendingFavorite))
                } else {
                    setPendingFavorite(false)
                }

                setEntry({
                    ...parsed,
                    date: parsed.date ? new Date(parsed.date) : new Date()
                })
                setIsDraft(true)
                setAttachments(parsed.attachments ?? [])
            } catch (e) {
                console.log("Failed to load draft", e)
            }
        } else if (isNew) {
            // no saved new-draft: ensure blank new
            setEntry({
                date: new Date(),
                title: '',
                mood: 0,
                content: '',
                star: 1,
                attachments: []
            } as DiaryEntryType)
            setAttachments([])
            setPendingFavorite(false)
            setIsDraft(false)
        }
    }, [draftKey, isNew])

    useEffect(() => {

        const handler = setTimeout(() => {

            // Auto-save to per-key (diary-draft-new or diary-draft-<id>)
            // include pendingFavorite for new drafts
            const toSave: any = {
                ...entry,
                pendingFavorite
            }

            try {
                localStorage.setItem(
                    draftKey,
                    JSON.stringify(toSave)
                )
                setIsDraft(true)
            } catch (e) {
                console.warn('Failed to save draft', e)
            }

        }, 500)

        return () => clearTimeout(handler)

    }, [entry, draftKey, pendingFavorite])

    useEffect(() => {
        let mounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return
            setSession(data.session)
        }).catch((error) => {
            console.error('DiaryAddEdit: failed to get session', error)
            if (mounted) {
                setSession(null)
            }
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return
            setSession(session)
        })

        return () => {
            mounted = false
            listener.subscription?.unsubscribe?.()
        }
    }, [])

    const editorRef = useRef(null)

    // --- LOCATION HELPERS ---
    // NOTE: changed so the visible innerHTML only shows the coordinates (label is stored in data-name only)
    function createLocationHtml(lat: number, lng: number, name?: string) {
        const safeName = name ? String(name).replace(/"/g, '&quot;') : ''

        return `
        <div 
            class="diary-loc"
            data-lat="${lat}"
            data-lng="${lng}"
            data-name="${safeName}"
            style="
                margin:10px 0;
                padding:10px 14px;
                border-radius:12px;
                background:#fff5f8;
                border:1px solid #f8bbd0;
                display:flex;
                flex-direction:column;
                gap:4px;
                width:fit-content;
            "
        >
            ${safeName
                ? `<span style="
                        font-weight:bold;
                        color:#e91e63;
                        font-size:14px;
                    ">
                        📍 ${safeName}
                    </span>`
                : ''
            }

            <span style="
                color:#444;
                font-size:14px;
            ">
                [${lat}, ${lng}]
            </span>
        </div>
    `
    }

    function promptForLocationName(defaultName = '') {
        try {
            const name = window.prompt('Name this location (optional)', defaultName)
            if (name === null) return null // user cancelled
            return name.trim()
        } catch {
            return defaultName
        }
    }

    async function save() {
        console.log('💾 DiaryAddEdit: Saving entry...', entry.title)
        try {
            console.log("📝 DiaryAddEdit: Saving entry ID:", entry.id)

            // Validation: when creating NEW entry require both title and message
            if (!entry.id) {
                const titleEmpty = !entry.title || entry.title.trim() === ''
                const messageEmpty = isContentEmpty(entry.content)
                if (titleEmpty || messageEmpty) {
                    setSnackbarState({
                        open: true,
                        message: 'Please enter both a title and a message before saving.',
                        severity: 'warning'
                    })
                    console.warn('Aborting save: title or message empty (new entry).', { titleEmpty, messageEmpty })
                    return
                }
            }

            const userId = session?.user?.id ?? null
            console.log('🧾 Resolved userId:', userId)

            if (!userId) {
                setSnackbarState({ open: true, message: 'You must be signed in to save this entry', severity: 'error' })
                console.warn('Aborting save: no user id available (user not signed in).')
                return
            }

            if (!entry.id) {
                // CREATE NEW ENTRY
                const payload = {
                    created_at: entry.date.toISOString(),
                    title: entry.title,
                    content: entry.content,
                    mood: entry.mood,
                    star: entry.star,
                    user_id: userId,
                    attachments: entry.attachments ?? []
                }
                console.log('➡️ Insert payload:', payload)

                const { data, error } = await supabase
                    .from('entries')
                    .insert(payload)
                    .select()
                    .single()

                console.log('⬅️ Insert result:', { data, error })
                if (error) {
                    console.error('Supabase insert error:', error)
                    const message = (error as any)?.message ?? 'Failed to create entry'
                    setSnackbarState({ open: true, message, severity: 'error' })
                    return
                }

                // After create: if pendingFavorite was set, add the returned id to favorite-diaries
                try {
                    if (pendingFavorite && data && (data as any).id) {
                        const newId = (data as any).id as string
                        const saved = localStorage.getItem('favorite-diaries')
                        let favs: string[] = []
                        try {
                            favs = saved ? JSON.parse(saved) : []
                        } catch {
                            favs = []
                        }

                        console.debug('save(): pendingFavorite true, newId=', newId, 'current favs before=', favs)

                        if (!favs.includes(newId)) {
                            const updated = [newId, ...favs]
                            localStorage.setItem('favorite-diaries', JSON.stringify(updated))
                            window.dispatchEvent(new CustomEvent('favorite-diaries-updated', { detail: updated }))
                            console.debug('save(): favorites after update=', updated)
                        } else {
                            console.debug('save(): newId already in favorites')
                        }
                    } else {
                        console.debug('save(): pendingFavorite false or missing new id; nothing to do for favorites')
                    }
                } catch (e) {
                    console.warn('Failed to persist pending favorite after save', e)
                }

                // clear draft and reset editor to blank (stay on New)
                try {
                    localStorage.removeItem('diary-draft-new')
                } catch (e) { /* ignore */ }

                setEntry({
                    date: new Date(),
                    title: '',
                    mood: 0,
                    content: '',
                    star: 1,
                    attachments: []
                } as DiaryEntryType)

                setAttachments([])
                setSelectedAttachment(null)
                setPendingFavorite(false)
                setIsFavorite(false)
                setIsDraft(false)

                setSnackbarState({ open: true, message: 'Memory saved', severity: 'success' })
                // do NOT navigate — stay on the blank new form so user can create another
                return

            } else {
                // UPDATE EXISTING ENTRY (unchanged behavior: navigate back after success)
                const payload = {
                    created_at: entry.date.toISOString(),
                    title: entry.title,
                    content: entry.content,
                    mood: entry.mood,
                    star: entry.star,
                    attachments: entry.attachments ?? []
                }
                console.log('➡️ Update payload:', payload, 'id=', entry.id)

                const { data, error } = await supabase
                    .from('entries')
                    .update(payload)
                    .eq('id', entry.id)
                    .select()
                console.log('⬅️ Update result:', { data, error })

                if (error) {
                    console.error('Supabase update error:', error)
                    const message = (error as any)?.message ?? 'Failed to update entry'
                    setSnackbarState({ open: true, message, severity: 'error' })
                    return
                }

                // remove per-entry draft after update
                try {
                    localStorage.removeItem(draftKey)
                } catch (e) { /* ignore */ }

                setIsDraft(false)
                setSnackbarState({ open: true, message: 'Memory updated', severity: 'success' })
                setTimeout(() => navigate('/diarylist'), 700)
            }

        } catch (error) {
            console.error('❌ DiaryAddEdit: Unexpected error saving entry:', error)
            const message = (error as any)?.message ?? 'Failed to save memory'
            setSnackbarState({ open: true, message, severity: 'error' })
        }
    }

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

    async function deleteEntry() {

        if (!entry.id) return

        try {
            // Delete all attachments from storage first
            if (entry.attachments?.length) {
                for (const attachment of entry.attachments) {
                    if (attachment.id) {
                        await deleteAttachmentFromStorage(attachment.id)
                    }
                }
            }

            const { error } = await supabase
                .from('entries')
                .delete()
                .eq('id', entry.id)

            if (error) {
                console.log(error)
                return
            }

            localStorage.removeItem(draftKey)

            navigate('/diarylist')

        } catch (error) {

            console.log(error)
        }
    }

    async function uploadFile(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const file = event.target.files?.[0]

        if (!file) return

        try {

            setUploading(true)
            const userId: string | null = session?.user?.id ?? null

            if (!userId) {
                setSnackbarState({
                    open: true,
                    message: 'You must be signed in to upload files.',
                    severity: 'error'
                })
                console.warn('Aborting upload: no user id available (user not signed in).')
                return
            }

            const fileName = `${Date.now()}-${file.name}`

            const filePath =
                `${userId}/${fileName}`

            const { error } = await supabase
                .storage
                .from('Diary_File_Upoad')
                .upload(filePath, file)

            if (error) {
                console.log(error)
                setSnackbarState({
                    open: true,
                    message: `Failed to upload file: ${error.message}`,
                    severity: 'error'
                })
                return
            }

            const { data } = supabase
                .storage
                .from('Diary_File_Upoad')
                .getPublicUrl(filePath)

            const fileUrl = data.publicUrl

            const isImage =
                file.type.startsWith('image/')

            const attachment: DiaryAttachment = {
                id: filePath,
                name: file.name,
                url: fileUrl,
                type: file.type
            }

            setAttachments(prev => [attachment, ...prev])

            setEntry(prev => ({
                ...prev,
                attachments: [attachment, ...(prev.attachments ?? [])],
                content:
                    prev.content +
                    (
                        isImage
                            ? `
                <div style="margin-top:10px">
                    <a href="${fileUrl}" target="_blank" rel="noreferrer">
                        <img
                            src="${fileUrl}"
                            alt="${file.name}"
                            style="
                                max-width:100%;
                                border-radius:12px;
                                box-shadow:0 2px 10px rgba(0,0,0,0.15)
                            "
                        />
                    </a>
                </div>
                `
                            : `
                <p>
                    <a
                        href="${fileUrl}"
                        target="_blank"
                        rel="noreferrer"
                        style="
                            text-decoration:none;
                            font-weight:bold;
                        "
                    >
                        📎 Open ${file.name}
                    </a>
                </p>
                `
                    )
            }))

            // Reset the file input
            event.target.value = ''

            setSnackbarState({
                open: true,
                message: 'File uploaded successfully!',
                severity: 'success'
            })

        } catch (error) {

            console.log(error)
            setSnackbarState({
                open: true,
                message: 'An error occurred while uploading the file.',
                severity: 'error'
            })

        } finally {

            setUploading(false)
            // Ensure file input is reset even on error
            if (event.target) {
                event.target.value = ''
            }
        }
    }

    function handleAttachmentClick(attachment: DiaryAttachment) {
        setSelectedAttachment(attachment)
        setPreviewOpen(true)
    }

    function escapeRegExp(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    async function removeAttachment(attachmentId: string) {
        // Find the attachment in current state to get URL and name
        const target = attachments.find(a => a.id === attachmentId)
        const url = target?.url ?? ''
        const name = target?.name ?? ''

        // Delete from Supabase storage
        const deleted = await deleteAttachmentFromStorage(attachmentId)

        if (!deleted) {
            console.warn('removeAttachment: failed to delete file from storage:', attachmentId)
            return
        }

        // Remove from attachments state
        const updated = attachments.filter(item => item.id !== attachmentId)
        setAttachments(updated)

        // Clean entry.content: remove anchors and imgs that reference the file URL, and fallback by filename
        setEntry(prev => {
            let newContent = prev.content ?? ''

            if (url) {
                const urlEsc = escapeRegExp(url)
                // Remove <a ... href="url" ...>...</a>
                const anchorRegex = new RegExp(`<a[^>]*href=(?:'|")${urlEsc}(?:'|")[\\s\\S]*?<\\/a>`, 'gi')
                newContent = newContent.replace(anchorRegex, '')

                // Remove <img ... src="url" ...>
                const imgRegex = new RegExp(`<img[^>]*src=(?:'|")${urlEsc}(?:'|")[^>]*>`, 'gi')
                newContent = newContent.replace(imgRegex, '')
            }

            if (name) {
                const nameEsc = escapeRegExp(name)
                // Remove links containing the filename text (fallback)
                const linkByNameRegex = new RegExp(`<a[^>]*>[\\s\\S]*?${nameEsc}[\\s\\S]*?<\\/a>`, 'gi')
                newContent = newContent.replace(linkByNameRegex, '')
            }

            // Remove leftover empty paragraphs or excessive whitespace (optional cleanup)
            newContent = newContent.replace(/<p>\s*<\/p>/gi, '')
            newContent = newContent.replace(/\n{2,}/g, '\n')

            return {
                ...prev,
                attachments: updated,
                content: newContent
            }
        })

        // If the entry exists in DB, update it so DiaryList immediately reflects the change
        if (entry.id) {
            try {
                // Use the latest content from state (entry may be stale here), so read from current entry variable plus applied changes:
                // Build the updated content by applying same replacements to entry.content (safe fallback)
                let updatedContent = entry.content ?? ''
                if (url) {
                    const urlEsc = escapeRegExp(url)
                    const anchorRegex = new RegExp(`<a[^>]*href=(?:'|")${urlEsc}(?:'|")[\\s\\S]*?<\\/a>`, 'gi')
                    updatedContent = updatedContent.replace(anchorRegex, '')
                    const imgRegex = new RegExp(`<img[^>]*src=(?:'|")${urlEsc}(?:'|")[^>]*>`, 'gi')
                    updatedContent = updatedContent.replace(imgRegex, '')
                }
                if (name) {
                    const nameEsc = escapeRegExp(name)
                    const linkByNameRegex = new RegExp(`<a[^>]*>[\\s\\S]*?${nameEsc}[\\s\\S]*?<\\/a>`, 'gi')
                    updatedContent = updatedContent.replace(linkByNameRegex, '')
                }
                updatedContent = updatedContent.replace(/<p>\s*<\/p>/gi, '')
                updatedContent = updatedContent.replace(/\n{2,}/g, '\n')

                const { error } = await supabase
                    .from('entries')
                    .update({
                        attachments: updated,
                        content: updatedContent
                    })
                    .eq('id', entry.id)

                if (error) {
                    console.warn('removeAttachment: failed to update entry row after deleting attachment', error)
                } else {
                    // Notify listeners (DiaryList) to refresh if they choose to
                    window.dispatchEvent(new CustomEvent('diary-entry-updated', { detail: { id: entry.id, removedAttachmentId: attachmentId } }))
                }
            } catch (e) {
                console.warn('removeAttachment: unexpected error while updating entry', e)
            }
        } else {
            // For new (unsaved) entries the autosave already persisted the draft with updated attachments/content.
            // Dispatch an event in case other parts need to react.
            window.dispatchEvent(new CustomEvent('diary-entry-updated', { detail: { id: null, removedAttachmentId: attachmentId } }))
        }

        // Close preview if that was the selected attachment
        if (selectedAttachment?.id === attachmentId) {
            setSelectedAttachment(null)
            setPreviewOpen(false)
        }
    }

    function setNowDateTime() {

        setEntry({
            ...entry,
            date: new Date()
        })
    }

    function applyManualDateTime() {

        const date = new Date(manualDateTime + ':00')

        if (isNaN(date.getTime())) {
            setSnackbarState({
                open: true,
                message: 'Invalid date and time',
                severity: 'error'
            })
            return
        }

        setEntry({
            ...entry,
            date
        })

        setSnackbarState({
            open: true,
            message: 'Date & time updated',
            severity: 'success'
        })

        setOpenDateDialog(false)
    }

    function getCurrentLocation() {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const lat = position.coords.latitude
                const lng = position.coords.longitude

                const label = promptForLocationName('Current location')

                // Append structured HTML block with name stored in data-name; visible text is coordinates only
                const locHtml = createLocationHtml(lat, lng, label ?? '')

                setEntry(prev => ({
                    ...prev,
                    content: (prev.content ?? '') + locHtml
                }))
            },

            (error) => {
                console.log(error)
            }
        )
    }

    function clearDraft() {

        localStorage.removeItem(draftKey)

        setIsDraft(false)

        setEntry({
            date: new Date(),
            title: '',
            mood: 0,
            content: '',
            star: 1,
            attachments: []
        } as DiaryEntryType)

        setAttachments([])
        setPendingFavorite(false)
        setIsFavorite(false)
    }

    return (

        <Box
            sx={{
                p: 2,
                bgcolor: 'background.default',
                minHeight: '100vh'
            }}
        >

            <Card
                elevation={5}
                sx={{
                    borderRadius: 5,
                    overflow: 'hidden'
                }}
            >

                {/* HEADER */}
                <Box
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        p: 3
                    }}
                >

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <FavoriteIcon />
                        {id === undefined
                            ? 'Create Memory'
                            : 'Edit Memory'}
                    </Typography>

                    <Typography sx={{ opacity: 0.9 }}>
                        Capture your feelings, places and memories
                    </Typography>

                </Box>

                <CardContent sx={{ p: 3 }}>
                    {isDraft && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip label="Draft saved automatically" color="success" />
                            <Tooltip title="Clear All">
                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={clearDraft} sx={{ borderRadius: 3, textTransform: 'none' }}>
                                    Clear All
                                </Button>
                            </Tooltip>
                        </Box>
                    )}

                    {/* TOP SECTION */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            id="date"
                            label="Date & Time"
                            variant="outlined"
                            value={format(entry.date, "yyyy-MM-dd'T'HH:mm")}
                            type="datetime-local"
                            onChange={event => {
                                const date = new Date(event.target.value + ':00')
                                if (isNaN(date.getTime())) return
                                setEntry({
                                    ...entry,
                                    date
                                })
                            }}
                            InputLabelProps={{
                                shrink: true
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Set current time">
                                            <IconButton onClick={setNowDateTime}>
                                                <CalendarMonthIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setManualDateTime(format(entry.date, "yyyy-MM-dd'T'HH:mm"))
                                    setOpenDateDialog(true)
                                }}
                                startIcon={<EditCalendarIcon />}
                            >
                                Choose date & time
                            </Button>
                        </Box>
                    </Box>

                        <FormControl fullWidth>
                            <InputLabel id="mood-label">Mood</InputLabel>
                            <Select labelId="mood-label" value={entry.mood ?? 0} label="Mood" onChange={(event) => setEntry({ ...entry, mood: event.target.value as number })}>
                                {moodList.map((item, index) => (
                                    <MenuItem value={item.mood} key={index}>
                                        <Box component='span' sx={{ fontSize: '1.6em' }}>{moodList[item.mood].icon}</Box>
                                        <span style={{ paddingLeft: '0.7em' }}>{item.text}</span>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="starlabel">Star</InputLabel>
                            <Select labelId="starlabel" label="Star" value={entry.star} onChange={event => setEntry({ ...entry, star: event.target.value })}>
                                <MenuItem value={1}>★</MenuItem>
                                <MenuItem value={2}>★★</MenuItem>
                                <MenuItem value={3}>★★★</MenuItem>
                                <MenuItem value={4}>★★★★</MenuItem>
                                <MenuItem value={5}>★★★★★</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <TextField fullWidth id="title" label="Memory Title" variant="outlined" value={entry.title} onChange={event => setEntry({ ...entry, title: event.target.value })} sx={{ mb: 2 }} />

                    <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <Button variant="contained" startIcon={<MyLocationIcon />} onClick={getCurrentLocation} sx={actionButtonSx}>Current Location</Button>

                        <Button variant="outlined" startIcon={<LocationOnIcon />} onClick={() => {
                            const lat = prompt("Latitude")
                            const lng = prompt("Longitude")
                            if (!lat || !lng) return
                            const latN = parseFloat(lat)
                            const lngN = parseFloat(lng)
                            if (Number.isNaN(latN) || Number.isNaN(lngN)) {
                                alert('Invalid coordinates')
                                return
                            }
                            const label = promptForLocationName('Manual location')
                            const locHtml = createLocationHtml(latN, lngN, label ?? '')
                            setEntry({ ...entry, content: entry.content + locHtml })
                        }} sx={actionButtonSx}>Add Manual Location</Button>

                        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploading} sx={actionButtonSx}>
                            {uploading ? 'Uploading...' : 'Upload File'}
                            <input hidden type="file" onChange={uploadFile} />
                        </Button>

                        <Button variant={isFavorite ? "contained" : "outlined"} startIcon={<FavoriteIcon />} onClick={handleToggleFavorite} sx={{ ...actionButtonSx, color: isFavorite ? 'white' : undefined }}>
                            {isFavorite ? (entry.id ? 'Favorited' : 'Favorited (will save)') : 'Add to Favorites'}
                        </Button>
                    </Paper>

                    {attachments.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Uploaded Attachments</Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                                {attachments.map((attachment) => (
                                    <Paper key={attachment.id} elevation={2} sx={{ p: 1, borderRadius: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 1, minHeight: 120, position: 'relative', '&:hover': { boxShadow: 6 } }}>
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1, textAlign: 'center' }} onClick={() => handleAttachmentClick(attachment)}>
                                            {attachment.type?.startsWith('image/') ? (
                                                <Box component="img" src={attachment.url} alt={attachment.name} sx={{ width: '100%', maxHeight: 120, borderRadius: 2, objectFit: 'cover' }} />
                                            ) : (
                                                <UploadFileIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                                            )}

                                            {!attachment.type?.startsWith('image/') && (
                                                <Typography component="a" href={attachment.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} sx={{ fontSize: '0.95rem', fontWeight: 'bold', textDecoration: 'none', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                                                    📎 Open {attachment.name}
                                                </Typography>
                                            )}

                                            {attachment.type?.startsWith('image/') && (
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{attachment.name}</Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeAttachment(attachment.id ?? '') }} sx={{ backgroundColor: 'background.paper', color: 'primary.main', width: 36, height: 36, transition: '0.2s', '&:hover': { backgroundColor: 'action.hover', transform: 'scale(1.1)' } }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    <Editor tinymceScriptSrc={`/tinymce/tinymce.min.js`} onInit={(_evt: any, editor: any) => editorRef.current = editor} value={entry.content} onEditorChange={(content: string) => setEntry({ ...entry, content: content })} init={{
                        height: 500,
                        menubar: false,
                        plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'preview', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'],
                        toolbar: 'undo redo fullscreen | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image media | forecolor backcolor emoticons | code preview help',
                        toolbar_mode: 'sliding',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:15px; padding:10px }'
                    }} />

                    <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                        {!isNew && (
                            <Tooltip title="Delete Diary">
                                <IconButton color="error" onClick={() => setOpenDelete(true)} sx={{ border: '1px solid #f44336', borderRadius: 3, width: 50, height: 50 }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Go Back">
                            <IconButton onClick={() => navigate('/diarylist')} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, width: 50, height: 50, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover', transform: 'scale(1.05)' } }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>

                        <Button variant="contained" startIcon={<SaveIcon />} onClick={save} sx={{ borderRadius: 4, px: { xs: 2, sm: 4 }, py: 1.2, fontWeight: 'bold', boxShadow: '0 4px 14px rgba(233,30,99,0.35)', backgroundColor: 'primary.main', color: 'primary.contrastText', '&:hover': { backgroundColor: 'primary.dark', transform: 'translateY(-2px)' } }}>
                            Save Memory
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedAttachment?.name ?? 'Attachment Preview'}</DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedAttachment?.type?.startsWith('image/') ? (
                        <Box component="img" src={selectedAttachment.url} alt={selectedAttachment.name} sx={{ width: '100%', maxHeight: 550, objectFit: 'contain', borderRadius: 3 }} />
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography>This file can be opened in a new tab or downloaded.</Typography>
                            <Button variant="contained" component="a" href={selectedAttachment?.url} target="_blank" rel="noreferrer">Open File</Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} disableRestoreFocus>
                <DialogTitle>Delete Diary</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete this diary entry?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button color="error" variant="contained" startIcon={<DeleteIcon />} onClick={async (event) => { (event.currentTarget as HTMLButtonElement).blur(); setOpenDelete(false); await deleteEntry(); }}>Delete Entry</Button>
                </DialogActions>
            </Dialog>

            {/* Manual Date & Time Dialog */}
            <Dialog open={openDateDialog} onClose={() => setOpenDateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Set Date & Time Manually</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        fullWidth
                        label="Date & Time"
                        type="datetime-local"
                        value={manualDateTime}
                        onChange={(e) => setManualDateTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        helperText="Select the exact date and time for this memory"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDateDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={applyManualDateTime}>Apply</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarState.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity} sx={{ width: '100%' }}>{snackbarState.message}</Alert>
            </Snackbar>

        </Box>
    )
}

export default DiaryAddEdit