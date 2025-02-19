import React, { useState } from "react";
import Head from "next/head";
import {
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link"; // Import Link from Next.js for navigation

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sending data to the backend
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.text();

      // Check if the response is successful
      if (response.ok) {
        setResponseMessage(`Success: ${data}`);
      } else {
        setResponseMessage(`Error: ${data}`);
      }
    } catch (error) {
      setResponseMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4 }} alignItems="center" gap={3}>
          <Card sx={{ width: 400 }} elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center" gutterBottom>
                Login
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: 2 }}
                  >
                    Log In
                  </Button>
                </Stack>
              </form>
              {responseMessage && (
                <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                  {responseMessage}
                </Typography>
              )}

              <Stack sx={{ marginTop: 2 }} alignItems="center">
                <Typography variant="body2" align="center">
                  Don't have an account yet?{" "}
                  <Link href="/signup" passHref>
                    <Button variant="text" color="primary">
                      Sign Up
                    </Button>
                  </Link>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </main>
    </>
  );
}
