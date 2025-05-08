// src/pages/easteregg.jsx
import React, { useState, useEffect } from 'react';
import { Roboto } from 'next/font/google';
import { Box, Typography, LinearProgress } from '@mui/material';

const roboto = Roboto({ weight: ['400','700'], subsets: ['latin'] });

export default function EasterEgg() {
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    const alarm = new Audio('/sounds/alarm.mp3');
    alarm.loop = true;
    alarm.play().catch(() => {});
    const timer = setInterval(() => {
      setSeconds(s => (s <= 1 ? (clearInterval(timer), 0) : s - 1));
    }, 1000);
    return () => { clearInterval(timer); alarm.pause(); };
  }, []);

  const progress = ((30 - seconds) / 30) * 100;

  return (
    <Box
      className={`${roboto.className} easterFont`}        
      onClick={e => {
        if (e.target.closest('a')) return;
        document.documentElement.requestFullscreen()?.catch(() => {});
      }}
      sx={{
        backgroundColor: 'red',
        color: 'white',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'flash 1s infinite',
        cursor: 'pointer',
      }}
    >
      <Typography variant="h1" sx={{ fontWeight:700, fontSize:'3rem', textAlign:'center', m:1 }}>
        WRITE A SORRY LETTER TO CREDERA OR YOUR COMPUTER WILL BE CLEARED
      </Typography>
      <Typography variant="h2" sx={{ fontWeight:700, fontSize:'2rem', mt:2 }}>
        DOWNLOADING VIRUS IN {seconds} SECOND{seconds!==1?'S':''}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ width:'80%', mt:2 }} />
      <a
        href="https://www.credera.com/en-us/contact"
        target="_blank" rel="noopener noreferrer"
        onClick={e=>e.stopPropagation()}
        style={{ marginTop:'2rem', fontWeight:700, fontSize:'1.5rem', textDecoration:'underline' }}
      >
        Send Apology Letter
      </a>

      <style jsx global>{`
        .easterFont,
        .easterFont * {
          font-family: Roboto, Arial, sans‑serif !important;
        }
        @keyframes flash {
          0%,100% { background-color: red; }
          50%     { background-color: darkred; }
        }
      `}</style>
    </Box>
  );
}
