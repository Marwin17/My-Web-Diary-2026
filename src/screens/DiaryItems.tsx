import Fab from "@mui/material/Fab"
import AddIcon from '@mui/icons-material/Add';


import { useNavigate } from "react-router";
import DiaryList from "../diary/DiaryList";

function DiaryItems({ results }: { results?: any[] }) {

    const navigate = useNavigate()

    return (
        <>
            <DiaryList results={results} /> {/* ✅ pass it here */}
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
    )
}

export default DiaryItems