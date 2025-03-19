// pages/adopt.js
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import PetCard from "../components/PetCard";

export default function Adopt() {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        async function fetchPets() {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
            try {
                const response = await fetch(`${backendUrl}/api/pets/all`);
                if (response.ok) {
                    const data = await response.json();
                    setPets(data);
                } else {
                    console.error("Failed to fetch pets, status:", response.status);
                }
            } catch (error) {
                console.error("Error fetching pets", error);
            }
        }
        fetchPets();
    }, []);

    return (
        <>
            <Head>
                <title>Adopt</title>
            </Head>
            <main>
                <Stack sx={{ paddingTop: 4 }} alignItems="center" gap={2}>
                    <Card sx={{ width: 600 }} elevation={4}>
                        <CardContent>
                            <Typography variant="h3" align="center">
                                Adopt
                            </Typography>
                            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
                                <Link href="/addPet" passHref>
                                    <Button variant="contained">Add a Pet</Button>
                                </Link>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                        {pets.map((pet) => (
                            <PetCard key={pet.id} pet={pet} />
                        ))}
                    </Box>
                </Stack>
            </main>
        </>
    );
}
