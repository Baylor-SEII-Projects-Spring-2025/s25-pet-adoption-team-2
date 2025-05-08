// pages/debug.jsx
import React, { useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress
} from "@mui/material";
import axios from "axios";

const DebugPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [eventsInfo, setEventsInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://35.225.196.242:8080";
  
  const checkUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user info from session storage
      const userData = sessionStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserInfo(user);
      }
      
      const token = localStorage.getItem("jwtToken");
      
      // Try to get events for user ID 10
      console.log("Checking events for user ID 10");
      console.log("Token present:", token ? "Yes" : "No");
      
      const eventsResponse = await axios.get(
        `${BACKEND_URL}/api/shelter/events?userId=10`,
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log("Response received:", eventsResponse.status);
      
      setEventsInfo({
        status: eventsResponse.status,
        events: eventsResponse.data,
        count: eventsResponse.data.length
      });
      
    } catch (err) {
      console.error("Debug error:", err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API Debug Page
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={checkUser} 
        disabled={loading}
        sx={{ mb: 4 }}
      >
        {loading ? <CircularProgress size={24} /> : "Run Diagnostic Check"}
      </Button>
      
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error
          </Typography>
          <Typography>Message: {error.message}</Typography>
          <Typography>Status: {error.status}</Typography>
          <Typography>Data: {JSON.stringify(error.data)}</Typography>
        </Paper>
      )}
      
      {userInfo && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current User Info
          </Typography>
          <Typography>ID: {userInfo.id}</Typography>
          <Typography>Email: {userInfo.email}</Typography>
          <Typography>User Type: {userInfo.userType}</Typography>
        </Paper>
      )}
      
      {eventsInfo && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Events Check for User ID 10
          </Typography>
          <Typography>Status: {eventsInfo.status}</Typography>
          <Typography>Events Count: {eventsInfo.count}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Events Data:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '300px'
            }}
          >
            {JSON.stringify(eventsInfo.events, null, 2)}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default DebugPage;