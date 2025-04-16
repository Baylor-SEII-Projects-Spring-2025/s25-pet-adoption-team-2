import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import PetCard from "../components/PetCard";

export default function Adopt() {
  const [pets, setPets] = useState([]);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  // Define fetchPets as a reusable function
  const fetchPets = useCallback(async () => {
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
  }, [backendUrl]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Function to handle CSV import
  const handleImportCSV = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/pets/import-csv`);
      if (response.ok) {
        const data = await response.json();
        alert(`Imported ${data.length} pets successfully!`);
        // Refresh the pet list after import
        fetchPets();
      } else {
        alert("Failed to import CSV file. Status: " + response.status);
      }
    } catch (error) {
      console.error("Error importing CSV file:", error);
      alert("Error importing CSV file, please check the console for details.");
    }
  };

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
                <Button variant="contained" onClick={handleImportCSV}>
                  Import Pets CSV
                </Button>
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
