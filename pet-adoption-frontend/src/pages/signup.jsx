import React, { useState } from "react";
import Head from "next/head";
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "ADOPTER" // Default user type
  });
  
  const [echoTest, setEchoTest] = useState({
    text: "",
    response: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [echoError, setEchoError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEchoChange = (e) => {
    setEchoTest({
      ...echoTest,
      text: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setSuccess(`Account created successfully! Welcome, ${data.email}`);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        userType: "ADOPTER"
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEchoSubmit = async (e) => {
    e.preventDefault();
    setEchoError("");
    
    try {
      const response = await fetch('http://localhost:8080/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: echoTest.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Echo test failed');
      }

      setEchoTest({
        ...echoTest,
        response: data.echoedText
      });
    } catch (err) {
      console.error('Echo error:', err);
      setEchoError(err.message || 'Echo test failed');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Pet Adoption</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4, paddingX: 2 }} alignItems="center" gap={2}>
          <Card sx={{ width: { xs: '100%', sm: 600 } }} elevation={4}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom>
                Create Your Account
              </Typography>
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={isLoading}
                  />
                  
                  <TextField
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={isLoading}
                  />
                  
                  <TextField
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={isLoading}
                    error={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword}
                    helperText={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword ? "Passwords don't match" : ""}
                  />
                  
                  <FormControl fullWidth disabled={isLoading}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      label="User Type"
                    >
                      <MenuItem value="ADOPTER">Adopter</MenuItem>
                      <MenuItem value="SHELTER">Shelter</MenuItem>
                      <MenuItem value="ADMIN">Administrator</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
          
          {/* Echo Test Card */}
          <Card sx={{ width: { xs: '100%', sm: 600 } }} elevation={4}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                Echo Test
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <form onSubmit={handleEchoSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Enter text to echo"
                    value={echoTest.text}
                    onChange={handleEchoChange}
                    fullWidth
                    required
                  />
                  
                  <Button 
                    type="submit"
                    variant="outlined" 
                    color="secondary"
                    fullWidth
                    disabled={!echoTest.text.trim()}
                  >
                    Test Echo
                  </Button>
                </Stack>
              </form>
              
              {echoError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {echoError}
                </Alert>
              )}
              
              {echoTest.response && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Server response:
                  </Typography>
                  <Typography variant="body1">
                    {echoTest.response}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      </main>
    </>
  );
}