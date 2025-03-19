import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';

const pages = [
  { title: 'Home', path: '/' },
  { title: 'Adopt', path: '/adopt' },
  { title: 'Events', path: '/AdopterEventsPage' },
  {title: 'Events', path: '/ShelterEventsPage'},
  { title: 'About', path: '/about' },
];

const authPages = [
  { title: 'Login', path: '/login' },
  { title: 'Sign Up', path: '/signup' },
];

const userPages = [
  { title: 'Profile', path: '/profile' },
  { title: 'My Pets', path: '/profile?tab=1' },
  { title: 'Logout', path: '/logout' },
];

function NavBar() {
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [router.pathname]); // Re-check when route changes

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    handleCloseUserMenu();
    router.push('/login');
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    if (path === '/logout') {
      handleLogout();
    } else {
      router.push(path);
    }
    handleCloseUserMenu();
    setMobileOpen(false);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PetsIcon sx={{ mr: 1 }} />
        Pet Adoption
      </Typography>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton 
              sx={{ textAlign: 'center' }}
              onClick={() => handleMenuClick(page.path)}
            >
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        {isLoggedIn ? (
          userPages.map((page) => (
            <ListItem key={page.title} disablePadding>
              <ListItemButton 
                sx={{ textAlign: 'center' }}
                onClick={() => handleMenuClick(page.path)}
              >
                <ListItemText primary={page.title} />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          authPages.map((page) => (
            <ListItem key={page.title} disablePadding>
              <ListItemButton 
                sx={{ textAlign: 'center' }}
                onClick={() => handleMenuClick(page.path)}
              >
                <ListItemText primary={page.title} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <PetsIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PET ADOPTION
            </Typography>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo - Mobile */}
            <PetsIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              PETS
            </Typography>

            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.title}
                  onClick={() => handleMenuClick(page.path)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            <Box sx={{ flexGrow: 0 }}>
              {isLoggedIn ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user?.email}>
                        {user?.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {userPages.map((page) => (
                      <MenuItem key={page.title} onClick={() => handleMenuClick(page.path)}>
                        <Typography textAlign="center">{page.title}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  {authPages.map((page) => (
                    <Button
                      key={page.title}
                      color="inherit"
                      component={Link}
                      href={page.path}
                      sx={{ mx: 1 }}
                    >
                      {page.title === 'Sign Up' ? (
                        <strong>{page.title}</strong>
                      ) : (
                        page.title
                      )}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default NavBar;