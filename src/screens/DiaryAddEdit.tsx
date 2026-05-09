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
    Typography
} from "@mui/material"

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router"

import {
    moodList,
    type DiaryEntryType
} from "../diary/Diary"

import {
    useEffect,
    useRef,
    useState
} from "react"

import { format } from "date-fns/format"

import { supabase } from "../supabaseClient"
import { user } from "../App"

import { Editor } from "@tinymce/tinymce-react"

import DeleteIcon from "@mui/icons-material/Delete"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import SaveIcon from "@mui/icons-material/Save"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MyLocationIcon from "@mui/icons-material/MyLocation"
import FavoriteIcon from "@mui/icons-material/Favorite"

function DiaryAddEdit() {

    const { id } = useParams()

    const navigate = useNavigate()

    const location = useLocation()

    const isNew = id === undefined

    const [openDelete, setOpenDelete] = useState(false)

    const [entry, setEntry] = useState<DiaryEntryType>(
        isNew
            ? {
                date: new Date(),
                title: '',
                mood: 0,
                content: '',
                star: 1,
            }
            : (location.state as DiaryEntryType) ?? {
                date: new Date(),
                title: '',
                mood: 0,
                content: '',
                star: 1,
            }
    )

    const [uploading, setUploading] = useState(false)

    const draftKey = id
        ? `diary-draft-${id}`
        : "diary-draft-new"

    const [isDraft, setIsDraft] = useState(false)

    useEffect(() => {

        const saved = localStorage.getItem(draftKey)

        if (saved) {

            try {

                const parsed = JSON.parse(saved)

                setEntry({
                    ...parsed,
                    date: new Date(parsed.date)
                })

            } catch (e) {
                console.log("Failed to load draft")
            }
        }

    }, [])

    useEffect(() => {

        const handler = setTimeout(() => {

            localStorage.setItem(
                draftKey,
                JSON.stringify(entry)
            )

            setIsDraft(true)

        }, 500)

        return () => clearTimeout(handler)

    }, [entry])

    const editorRef = useRef(null)

    async function save() {

        try {

            let result

            if (entry.id === undefined) {

                result = await supabase
                    .from('entries')
                    .insert({
                        created_at: entry.date.toISOString(),
                        title: entry.title,
                        content: entry.content,
                        mood: entry.mood,
                        star: entry.star,
                        user_id: user?.session?.user.id ?? '',
                    })

            } else {

                result = await supabase
                    .from('entries')
                    .update({
                        created_at: entry.date.toISOString(),
                        title: entry.title,
                        content: entry.content,
                        mood: entry.mood,
                        star: entry.star,
                        user_id: user?.session?.user.id ?? '',
                    })
                    .eq('id', entry.id)
            }

            console.log(result)

            localStorage.removeItem(draftKey)

            navigate('/diarylist')

        } catch (error) {

            console.log(error)
        }
    }

    async function deleteEntry() {

        if (!entry.id) return

        try {

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

            const fileName = `${Date.now()}-${file.name}`

            const filePath =
                `${user.session?.user.id}/${fileName}`

            const { error } = await supabase
                .storage
                .from('Diary_File_Upoad')
                .upload(filePath, file)

            if (error) {
                console.log(error)
                return
            }

            const { data } = supabase
                .storage
                .from('Diary_File_Upoad')
                .getPublicUrl(filePath)

            const fileUrl = data.publicUrl

            setEntry({
                ...entry,
                content:
                    entry.content +
                    `<p>
                        <a href="${fileUrl}" target="_blank">
                            📎 ${file.name}
                        </a>
                    </p>`
            })

        } catch (error) {

            console.log(error)

        } finally {

            setUploading(false)
        }
    }

    function setNowDateTime() {

        setEntry({
            ...entry,
            date: new Date()
        })
    }

    function getCurrentLocation() {

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const lat = position.coords.latitude
                const lng = position.coords.longitude

                const locationText =
                    `[${lat}, ${lng}]`

                setEntry({
                    ...entry,
                    content:
                        entry.content +
                        `<p>${locationText}</p>`
                })
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
        })
    }

    return (

        <Box
            sx={{
                p: 2,
                background:
                    'linear-gradient(180deg,#fff0f5 0%,#ffffff 100%)',
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
                        background:
                            'linear-gradient(135deg,#e91e63 0%,#ff80ab 100%)',
                        color: 'white',
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

                            <Chip
                                label="Draft saved automatically"
                                color="success"
                            />

                            <Tooltip title="Clear draft">
                                <IconButton
                                    size="small"
                                    onClick={clearDraft}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                        </Box>
                    )}

                    {/* TOP SECTION */}
                    <Stack
                        direction={{
                            xs: 'column',
                            md: 'row'
                        }}
                        spacing={2}
                        sx={{ mb: 2 }}
                    >

                        {/* DATE */}
                        <TextField
                            fullWidth
                            id="date"
                            label="Date & Time"
                            variant="outlined"
                            value={format(
                                entry.date,
                                "yyyy-MM-dd'T'HH:mm"
                            )}
                            type="datetime-local"
                            onChange={event => {

                                const date =
                                    new Date(
                                        event.target.value + ':00'
                                    )

                                if (isNaN(date.getTime())) return

                                setEntry({
                                    ...entry,
                                    date: date
                                })
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Set current time">
                                            <IconButton
                                                onClick={setNowDateTime}
                                            >
                                                <CalendarMonthIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* MOOD */}
                        <FormControl fullWidth>

                            <InputLabel id="mood-label">
                                Mood
                            </InputLabel>

                            <Select
                                labelId="mood-label"
                                value={entry.mood ?? 0}
                                label="Mood"
                                onChange={(event) => {

                                    setEntry({
                                        ...entry,
                                        mood: event.target.value as number
                                    })
                                }}
                            >

                                {moodList.map((item, index) => (

                                    <MenuItem
                                        value={item.mood}
                                        key={index}
                                    >

                                        <Box
                                            component='span'
                                            sx={{
                                                fontSize: '1.6em'
                                            }}
                                        >
                                            {moodList[item.mood].icon}
                                        </Box>

                                        <span
                                            style={{
                                                paddingLeft: '0.7em'
                                            }}
                                        >
                                            {item.text}
                                        </span>

                                    </MenuItem>
                                ))}

                            </Select>

                        </FormControl>

                        {/* STAR */}
                        <FormControl fullWidth>

                            <InputLabel id="starlabel">
                                Star
                            </InputLabel>

                            <Select
                                labelId="starlabel"
                                label="Star"
                                value={entry.star}
                                onChange={event =>
                                    setEntry({
                                        ...entry,
                                        star: event.target.value
                                    })
                                }
                            >

                                <MenuItem value={1}>★</MenuItem>
                                <MenuItem value={2}>★★</MenuItem>
                                <MenuItem value={3}>★★★</MenuItem>
                                <MenuItem value={4}>★★★★</MenuItem>
                                <MenuItem value={5}>★★★★★</MenuItem>

                            </Select>

                        </FormControl>

                    </Stack>

                    {/* TITLE */}
                    <TextField
                        fullWidth
                        id="title"
                        label="Memory Title"
                        variant="outlined"
                        value={entry.title}
                        onChange={event =>
                            setEntry({
                                ...entry,
                                title: event.target.value
                            })
                        }
                        sx={{ mb: 2 }}
                    />

                    {/* ACTION BUTTONS */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 4,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            background:
                                'linear-gradient(135deg,#fff5f8,#ffffff)'
                        }}
                    >

                        {/* CURRENT LOCATION */}
                        <Button
                            variant="contained"
                            startIcon={<MyLocationIcon />}
                            onClick={getCurrentLocation}
                            sx={{
                                borderRadius: 3
                            }}
                        >
                            Current Location
                        </Button>

                        {/* MANUAL LOCATION */}
                        <Button
                            variant="outlined"
                            startIcon={<LocationOnIcon />}
                            onClick={() => {

                                const lat =
                                    prompt("Latitude")

                                const lng =
                                    prompt("Longitude")

                                if (!lat || !lng) return

                                setEntry({
                                    ...entry,
                                    content:
                                        entry.content +
                                        `<p>[${lat}, ${lng}]</p>`
                                })
                            }}
                            sx={{
                                borderRadius: 3
                            }}
                        >
                            Add Manual Location
                        </Button>

                        {/* FILE UPLOAD */}
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            disabled={uploading}
                            sx={{
                                borderRadius: 3
                            }}
                        >
                            {uploading
                                ? 'Uploading...'
                                : 'Upload File'}

                            <input
                                hidden
                                type="file"
                                onChange={uploadFile}
                            />
                        </Button>

                    </Paper>

                    <Divider sx={{ mb: 2 }} />

                    {/* EDITOR */}
                    <Editor
                        tinymceScriptSrc={`/tinymce/tinymce.min.js`}
                        onInit={(_evt: any, editor: any) =>
                            editorRef.current = editor
                        }
                        value={entry.content}
                        onEditorChange={(content: string) =>
                            setEntry({
                                ...entry,
                                content: content
                            })
                        }
                        init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                                'advlist',
                                'autolink',
                                'lists',
                                'link',
                                'image',
                                'preview',
                                'searchreplace',
                                'visualblocks',
                                'code',
                                'fullscreen',
                                'insertdatetime',
                                'media',
                                'table',
                                'help',
                                'wordcount',
                                'emoticons'
                            ],

                            toolbar:
                                'undo redo fullscreen | ' +
                                'bold italic underline | ' +
                                'alignleft aligncenter alignright | ' +
                                'bullist numlist | ' +
                                'link image media | ' +
                                'forecolor backcolor emoticons | ' +
                                'code preview help',

                            toolbar_mode: 'sliding',

                            content_style:
                                'body {' +
                                'font-family:Helvetica,Arial,sans-serif;' +
                                'font-size:15px;' +
                                'padding:10px' +
                                '}'
                        }}
                    />

                    {/* FOOTER BUTTONS */}
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            mt: 3,
                            justifyContent: 'flex-end'
                        }}
                    >

                        {/* DELETE BUTTON */}
                        {!isNew && (
                            <Tooltip title="Delete Diary">

                                <IconButton
                                    color="error"
                                    onClick={() => setOpenDelete(true)}
                                    sx={{
                                        border: '1px solid #f44336',
                                        borderRadius: 3,
                                        width: 50,
                                        height: 50
                                    }}
                                >
                                    <DeleteIcon />

                                </IconButton>

                            </Tooltip>
                        )}

                        {/* CANCEL */}
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBackIcon />}
                            onClick={() =>
                                navigate('/diarylist')
                            }
                            sx={{
                                borderRadius: 3,
                                px: 3
                            }}
                        >
                            Cancel
                        </Button>

                        {/* SAVE */}
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={save}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                background:
                                    'linear-gradient(135deg,#e91e63,#ff80ab)'
                            }}
                        >
                            Save Memory
                        </Button>

                    </Stack>

                </CardContent>

            </Card>

            {/* DELETE CONFIRMATION */}
            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
            >

                <DialogTitle>
                    Delete Diary
                </DialogTitle>

                <DialogContent>

                    <Typography>
                        Are you sure you want to delete this diary entry?
                    </Typography>

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={() => setOpenDelete(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        onClick={deleteEntry}
                    >
                        Delete
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    )
}

export default DiaryAddEdit