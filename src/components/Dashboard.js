import React from 'react';
import { AppBar, Toolbar, Typography, Grid, Card, CardContent, Button, Container, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BackgroundImage from './assets/BG.png';
import ChartImage from './assets/chart.png';
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Button color="inherit" href="https://mui.com/">
        Shopdee
      </Button>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// Custom theme similar to the Login page theme
const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',  // Blue for accents like buttons and highlights
    },
    background: {
      default: '#f5f5f5', // Light background for the overall page
      paper: '#ffffff',   // White background for cards and sections
    },
    text: {
      primary: '#333333',  // Dark text color for high contrast
      secondary: '#666666',  // Lighter text for secondary information
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      color: '#ffffff',  // Change to white as per your request
    },
    h5: {
      color: '#1976d2',  // Blue for card titles
    },
    h6: {
      color: '#333333',  // Dark color for card values
      fontWeight: 'bold',
    },
  },
});

const drawerWidth = 240;

export default function Dashboard() {
  const stats = [
    { title: 'Users', value: 14000, percentage: '+25%' },
    { title: 'Conversions', value: 325, percentage: '-25%' },
    { title: 'Event Count', value: '200k', percentage: '+5%' },
    { title: 'Page Views', value: '1.3M', percentage: '-8%' },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/choice');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon /> },
    { text: 'Analytics', icon: <AnalyticsIcon /> },
    { text: 'Clients', icon: <PeopleIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
    { text: 'Feedback', icon: <FeedbackIcon /> },
    { text: 'About', icon: <InfoIcon /> },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${BackgroundImage})`, backgroundSize: 'cover' }}>
        <CssBaseline />

        {/* Sidebar (Menu ด้านซ้าย) */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#1f1f1f',  // Dark background for the sidebar
              color: '#ffffff', // White text
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem button key={item.text}>
                  <ListItemIcon sx={{ color: '#ffffff' }}> {/* Icons color to white */}
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            margin: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <AppBar position="static" style={{ backgroundColor: '#1976d2', width: '100%' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ color: '#ffffff', flexGrow: 1 }}>  {/* Change Dashboard text color to white */}
                Dashboard
              </Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Toolbar>
          </AppBar>

          <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white for card background
                padding: 4,
                borderRadius: '15px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Typography component="h1" variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
                Overview
              </Typography>

              {/* Stats Section */}
              <Grid container spacing={3} justifyContent="center">
                {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card elevation={3} sx={{ backgroundColor: '#f5f5f5', color: '#333333' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h5">{stat.title}</Typography>
                        <Typography variant="h6" sx={{ mt: 2 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color={stat.percentage.startsWith('+') ? 'green' : 'red'}>
                          {stat.percentage}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Chart Section */}
              <Box
                sx={{
                  mt: 6,
                  backgroundColor: '#ffffff',
                  padding: 3,
                  borderRadius: '15px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img src={ChartImage} alt="Chart" style={{ width: '80%', height: 'auto' }} />
              </Box>
            </Box>
          </Container>

          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
