import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  useTheme,
} from "@mui/material";
//import { useColorMode } from "@/utils/theme";

export default function Signup() {
  const router = useRouter();
  const theme = useTheme();
  //const colorMode = useColorMode();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "ADOPTER",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    shelterName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          shelterName: formData.shelterName,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Sign up failed");
      }
      const data = await response.json();
      setSuccess(`Account created! Welcome, ${data.email}`);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        userType: "ADOPTER",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        shelterName: "",
      });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select the appropriate background image based on the theme
  const backgroundImage = isDarkMode 
    ? "url('/images/dSignupBackground.png')" 
    : "url('/images/wSignupBackground.png')";

  return (
    <>
      <Head>
        <title>Sign Up - Pet Adoption</title>
      </Head>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          transition: "background-image 0.3s ease-in-out",
        }}
      >
        <Card 
          sx={{ 
            width: { xs: "100%", sm: 600 }, 
            opacity: 0.95,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: "all 0.3s ease"
          }} 
          elevation={4}
        >
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
                  error={
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                  }
                  helperText={
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "Passwords don't match"
                      : ""
                  }
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
                {(formData.userType === "ADOPTER" ||
                  formData.userType === "ADMIN") && (
                  <>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </>
                )}
                {formData.userType === "SHELTER" && (
                  <>
                    <TextField
                      label="Shelter Name"
                      name="shelterName"
                      value={formData.shelterName}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={isLoading}
                    />
                    <TextField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                    <TextField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                      disabled={isLoading}
                    />
                  </>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={20} /> : "Sign Up"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}