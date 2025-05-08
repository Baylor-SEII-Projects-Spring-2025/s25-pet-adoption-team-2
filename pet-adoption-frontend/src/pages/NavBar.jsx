import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  styled,
} from "@mui/material";
import Image from "next/image";

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "'MilkyWay', Roboto, sans-serif !important",
  fontWeight: "100 !important", 
  flexGrow: 1,
  fontSize: '2.8rem !important', 
  letterSpacing: '1.5px !important', 
  color: "white !important",
  textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.15) !important',
  padding: theme.spacing(1),
}));

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }
  }, [router.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    handleMenuClose();
    router.push("/login");
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Link href="/" passHref>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              mr: 2,
              textDecoration: "none" 
            }}
          >
            <Image
              src="/images/Home_Fur_Good_Logo.png"
              alt="Home Fur Good Logo"
              width={60}
              height={60}
            />
          </Box>
        </Link>
        
        <LogoText variant="h6">
          Home Fur Good
        </LogoText>
        
        {isLoggedIn ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user.emailAddress}
            </Typography>
            <Avatar
              sx={{ bgcolor: "secondary.main", color: "white", cursor: "pointer" }}
              onClick={handleProfileMenuOpen}
            >
              {(user?.email || user?.emailAddress || "").charAt(0).toUpperCase()}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => router.push("/login")}>Login</Button>
            <Button color="inherit" onClick={() => router.push("/signup")}>Sign Up</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}