import Fab from "@mui/material/Fab"
import AddIcon from '@mui/icons-material/Add';

import DiaryList from "../diary/DiaryList"
import { useNavigate } from "react-router";

function DiaryItems() {

    const navigate = useNavigate()

    return (
        <>
            <DiaryList />
            <Fab color="secondary" aria-label="add" sx={{
                position: 'fixed',
                right: '16px',
                bottom: '16px'
            }} onClick={() => navigate('/diaryedit')}>
                <AddIcon />
            </Fab>
        </>
    )
}

export default DiaryItems