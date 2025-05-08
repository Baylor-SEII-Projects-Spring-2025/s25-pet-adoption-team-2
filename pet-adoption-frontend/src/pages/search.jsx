import Head from "next/head";
import {
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";


export default function Search() {

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>

      <main>
        <Stack sx={{ paddingTop: 4 }} alignItems="center" gap={2}>
          <Card sx={{ width: 600 }} elevation={4}>
            <CardContent>
              <Typography variant="h3" align="center">
                Search
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </main>
    </>
  );
}
