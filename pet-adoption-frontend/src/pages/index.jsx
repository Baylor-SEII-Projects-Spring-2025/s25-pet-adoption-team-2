import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  AppBar,
  Avatar,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Box,
  Divider,
  Toolbar,
  Container,
  Menu,
  MenuItem,
} from "@mui/material";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addToCounter } from "@/utils/slices/sampleSlice";
import { useRouter } from "next/router";
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  // Global state
  const count = useSelector((state) => state.sample.count);
  const dispatch = useDispatch();

  // Local state
  const [textValue, setTextValue] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Check login status on component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, []);

  // Callback functions
  const onButtonPress = () => {
    alert("You pressed a button!");
  };

  const onOtherButtonPress = () => {
    alert(`The text field says this: ${textValue}`);
  };

  const incrementCounter = () => {
    dispatch(addToCounter(1));
  };

  const decrementCounter = () => {
    dispatch(addToCounter(-1));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setAnchorEl(null);
    alert("You have been logged out");
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    handleMenuClose();
  };

  // Page content
  return (
    <>
      <Head>
        <title>Pet Adoption - Home</title>
      </Head>

      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Home Fur Good
          </Typography>
          {isLoggedIn ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {user?.email}
                </Typography>
                <Avatar 
                  sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
                  onClick={handleProfileMenuOpen}
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Box>
              <Button color="inherit" onClick={() => router.push('/login')}>Login</Button>
              <Button color="inherit" onClick={() => router.push('/signup')}>Sign Up</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Image */}
      <Box 
        sx={{ 
          height: '400px', 
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light' // Fallback color
        }}
      >
        {/* This uses placeholder API for a generic image */}
        <Box sx={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%' }}>
  <Image
    src="/images/krista-mangulsone-9gz3wfHr65U-unsplash.jpg"
    alt="Pet adoption hero image"
    fill
    priority
    style={{ objectFit: 'cover' }}
  />
</Box>
        <Box sx={{ 
          position: 'relative', 
          zIndex: 2, 
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Find Your Forever Friend
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Adopt a pet and change both your lives for the better
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            color="secondary"
            onClick={() => router.push('/adopt')}
          >
            Browse Available Pets
          </Button>
        </Box>
      </Box>

      <main>
        <Container maxWidth="lg">
          <Stack alignItems="center" gap={2}>
            <Card sx={{ width: '100%' }} elevation={4}>
              <CardContent>
                <Typography variant="h3" align="center">
                  Pet Adoption Spring 2025 by Paul Becker
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  This is your template project for the Spring 2025 Baylor
                  Software Engineering II class project! See the README for
                  instructions on how to set this project up and run it locally.
                </Typography>
              </CardContent>
            </Card>

            {/* Auth Card */}
            <Card sx={{ width: '100%' }} elevation={4}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  Authentication Test
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {isLoggedIn ? (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Logged in as: <strong>{user?.email}</strong> ({user?.userType})
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => router.push('/profile')}
                        fullWidth
                      >
                        Go to Profile
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={handleLogout}
                        fullWidth
                      >
                        Logout
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => router.push('/login')}
                      fullWidth
                    >
                      Login
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => router.push('/signup')}
                      fullWidth
                    >
                      Sign Up
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Stack alignItems="center" gap={2} sx={{ width: '100%' }}>
              {/* There are multiple ways to apply styling to Material UI components. One way is using the `sx` prop: */}
              <Button
                variant="contained"
                onClick={onButtonPress}
                sx={{ width: 200 }}
              >
                I am a button
              </Button>

              {/* Another way is by creating a dedicated CSS file and using the styles from there: */}
              <Button
                variant="contained"
                color="secondary"
                onClick={onOtherButtonPress}
                className={styles.wideButton}
              >
                I am a wider button
              </Button>

              {/* Here is an input field */}
              <TextField
                type="text"
                variant="outlined"
                label="Text Field"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
              />

              {/* Here is a link to another page */}
              <Link href="/other">
                <Button variant="contained" color="success">
                  Link to another page
                </Button>
              </Link>

              {/* Here is a counter that shows how to interact with global state */}
              <Stack direction="row" gap={2} alignItems="center">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={decrementCounter}
                >
                  -1
                </Button>
                <Typography variant="body1" color="text.secondary">
                  Global State: {count}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={incrementCounter}
                >
                  +1
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </main>
    </>
  );
}