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


export default function Recommended() {

  return (
    <>
      <Head>
        <title>Recommended</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4 }} alignItems="center" gap={2}>
          <Card sx={{ width: 600 }} elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center">
                Recommended
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </main>
    </>
  );
}
