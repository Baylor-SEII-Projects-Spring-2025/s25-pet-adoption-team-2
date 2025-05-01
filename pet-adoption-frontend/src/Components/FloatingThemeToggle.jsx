import React, { useState } from 'react';
import {
  Fab,
  Tooltip,
  useTheme,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import { useColorMode } from '@/utils/theme';

const FloatingThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isDarkMode = theme.palette.mode === 'dark';

  // AI Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Toggle chat dialog
  const handleChatToggle = () => {
    setChatOpen((open) => !open);
  };

  // Send message
  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    const userMsg = { sender: 'user', text };
    setMessages((msgs) => [...msgs, userMsg]);
    setInputValue('');

    setTimeout(() => {
      let aiText;
      // Easter egg for Credera
      if (text.toLowerCase() === 'i love credera') {
        aiText = 'Check out Credera careers: https://www.credera.com/en-us/careers';
      } else {
        // Random count of animal sounds
        const count = Math.floor(Math.random() * 5) + 1; // 1 to 5
        if (Math.random() < 0.5) {
          aiText = Array(count).fill('Meow').join(' ') + '!';
        } else {
          aiText = Array(count).fill('Woof').join(' ') + '!';
        }
      }
      setMessages((msgs) => [...msgs, { sender: 'ai', text: aiText }]);
    }, 500);
  };

  return (
    <>
      {/* Theme Toggle FAB */}
      <Zoom in timeout={500}>
        <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} placement='left'>
          <Fab
            color='primary'
            size='medium'
            aria-label='toggle dark/light mode'
            onClick={colorMode.toggleColorMode}
            sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </Fab>
        </Tooltip>
      </Zoom>

      {/* AI Chat FAB (larger) */}
      <Zoom in timeout={700}>
        <Tooltip title='Chat with Pet AI' placement='left'>
          <Fab
            color='secondary'
            size='large'
            aria-label='open pet ai chat'
            onClick={handleChatToggle}
            sx={{ position: 'fixed', bottom: 88, right: 24, zIndex: 1300 }}
          >
            <ChatBubbleIcon sx={{ fontSize: '2.5rem' }} />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* AI Chat Dialog as a larger popup with close button */}
      <Dialog
        open={chatOpen}
        onClose={handleChatToggle}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            height: '80vh',
            width: '80vw',
            p: 0,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Fido AI Chat
          <IconButton
            aria-label='close'
            onClick={handleChatToggle}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, overflowY: 'auto' }}>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <Stack
                key={idx}
                direction='row'
                justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                sx={{ mb: 1 }}
              >
                <Box
                sx={(theme) => ({
                  p: 1,
                  bgcolor:
                    msg.sender === 'user'
                      ? theme.palette.primary.main
                      : theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[300],
                  color:
                    msg.sender === 'user'
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  borderRadius: 1,
                  maxWidth: '70%',
                })}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
              </Stack>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 1, p: 2, pt: 0, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant='outlined'
            size='medium'
            placeholder='Type a message'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{ flexGrow: 1 }}
          />
          <Button variant='contained' onClick={handleSendMessage} disabled={!inputValue.trim()}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FloatingThemeToggle;
