import React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import BackgroundImage from './assets/BG.png';

const defaultTheme = createTheme();

export default function MainAdmin() {
  const navigate = useNavigate(); 

  const handleAddEmployeeClick = () => {
    navigate('/addemployee');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <CardContent>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  backgroundColor: '#3f51b5', 
                  padding: '10px 30px', 
                  borderRadius: '15px', 
                  color: 'white', 
                  width: '100%', 
                  textAlign: 'center', 
                  mb: 4 
                }}
              >
                Admin Options
              </Typography>

              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddEmployeeClick}
                    sx={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '16px',
                      fontSize: '18px',
                      borderRadius: '10px',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        backgroundColor: '#115293',
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    Add Employee
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleDashboardClick}
                    sx={{
                      backgroundColor: '#d32f2f',
                      color: 'white',
                      padding: '16px',
                      fontSize: '18px',
                      borderRadius: '10px',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        backgroundColor: '#a71d1d',
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    Dashboard
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
