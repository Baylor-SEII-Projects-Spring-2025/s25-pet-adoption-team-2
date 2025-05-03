import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export default function EasterEgg() {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const alarm = new Audio('/sounds/alarm.mp3');
    alarm.loop = true;
    alarm.play().catch(() => {});

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      alarm.pause();
    };
  }, []);

  const progress = ((30 - seconds) / 30) * 100;

  return (
    <Box
      onClick={() => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        }
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
        cursor: 'pointer'
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', m: 1 }}>
        Write a sorry letter to Credera or your computer will be cleared
      </Typography>
      <Typography variant="h2" sx={{ fontSize: '2rem', mt: 2 }}>
        Downloading virus in {seconds} second{seconds !== 1 ? 's' : ''}
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ width: '80%', mt: 2 }} />
      <a
        href="https://www.credera.com/en-us/contact"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: '2rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'underline' }}
      >
        Send Apology Letter
      </a>
      <Typography variant="body1" sx={{ mt: 2 }}>
        
      </Typography>
      <style jsx>{`
        @keyframes flash {
          0%, 100% { background-color: red; }
          50% { background-color: darkred; }
        }
      `}</style>
    </Box>
  );
}