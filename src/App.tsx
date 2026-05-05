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

import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

import About from './screens/About';
import { darkTheme, theme } from './Theme';
import Dashboard from './screens/Dashboard';
import DiaryAddEdit from './screens/DiaryAddEdit';
import DiaryItems from './screens/DiaryItems';

import Login from './screens/Login';
import Map from './screens/Maps';
import Register from './screens/Register';
import { Route, Routes, useNavigate } from 'react-router';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

type PageRoute = {
  page: string,
  route: string,
}

const pages: PageRoute[] = [
  { page: 'Dashboard', route: '/' },
  { page: 'About', route: '/about' },
  { page: 'Diary', route: '/diarylist' },
  { page: 'New', route: '/diaryedit' },
]
const settings: PageRoute[] = [
  { page: 'Register', route: '/register' },
  { page: 'Login', route: '/login' },
]
const settingsUser: PageRoute[] = [
  { page: 'Change password', route: '/password' },
  { page: 'Logout', route: '/logout' },
]

export interface UserType {
  session: Session | null,
  email: string | null
}

export const user: UserType = {
  session: null,
  email: null,
}

function testProfiles() {
  supabase.from('profiles').select().then(({ data, error }) => {
    console.log(data)
    console.log(error)
  })
}

function App() {

  const navigate = useNavigate()

  const [dark, setDark] = React.useState(false)

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    initUser()
  }, [])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

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

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.log(error)
      }
      // Handle post-logout logic here, e.g., redirecting the user
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  }

  const initUser = () => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log(session)
      user.session = session
      user.email = session?.user?.email ?? null
    }).catch(error => {
      console.log(error)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log(_event)
      console.log(session)
      user.session = session
      user.email = session?.user?.email ?? null
    })
    //testProfiles()
  }

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleSearch = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    try {
      const { data, error } = await (supabase as any).rpc('search_entries', {
        search_query: text
      });

      if (error) throw error;

      console.log("Found results with root word matches:", data);
      // update your diary state with 'data' here
    } catch (error) {
      // FIX: Check if error is an Error object
      if (error instanceof Error) {
        console.error("Search failed:", error.message);
      } else {
        console.error("An unknown search error occurred:", error);
      }
    }
  };

  return (
    <ThemeProvider theme={dark ? darkTheme : theme}>
      <CssBaseline />
      <AppBar position="static">
        <Drawer
          anchor="left"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
        >
          <Box sx={{ width: 250 }} role="presentation">
            <List>
              {pages.map((page) => (
                <ListItem key={page.page} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleNavMenu(page.route);
                      setOpenDrawer(false);
                    }}
                  >
                    <ListItemText primary={page.page} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>

            {/* LEFT SECTION: Just the Hamburger Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={() => setOpenDrawer(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* CENTER SECTION: Icon and Title together */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 2
            }}>
              <Diversity1Icon sx={{ mr: 1, fontSize: { xs: '24px', md: '30px' } }} />
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
                  <Avatar src={avatarUrl || "/static/images/avatar/2.jpg"} />
                </IconButton>
              </Tooltip>

              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
              >
                <Typography sx={{ p: 2, color: 'gray', fontSize: '0.8rem' }}>{user.email}</Typography>

                <MenuItem component="label">
                  <Typography sx={{ textAlign: 'center' }}>Change Profile</Typography>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setAvatarUrl(imageUrl);
                      }
                      setAnchorElUser(null);
                    }}
                  />
                </MenuItem>

                {(user.email ? settingsUser : settings).map((setting) => (
                  <MenuItem key={setting.page} onClick={() => handleCloseUserMenu(setting.route)}>
                    <Typography sx={{ textAlign: 'center' }}>{setting.page}</Typography>
                  </MenuItem>
                ))}

                <Box sx={{ px: 2, py: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dark}
                        onChange={() => {
                          setDark(!dark);
                          setAnchorElUser(null);
                        }}
                      />
                    }
                    label="Dark mode"
                  />
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='about' element={<About />} />
        <Route path='diarylist' element={<DiaryItems />} />
        <Route path='diaryedit/:id?' element={<DiaryAddEdit />} />
        <Route path='register' element={<Register />} />
        <Route path='login' element={<Login />} />
        <Route path='map/:loc' element={<Map />} />

      </Routes>
    </ThemeProvider>
  );
}
export default App;
