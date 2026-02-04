import BlockIcon from '@mui/icons-material/Block';
import CloudIcon from '@mui/icons-material/Cloud';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

export type MoodType = {
    mood: number,
    text: string,
    icon?: any,
}

export type DiaryEntryType = {
    date: Date,
    title: string,
    mood: number,
    content: string,
    
}

export const moodList: MoodType[] = [
    {
        mood: 0,
        text: 'Happy',
        icon: <SentimentSatisfiedAltIcon sx={{ color: '#d4a302', fontSize: 'inherit' }} />,
    }, {
        mood: 1,
        text: 'Excited',
        icon: <SentimentVerySatisfiedIcon sx={{ color: '#109900', fontSize: 'inherit' }} />,
    }, {
        mood: 2,
        text: 'Love',
        icon: <FavoriteIcon sx={{ color: '#ee0000', fontSize: 'inherit' }} />,
    }, {
        mood: 3,
        text: 'Hungry',
        icon: <RamenDiningIcon sx={{ color: '#fc7b03', fontSize: 'inherit' }} />,
    }, {
        mood: 4,
        text: 'Angry',
        icon: <SentimentDissatisfiedIcon sx={{ color: '#ff0000', fontSize: 'inherit' }} />,
    }, {
        mood: 5,
        text: 'Furious',
        icon: <SentimentVeryDissatisfiedIcon sx={{ color: '#ee00ee', fontSize: 'inherit' }} />,
    }, {
        mood: 6,
        text: 'Sleepy',
        icon: <SentimentVeryDissatisfiedIcon sx={{ color: '#0468bf', fontSize: 'inherit' }} />,
    }, {
        mood: 7,
        text: 'Sad',
        icon: <MoodBadIcon sx={{ color: '#5a5ae8', fontSize: 'inherit' }} />,
    }, {
        mood: 8,
        text: 'Gloomy',
        icon: <CloudIcon sx={{ color: '#888888', fontSize: 'inherit' }} />,
    }, {
        mood: 9,
        text: 'Block',
        icon: <BlockIcon sx={{ color: '#dd0000', fontSize: 'inherit' }} />,
    }
]

export const sampleDiary: DiaryEntryType[] = [
    {
        mood: 1,
        date: new Date(),
        title: 'My first entry',
        content: 'My first entry din.'
    },
    {
        mood: 2,
        date: new Date(),
        title: 'My first sad entry',
        content: 'My first entry din.'
    },
    {
        mood: 3,
        date: new Date(),
        title: 'My first entry',
        content: 'My first entry din.'
    },
    {
        mood: 4,
        date: new Date(),
        title: 'My first hunger, silent h',
        content: 'My first hunger din.'
    },
    {
        mood: 5,
        date: new Date(),
        title: 'My first hunger',
        content: 'My first hunger din.'
    },
]
