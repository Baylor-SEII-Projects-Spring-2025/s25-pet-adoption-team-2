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
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Avatar
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import PetsIcon from '@mui/icons-material/Pets'; // For dog
import SetMealIcon from '@mui/icons-material/SetMeal'; // Fish icon
import { useColorMode } from '@/utils/theme';

const FloatingThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useColorMode();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Change default to fish mode
  const [petMode, setPetMode] = useState('fish');

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Get colors based on pet mode
  const getPetColors = () => {
    if (petMode === 'fish') {
      return {
        primary: '#00bcd4', // Cyan for fish
        secondary: '#80deea', // Light cyan
        icon: <SetMealIcon sx={{ color: '#00bcd4' }} />,
        sound: 'Blub'
      };
    } else {
      return {
        primary: '#2196f3', // Blue for dogs
        secondary: '#90caf9', // Light blue
        icon: <PetsIcon sx={{ color: '#2196f3' }} />,
        sound: 'Woof'
      };
    }
  };

  const petColors = getPetColors();

  const handleChatToggle = () => setChatOpen(open => !open);
  
  // Handle pet mode change
  const handlePetModeChange = (event, newMode) => {
    if (newMode !== null) {
      setPetMode(newMode);
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    const lower = text.toLowerCase();

    // Trigger fullscreen and redirect on 'hate credera'
    if (lower.includes('credera') && lower.includes('hate')) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
      // Delay redirect slightly to allow fullscreen
      setTimeout(() => {
        window.location.href = '/easteregg';
      }, 100);
      return;
    }

    // Add user message
    setMessages(msgs => [...msgs, { sender: 'user', text }]);
    setInputValue('');

    // Simulate AI response based on pet mode
    setTimeout(() => {
      let aiText;
      if (lower.includes('credera') && lower.includes('love')) {
        aiText = '😊 Check out Credera careers: https://www.credera.com/en-us/careers';
      } else {
        // Use appropriate pet sound based on mode
        const sound = petColors.sound;
        const count = Math.floor(Math.random() * 5) + 1;
        aiText = Array(count)
          .fill(null)
          .map(() => sound)
          .join(' ') + '!';
      }
      setMessages(msgs => [...msgs, { sender: 'ai', text: aiText }]);
    }, 500);
  };

  const getPetName = () => petMode === 'fish' ? 'Bubbles' : 'Fido';

  return (
    <>
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
      <Zoom in timeout={700}>
        <Tooltip title={`Chat with ${getPetName()} AI`} placement='left'>
          <Fab
            color='secondary'
            size='large'
            aria-label='open pet ai chat'
            onClick={handleChatToggle}
            sx={{ 
              position: 'fixed', 
              bottom: 88, 
              right: 24, 
              zIndex: 1300,
              bgcolor: petColors.primary,
              '&:hover': {
                bgcolor: petColors.secondary,
              }
            }}
          >
            <ChatBubbleIcon sx={{ fontSize: '2.5rem' }} />
          </Fab>
        </Tooltip>
      </Zoom>
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
            overflow: 'hidden',
            borderTop: `4px solid ${petColors.primary}` // Pet-specific color accent
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            m: 0, 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: petColors.primary, width: 40, height: 40 }}>
              {petMode === 'fish' ? <SetMealIcon /> : <PetsIcon />}
            </Avatar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontFamily: "'MilkyWay', Roboto, sans-serif",
                fontWeight: 75,
                letterSpacing: '1px',
                textShadow: '0.5px 0.5px 0px rgba(0,0,0,0.2)',
                color: petColors.primary
              }}
            >
              {getPetName()} AI Chat
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={petMode}
              exclusive
              onChange={handlePetModeChange}
              aria-label="pet mode"
              size="small"
            >
              <ToggleButton 
                value="fish" 
                aria-label="fish mode"
                sx={{
                  borderColor: petMode === 'fish' ? petColors.primary : 'inherit',
                  color: petMode === 'fish' ? petColors.primary : 'inherit',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 188, 212, 0.1)' : 'rgba(0, 188, 212, 0.1)',
                  }
                }}
              >
                <Tooltip title="Fish Mode">
                  <SetMealIcon /> 
                </Tooltip>
              </ToggleButton>
              <ToggleButton 
                value="dog" 
                aria-label="dog mode"
                sx={{
                  borderColor: petMode === 'dog' ? petColors.primary : 'inherit',
                  color: petMode === 'dog' ? petColors.primary : 'inherit',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                  }
                }}
              >
                <Tooltip title="Dog Mode">
                  <PetsIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <IconButton aria-label='close' onClick={handleChatToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, overflowY: 'auto' }}>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <Stack key={idx} direction='row' justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} sx={{ mb: 1 }}>
                {msg.sender === 'ai' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: petColors.primary, 
                      width: 32, 
                      height: 32, 
                      mr: 1,
                      alignSelf: 'flex-end',
                      mb: 0.5
                    }}
                  >
                    {petMode === 'fish' ? <SetMealIcon fontSize="small" /> : <PetsIcon fontSize="small" />}
                  </Avatar>
                )}
                <Box
                  sx={theme => ({
                    p: 1.5,
                    bgcolor: msg.sender === 'user' 
                      ? theme.palette.primary.main 
                      : petColors.primary,
                    color: msg.sender === 'user' 
                      ? theme.palette.primary.contrastText 
                      : '#fff',
                    borderRadius: msg.sender === 'user' 
                      ? '12px 12px 0 12px' 
                      : '12px 12px 12px 0',
                    maxWidth: '70%'
                  })}
                >
                  <Typography 
                    variant='body2'
                    sx={{
                      fontFamily: "'MilkyWay', Roboto, sans-serif",
                      fontSize: '14px',
                      letterSpacing: '0.5px', // Add letter spacing to messages
                      lineHeight: 1.5
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
                {msg.sender === 'user' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main, 
                      width: 32, 
                      height: 32, 
                      ml: 1,
                      alignSelf: 'flex-end',
                      mb: 0.5
                    }}
                  >
                    {(inputValue[0] || 'U').toUpperCase()}
                  </Avatar>
                )}
              </Stack>
            ))}
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            display: 'flex', 
            gap: 1, 
            p: 2, 
            pt: 0, 
            alignItems: 'center',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'
          }}
        >
          <TextField
            fullWidth
            variant='outlined'
            size='medium'
            placeholder={`Ask ${getPetName()} something...`}
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: petColors.primary,
                },
                '&:hover fieldset': {
                  borderColor: petColors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: petColors.primary,
                },
              }
            }}
            InputProps={{
              sx: {
                fontFamily: "'MilkyWay', Roboto, sans-serif",
                letterSpacing: '0.5px'
              }
            }}
          />
          <Button 
            variant='contained' 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim()}
            sx={{
              fontFamily: "'MilkyWay', Roboto, sans-serif",
              textTransform: 'none',
              letterSpacing: '0.5px',
              bgcolor: petColors.primary,
              '&:hover': {
                bgcolor: petMode === 'fish' ? '#00acc1' : '#1976d2', // Darker versions for hover
              }
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FloatingThemeToggle;