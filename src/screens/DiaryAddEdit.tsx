import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { useLocation, useNavigate, useParams } from "react-router";
import { moodList, type DiaryEntryType } from "../diary/Diary";
import { useRef, useState } from "react";
import { format } from "date-fns/format";
import { supabase } from "../supabaseClient";
import { user } from "../App";
import { Editor } from "@tinymce/tinymce-react";

function DiaryAddEdit() {

    const { id } = useParams();
    const navigate = useNavigate()
    const location = useLocation()
    const [entry, setEntry] = useState(id === undefined ? {
        date: new Date(),
        title: '',
        mood: 0,
        content: '',
        star: 1,
    } : location.state as DiaryEntryType)
    console.log(id + ' ' + entry?.id)
    console.log(location.state)

    const editorRef = useRef(null)

    async function save() {
        try {
            if (entry.id === undefined) {
                const result = await supabase.from('entries').insert({
                    created_at: entry.date.toISOString(),
                    title: entry.title,
                    content: entry.content,
                    mood: entry.mood,
                    star: entry.star,
                    user_id: user?.session?.user.id ?? '',
                })//.select()
                console.log(result)
            } else {
                const result = await supabase.from('entries').update({
                    id: entry.id,
                    created_at: entry.date.toISOString(),
                    title: entry.title,
                    content: entry.content,
                    mood: entry.mood,
                    star: entry.star,
                    user_id: user?.session?.user.id ?? '',
                }).eq('id', entry.id)
                console.log(result)
            }
            navigate('/diarylist')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Typography variant="h4" component="h4" sx={{ pb: 2, pt: 1 }}>{id === undefined ? 'Add' : 'Edit'} Diary Item</Typography>
            <TextField
                id="date"
                label="Date/time"
                variant="outlined"
                value={format(entry.date, 'yyyy-MM-dd\'T\'HH:mm:ss')}
                type="datetime-local"
                onChange={event => {
                    const date = new Date(event.target.value)
                    if (isNaN(date.getTime()))
                        return
                    setEntry({
                        ...entry, date: date
                    })
                }}
                sx={{
                    "& .MuiInputBase-root": {
                        height: '65px'
                    },
                    mr: 0.5,
                    mb: 1.5
                }}
            />
            <FormControl>
                <InputLabel id="mood-label">Mood</InputLabel>
                <Select
                    labelId="mood-label"
                    id="mood-select"
                    value={entry.mood ?? 0}
                    label="Mood"
                    onChange={(event) => {
                        entry.mood = event.target.value as number
                        setEntry({ ...entry })
                    }}
                    sx={{
                        mr: 0.5,
                        mb: 1.5
                    }}
                >
                    {moodList.map((item, index) => (
                        <MenuItem value={item.mood} key={index}>
                            <Box component='span' sx={{ fontSize: '1.6em' }}>
                                {moodList[item.mood].icon}
                            </Box>
                            <span style={{ paddingLeft: '0.7em' }}>{item.text}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel id="starlabel">Star</InputLabel>
                <Select
                    labelId="starlabel"
                    id="star"
                    label="Star"
                    value={entry.star}
                    onChange={event => setEntry({
                        ...entry, star: event.target.value
                    })}
                    sx={{
                        height: '65px',
                        mb: 1.5
                    }}
                >
                    <MenuItem value={1}>★</MenuItem>
                    <MenuItem value={2}>★★</MenuItem>
                    <MenuItem value={3}>★★★</MenuItem>
                    <MenuItem value={4}>★★★★</MenuItem>
                    <MenuItem value={5}>★★★★★</MenuItem>
                </Select>
            </FormControl>
            <TextField
                fullWidth
                id="title"
                label="Title"
                variant="outlined"
                value={entry.title}
                onChange={event => setEntry({
                    ...entry, title: event.target.value
                })}
                sx={{
                    mb: 1.5
                }}
            />
            <Box sx={{ ml: 1 }}>
                <Editor
                    tinymceScriptSrc={`/tinymce/tinymce.min.js`}
                    onInit={(_evt: any, editor: any) => editorRef.current = editor}
                    value={entry.content}
                    onEditorChange={(content: string) => setEntry({
                        ...entry, content: content
                    })}
                    init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'charmap', 'emoticons'
                        ],
                        toolbar: 'undo redo fullscreen | bold italic underline cut copy paste | link unlink strikethrough superscript subscript | ' +
                            'highlight forecolor backcolor removeformat search  | ' +
                            'align numlist bullist outdent indent image media | ' +
                            'styles fontsizeinput lineheight | ' +
                            'table hr charmap emoticons anchor | ' +
                            'detectverse code preview help',
                        toolbar_mode: 'sliding',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            </Box>
            <Button variant="outlined" onClick={() => navigate('/diarylist')}>Cancel</Button>
            <Button variant="contained" onClick={() => save()} sx={{ ml: 1 }}>Save</Button>
        </Box>
    )
}

export default DiaryAddEdit
