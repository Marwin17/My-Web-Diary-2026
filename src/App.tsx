/*
 * File: App.tsx
 * Authors: Marwin Tan, Mary Allison Chen,  Julia Irene Sia
 * Created: Jan 28, 2026
 * Description: Main application component that handles routing, authentication, theme switching, and provides the overall structure for the web diary application.
 * Copyright: © 2026 My Web Diary Team. All rights reserved.
 */

import * as React from 'react';
import { useEffect } from 'react';

import Diversity1Icon from '@mui/icons-material/Diversity1';
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { ThemeProvider } from '@emotion/react';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'

import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import About from './screens/About';
import { darkTheme, theme } from './Theme';
import Dashboard from './screens/Dashboard';
import DiaryAddEdit from './screens/DiaryAddEdit';
import DiaryItems from './screens/DiaryItems';
import ChangePassword from './screens/ChangePassword';
import HelpScreen from './screens/HelpScreen';

import Login from './screens/Login';
import Map from './screens/Maps';
import Register from './screens/Register';
import { Route, Routes, useNavigate } from 'react-router';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

// Type definition for page routes
type PageRoute = {
  page: string,
  route: string,
}

// Array of main navigation pages
const pages: PageRoute[] = [
  { page: 'Dashboard', route: '/' },
  { page: 'Diary', route: '/diarylist' },
  { page: 'New', route: '/diaryedit' },
  { page: 'Help', route: '/Helpscreen' },
  { page: 'About', route: '/about' }
]

// Array of settings pages for unauthenticated users
const settings: PageRoute[] = [
  { page: 'Register', route: '/register' },
  { page: 'Login', route: '/login' },
]

// Array of settings pages for authenticated users
const settingsUser: PageRoute[] = [
  { page: 'Change password', route: '/password' },
  { page: 'Logout', route: '/logout' },
]

// Interface for user type
export interface UserType {
  session: Session | null
  email: string | null
  avatar: string | null
  username: string | null
}

// Global user object
export const user: UserType = {
  session: null,
  email: null,
  avatar: null,
  username: null
}

// Function to test profiles table connection
function testProfiles() {
  supabase.from('profiles').select().then(({ data, error }) => {
    console.log(data)
    console.log(error)
  })
}

