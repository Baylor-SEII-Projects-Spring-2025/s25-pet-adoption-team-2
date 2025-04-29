// components/ClientOnly.jsx
"use client";    // although you’re on the pages-router, this simply marks intent
import { useEffect, useState } from "react";

export default function ClientOnly({ children, fallback = null }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted ? children : fallback;
}
