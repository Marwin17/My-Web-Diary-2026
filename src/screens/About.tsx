import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MapIcon from '@mui/icons-material/Map';
import MoodIcon from '@mui/icons-material/Mood';
import LockIcon from '@mui/icons-material/Lock';
import CreateIcon from '@mui/icons-material/Create';
import StarIcon from '@mui/icons-material/Star';

function About() {
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const developerEmail = "hello@lovediaryapp.com"; // Change this to your real email

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(developerEmail);
        setOpenSnackbar(true);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Love Diary',
                    text: 'Check out Love Diary - my personal digital sanctuary!',
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            alert("Sharing is not supported on this browser, but you can copy the URL!");
        }
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 4, mb: 4, backgroundColor: 'rgba(233, 30, 99, 0.05)', border: '1px solid rgba(233, 30, 99, 0.1)' }}>
                <AutoAwesomeIcon sx={{ fontSize: 50, color: '#e91e63', mb: 1 }} />
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: '800', fontFamily: 'monospace', color: '#e91e63' }}>
                    Love Diary
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: '600px', mx: 'auto', fontStyle: 'italic' }}>
                    "A digital time capsule for your thoughts, a safe harbor for your feelings, and a map of your beautiful life."
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        startIcon={<ShareIcon />}
                        onClick={handleShare}
                        sx={{ borderRadius: 8, backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#c2185b' } }}
                    >
                        Share with a Friend
                    </Button>
                </Box>
            </Paper>

            {/* Purpose Section */}
            <Box sx={{ mb: 6, textAlign: 'center', px: { xs: 1, sm: 4 } }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    What is this space for?
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Life moves fast, and the little moments often slip through our fingers. 
                    Love Diary was created to help you hit pause. Whether you need to untangle a messy 
                    thought, celebrate a quiet victory, or just brain-dump after a long day, this is your 
                    judgment-free zone. It's more than a notepad; it's a tool for mindfulness, self-reflection, 
                    and recognizing the patterns in your own emotional journey.
                </Typography>
            </Box>

            <Divider sx={{ mb: 5 }} />

            {/* Features Section */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                What's inside your diary?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 6 }}>
                
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <CreateIcon sx={{ fontSize: 32, color: '#9c27b0', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Expressive Entries</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Write down your daily stories. With rich formatting, you can craft beautiful entries that capture exactly how you felt in the moment.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <MoodIcon sx={{ fontSize: 32, color: '#ff9800', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Mood Tracking</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Assign an emotion to every entry. Over time, you can filter your diary to see what makes you happy, or reflect on the days you felt down.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <MapIcon sx={{ fontSize: 32, color: '#4caf50', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Memory Mapping</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tag your entries with coordinates. Our built-in map turns your diary into a geographic scrapbook, showing you exactly where your memories took place.
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <StarIcon sx={{ fontSize: 32, color: '#ffc107', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Highlight the Best</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Give your best days a star rating. When you're feeling nostalgic, easily search and look back at your 5-star moments.
                    </Typography>
                </Paper>
            </Box>

            {/* Security Note */}
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3, backgroundColor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <LockIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">100% Private & Yours</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Secured by modern cloud authentication. Your thoughts are encrypted and visible only to you.
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Developer/Contact Section */}
            <Box sx={{ textAlign: 'center', pb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Say Hello!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    Have an idea to make Love Diary better? Or just want to say hi? Reach out anytime.
                </Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyEmail}
                    sx={{ borderRadius: 8, color: '#e91e63', borderColor: '#e91e63', '&:hover': { borderColor: '#c2185b', backgroundColor: 'rgba(233, 30, 99, 0.04)' } }}
                >
                    Copy Email
                </Button>
            </Box>

            {/* Confirmation Toast */}
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
                    Email copied to clipboard!
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default About;
