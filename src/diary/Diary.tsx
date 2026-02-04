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
        content: 'My first entry din.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'
    },
    {
        mood: 2,
        date: new Date(),
        title: 'My first sad entry',
        content: 'My first entry din. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).'
    },
    {
        mood: 3,
        date: new Date(),
        title: 'My first entry',
        content: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.'
    },
    {
        mood: 4,
        date: new Date(),
        title: 'My first hunger, silent h',
        content: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
    },
    {
        mood: 5,
        date: new Date(),
        title: 'My first hunger',
        content: 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.'
    },
]