// Main App component function
function App() {

  const navigate = useNavigate()

  const [dark, setDark] = React.useState(false)

  // Track optional search results; undefined means no search has been performed yet
  const [results, setResults] = React.useState<any[] | undefined>(undefined);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    initUser()
  }, [])

  // Function to handle opening user menu
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Function to handle navigation menu selection
  const handleNavMenu = (page: string) => {
    //alert(page)
    navigate(page)
    setAnchorElNav(null);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (page: string) => {
    setAnchorElUser(null)
    if (page === '/logout') {
      logout()
      return
    }
    navigate(page)
  };

  const [username, setUsername] = React.useState('')
  const [openProfileSettings, setOpenProfileSettings] = React.useState(false)

  // Function to handle user logout
  const logout = async () => {
    setAnchorElUser(null)

    const { error } = await supabase.auth.signOut()

    user.session = null
    user.email = null
    user.avatar = null

    setAvatar(null)

    if (error) {
      console.log(error)
      return
    }

    navigate('/login')
  }

  // Type definition for profile data
  type ProfileData = {
    avatar_url: string | null
    username: string | null
  }

  // Function to load user profile data
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, username')
      .eq('id', userId)
      .single() as {
        data: ProfileData | null
        error: any
      };

    console.log("PROFILE DATA FROM DB:", data);
    console.log("PROFILE ERROR FROM DB:", error);

    if (data?.avatar_url) {
      setAvatar(data.avatar_url);
      user.avatar = data.avatar_url;
    }

    if (data?.username) {
      setUsername(data.username)
      user.username = data.username
    }
  };

  // Function to save updated username
  const saveUsername = async () => {

    const userId = user.session?.user?.id

    if (!userId) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: username,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.log(error)
      return
    }

    user.username = username
    setOpenProfileSettings(false)
  }

  // Function to initialize user session and profile
  const initUser = async () => {
    const { data } = await supabase.auth.getSession();

    const session = data.session;

    user.session = session;
    user.email = session?.user?.email ?? null;

    if (session?.user?.id) {
      await loadProfile(session.user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      user.session = session;
      user.email = session?.user?.email ?? null;

      if (session?.user?.id) {
        await loadProfile(session.user.id);
      } else {
        setAvatar(null);
        setUsername('');
        navigate('/login');
      }
    });
  };

  const [avatar, setAvatar] = React.useState<string | null>(null)

  const [openDrawer, setOpenDrawer] = React.useState(false);

  // Function to perform search on diary entries
  const handleSearch = async (text: string) => {
    if (!text.trim()) return;

    try {
      const { data, error } = await (supabase as any).rpc('search_entries', {
        search_query: text,
        filters: filters
      });

      if (error) throw error;

      setResults(data); // ✅ THIS is the important part
    } catch (error) {
      if (error instanceof Error) {
        console.error("Search failed:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  const [filters, setFilters] = React.useState<{
    dateFrom?: string;
    dateTo?: string;
    mood?: string;
  }>({});

  // Function to update search filters
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Main render function
  return (
    <ThemeProvider theme={dark ? darkTheme : theme}>
      <CssBaseline />
      {/* Main app bar */}
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        {/* Navigation drawer */}
        <Drawer
          anchor="left"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          ModalProps={{
            keepMounted: true
          }}

          sx={{
            zIndex: (theme) => theme.zIndex.appBar - 1,
            '& .MuiDrawer-paper': {
              zIndex: (theme) => theme.zIndex.appBar - 1,
              top: {
                xs: '56px',
                sm: '64px'
              },
              height: {
                xs: 'calc(100% - 56px)',
                sm: 'calc(100% - 64px)'
              }
            }
          }}
        >
          <Box
            sx={{
              width: 280,
              height: '100%',
              background: dark 
                ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(180deg, #ffe4ec 0%, #fff 100%)',
              p: 2
            }}
            role="presentation"
          >

            {/* Header inside drawer */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: dark ? '#ff69b4' : '#d81b60' }}>
                💕 Love Diary
              </Typography>
              <Typography variant="caption" sx={{ color: dark ? '#b0b0b0' : 'gray' }}>
                Your memories, your emotions
              </Typography>
            </Box>

            <List>
              {pages.map((page) => (
                <ListItem key={page.page} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      handleNavMenu(page.route);
                      setOpenDrawer(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      transition: '0.2s',
                      color: dark ? '#e0e0e0' : 'inherit',
                      '&:hover': {
                        backgroundColor: dark ? '#404040' : '#ffd1dc',
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500 }}>
                          💌 {page.page}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Footer inside drawer */}
            <Box sx={{ position: 'absolute', bottom: 20, width: '90%', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: dark ? '#808080' : 'gray' }}>
                Made with ❤️ for your memories
              </Typography>
            </Box>

          </Box>
        </Drawer>
        {/* Toolbar with navigation */}
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>

          {/* LEFT SECTION: Just the Hamburger Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={() => setOpenDrawer(!openDrawer)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* CENTER SECTION: Icon and Title together */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 2,
              cursor: 'pointer',
              transition: '0.2s',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.02)'
              }
            }}
          >
            <Diversity1Icon
              sx={{
                mr: 1,
                fontSize: { xs: '24px', md: '30px' }
              }}
            />

            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: { xs: '.1rem', md: '.3rem' },
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Love Diary
            </Typography>
          </Box>

          {/* RIGHT SECTION: Avatar and Menu Logic */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>

            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  key={avatar}
                  src={avatar || undefined}
                />
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={() => setAnchorElUser(null)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >

              {/* 💖 PROFILE HEADER */}
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg,#ffe0ec,#fff)'
                }}
              >

                <Avatar
                  src={avatar || undefined}
                  sx={{
                    width: 70,
                    height: 70,
                    mx: 'auto',
                    mb: 1
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 'bold',
                    color: '#d81b60'
                  }}
                >
                  {username || 'Love Diary User'}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: 'gray'
                  }}
                >
                  {user.email}
                </Typography>

              </Box>

              <Divider />

              {/* 💖 PROFILE SETTINGS */}
              <MenuItem
                onClick={() => {
                  setOpenProfileSettings(true)
                  setAnchorElUser(null)
                }}
              >
                ⚙️ Profile Settings
              </MenuItem>

              {/* 💖 REGISTER / LOGIN IF NOT LOGGED IN */}
              {!user.session && (
                <>
                  <MenuItem
                    onClick={() => handleCloseUserMenu('/register')}
                  >
                    💖 Register
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleCloseUserMenu('/login')}
                  >
                    💖 Login
                  </MenuItem>
                </>
              )}

              {/* 💖 USER OPTIONS */}
              {user.session && [
                <MenuItem
                  key="change-password"
                  onClick={() => handleCloseUserMenu('/password')}
                >
                  🔒 Change Password
                </MenuItem>,

                <MenuItem
                  key="logout"
                  onClick={() => {
                    setAnchorElUser(null)
                    logout()
                  }}
                >
                  <Typography sx={{ color: '#d32f2f' }}>
                    🚪 Logout
                  </Typography>
                </MenuItem>,
              ]}

              {/* 💖 DARK MODE */}
              <Box sx={{ px: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dark}
                      onChange={() => setDark(!dark)}
                    />
                  }
                  label="Dark mode"
                />
              </Box>

            </Menu>

          </Box>
        </Toolbar>
        <Dialog
          open={openProfileSettings}
          onClose={() => setOpenProfileSettings(false)}
          disableRestoreFocus
        >

          <DialogTitle>
            💖 Profile Settings
          </DialogTitle>

          <DialogContent sx={{ minWidth: 320 }}>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2
              }}
            >

              <Avatar
                src={avatar || undefined}
                sx={{
                  width: 90,
                  height: 90,
                  mb: 1
                }}
              />

              <Typography sx={{ fontSize: '0.8rem', color: 'gray' }}>
                {user.email}
              </Typography>

            </Box>

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Change Profile Picture

              <input
                hidden
                type="file"
                accept="image/*"

                onChange={async (event) => {

                  const file = event.target.files?.[0]
                  const userId = user.session?.user?.id

                  if (!file || !userId) return

                  const filePath = `${userId}/${Date.now()}.png`

                  const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file)

                  if (uploadError) {
                    console.log(uploadError)
                    return
                  }

                  const { data } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)

                  const publicUrl = `${data.publicUrl}?t=${Date.now()}`

                  await supabase
                    .from('profiles')
                    .upsert({
                      id: userId,
                      avatar_url: publicUrl,
                      username: username
                    })

                  setAvatar(publicUrl)
                }}
              />
            </Button>

          </DialogContent>

          <DialogActions>

            <Button
              onClick={() => setOpenProfileSettings(false)}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={saveUsername}
            >
              Save
            </Button>

          </DialogActions>

        </Dialog>
      </AppBar>
      <Toolbar />
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='about' element={<About />} />
        <Route path='diarylist' element={<DiaryItems results={results} />} />
        <Route path='diaryedit/:id?' element={<DiaryAddEdit />} />
        <Route path='register' element={<Register />} />
        <Route path='login' element={<Login />} />
        <Route path='password' element={<ChangePassword />} />
        <Route path='map/:loc' element={<Map />} />
        <Route path='helpscreen' element={<HelpScreen />} />
     

      </Routes>
    </ThemeProvider>
  );
}
export default App;