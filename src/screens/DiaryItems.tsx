import { Fab } from "@mui/material";
import DiaryList from "../diary/DiaryList"
import AddIcon from '@mui/icons-material/Add';

function DiaryItems() {

    return (
        <>
       <DiaryList/>
       <Fab color="secondary" aria-label="add" sx={{ 
        position: 'fixed',
        right: '16px',
       }}>
            <AddIcon />
          </Fab>
       </>
    )
}

export default DiaryItems
