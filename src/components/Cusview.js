import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from './assets/BG.png'; 
import { Link } from 'react-router-dom';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Shopdee
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      color: '#ffffff',
    },
    h6: {
      color: '#333333',
      fontWeight: 'bold',
    },
  },
});

export default function Cusview() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url(${BackgroundImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container component="main" maxWidth="md">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '60px', 
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              minHeight: '300px',
            }}
          >
            <Typography component="h1" variant="h2" sx={{ 
              backgroundColor: '#1976d2',
              padding: '10px 30px',
              borderRadius: '15px',
              color: 'white',
              width: '100%',
              textAlign: 'center',
              mb: 4,
            }}>
              Welcome
            </Typography>
            <Typography component="p" variant="h6" sx={{ mb: 4 }}>
              You have successfully logged in as a customer!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ padding: '10px 20px' }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
