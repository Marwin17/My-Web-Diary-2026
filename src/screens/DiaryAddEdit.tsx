import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"

function DiaryAddEdit() {

    return (
        <>
            <p>DiaryAddEdit Po</p>
            <TextField id="outlined-basic" label="title" variant="outlined" />
            <FormControl fullWidth>
                <InputLabel id="starlabel">Star</InputLabel>
                <Select
                    labelId="starlabel"
                    id="star"
                    label="Star"
                >
                    <MenuItem value={1}>★</MenuItem>
                    <MenuItem value={2}>★★</MenuItem>
                    <MenuItem value={3}>★★★</MenuItem>
                    <MenuItem value={4}>★★★★</MenuItem>
                    <MenuItem value={5}>★★★★★</MenuItem>
                </Select>
            </FormControl>

            <TextField id="outlined-basic" label="content" variant="outlined" multiline minRows={10} />

            <Button variant="outlined">Cancel</Button>
            <Button variant="contained">Save</Button>


        </>
    )
}

export default DiaryAddEdit