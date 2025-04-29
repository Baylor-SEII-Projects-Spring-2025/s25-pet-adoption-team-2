import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
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
} from "@mui/material";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('jwtToken', data.token);

      // Store user data in sessionStorage
      sessionStorage.setItem('user', JSON.stringify({
        id: data.userId,
        email: data.email,
        userType: data.userType,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        shelterName: data.shelterName
      }));

      // Redirect to profile or home page
      console.log('Redirecting to /profile');
      router.push('/profile');
      console.log('Router:', router);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Pet Adoption</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4, paddingX: 2 }} alignItems="center" gap={2}>
          <Card sx={{ width: { xs: '100%', sm: 600 } }} elevation={4}>
            <CardContent>
              <Typography variant="h4" align="center" gutterBottom>
                Login to Your Account
              </Typography>
              
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
                  
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </Stack>
              </form>
              
              <Divider sx={{ my: 3 }} />
              
              <Box textAlign="center">
                <Typography variant="body1" sx={{ mb: 2 }}>
                  No account?
                </Typography>
                <Link href="/signup" passHref>
                  <Button variant="outlined" color="secondary">
                    Create an Account
                  </Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </main>
    </>
  );
}