import React, { useState } from "react";
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
} from "@mui/material";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    userType: "ADOPTER", 
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    shelterName: "", // only relevant if userType = SHELTER
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic password match check
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

      //const data = await response.json();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${errorText}`);
      }
      const data = await response.json();

      setSuccess(`Account created successfully! Welcome, ${data.email}`);
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

      // Automatically redirect to the login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <Stack sx={{ paddingTop: 4, paddingX: 2 }} alignItems="center" gap={2}>
        <Card sx={{ width: { xs: "100%", sm: 600 } }} elevation={4}>
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
                    formData.confirmPassword !== "" &&
                    formData.password !== formData.confirmPassword
                  }
                  helperText={
                    formData.confirmPassword !== "" &&
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

                {/* Show first/last name, phone, address if user is ADOPTER or ADMIN */}
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

                {/* Show shelter name if user is SHELTER */}
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
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </main>
  );
}
