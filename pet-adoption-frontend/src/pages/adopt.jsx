import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import PetCard from "../components/PetCard";

export default function Adopt() {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        (async () => {
            const URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
            const res = await fetch(`${URL}/api/pets/all`);
            if (res.ok) setPets(await res.json());
            else console.error("Failed", res.status);
        })();
    }, []);

    return (
        <>
            <Head><title>Adopt</title></Head>
            <main>
                <Stack pt={4} alignItems="center" gap={2}>
                    <Card sx={{ width: 600 }} elevation={4}>
                        <CardContent>
                            <Typography variant="h3" align="center">Adopt</Typography>
                            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                                <Link href="/addPet" passHref>
                                    <Button variant="contained">Add a Pet</Button>
                                </Link>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Box display="flex" flexWrap="wrap" justifyContent="center">
                        {pets.map(p => <PetCard key={p.id} pet={p} />)}
                    </Box>
                </Stack>
            </main>
        </>
    );
}
