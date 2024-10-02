import React from 'react';
import { AppBar, Toolbar, Typography, Grid, Card, CardContent, Button, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const drawerWidth = 240;

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#1f1f1f',
      paper: '#242424',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      color: '#ffffff',
    },
    h5: {
      color: '#ffffff',
    },
    h6: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
  },
});

const data = [
  { name: 'Apr 5', sessions: 5000 },
  { name: 'Apr 10', sessions: 7500 },
  { name: 'Apr 15', sessions: 10000 },
  { name: 'Apr 20', sessions: 15000 },
  { name: 'Apr 25', sessions: 18000 },
  { name: 'Apr 30', sessions: 20000 },
];

const pageData = [
  { name: 'Jan', views: 10000 },
  { name: 'Feb', views: 12000 },
  { name: 'Mar', views: 8000 },
  { name: 'Apr', views: 15000 },
  { name: 'May', views: 10000 },
  { name: 'Jun', views: 12000 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Users', value: '14k', percentage: '+25%' },
    { title: 'Conversions', value: '325', percentage: '-25%' },
    { title: 'Event Count', value: '200k', percentage: '+5%' },
    { title: 'Page Views', value: '1.3M', percentage: '-8%' },
  ];

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => navigate('/admin/customer') },
    { text: 'Add Employee', icon: <AnalyticsIcon />, action: () => navigate('/addemployee') },
    { text: 'Clients', icon: <PeopleIcon />, action: () => navigate('/admin/customer') },
    { text: 'Tasks', icon: <AnalyticsIcon /> },
    { text: 'Settings', icon: <SettingsIcon />},
    { text: 'Feedback', icon: <FeedbackIcon />,},
    { text: 'About', icon: <InfoIcon />, },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#1f1f1f',
              color: '#ffffff',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem button key={item.text} onClick={item.action}>
                  <ListItemIcon sx={{ color: '#ffffff' }}>
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
            padding: 3,
            backgroundColor: '#121212',
            minHeight: '100vh',
          }}
        >
          <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Dashboard
              </Typography>
              <Button color="inherit" onClick={() => navigate('/signinuser')}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ backgroundColor: '#242424', color: '#ffffff' }}>
                    <CardContent>
                      <Typography variant="h5">{stat.title}</Typography>
                      <Typography variant="h6">{stat.value}</Typography>
                      <Typography variant="body2" color={stat.percentage.startsWith('+') ? 'green' : 'red'}>
                        {stat.percentage}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Line Chart Section */}
            <Box sx={{ mt: 4, backgroundColor: '#242424', padding: 2, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Sessions (Last 30 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Bar Chart Section */}
            <Box sx={{ mt: 4, backgroundColor: '#242424', padding: 2, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Page Views (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageData}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
