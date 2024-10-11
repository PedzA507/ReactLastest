import { React, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import BackgroundImage from '../../assets/BG.png';

const drawerWidth = 240;
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

// Custom theme (เหมือนกับ Dashboard)
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
      primary: '#000000',
      secondary: '#cccccc',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      color: '#000000',
    },
    h5: {
      color: '#000000',
    },
    h6: {
      color: '#000000',
      fontWeight: 'bold',
    },
  },
});

export default function View() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [home, sethome] = useState("");  // Home home
  const [phonenumber, setphonenumber] = useState("");  // Phone number
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current user data including home and phone number      
    axios.get(`${url}/profile/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(response => {
      const user = response.data;
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
      setGender(user.GenderID);
      setImageFile(user.imageFile);
      sethome(user.home);  // Set the home
      setphonenumber(user.phonenumber);  // Set the phone number
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  }, [id]);

  // Function to handle user update
  const UpdateUser = (id) => {
    navigate(`/admin/user/update/${id}`);
  }

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => navigate('/') },
    { text: 'Add Employee', icon: <AnalyticsIcon />, action: () => navigate('/addemployee') },
    { text: 'Clients', icon: <PeopleIcon />, action: () => navigate('/admin/user') },
    { text: 'Tasks', icon: <AnalyticsIcon />, action: () => navigate('/tasks') },
    { text: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { text: 'Feedback', icon: <FeedbackIcon />, action: () => navigate('/feedback') },
    { text: 'About', icon: <InfoIcon />, action: () => navigate('/about') },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${BackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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

        <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', padding: '30px', width: '100%' }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Avatar sx={{ width: 150, height: 150 }}
                    src={url + '/user/image/' + imageFile} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h4" gutterBottom>
                    {firstName} {lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {email}
                  </Typography>
                  <Typography color="textSecondary">
                    เพศ : {gender === 1 ? "ชาย" : gender === 2 ? "หญิง" : "-"}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="body1" gutterBottom>
                ที่อยู่ : {home ? home : 'No home provided'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                เบอร์โทร : {phonenumber ? phonenumber : 'No phone number provided'}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <Button variant="contained" color="primary" onClick={() => UpdateUser(id)}>
                แก้ไขบัญชีผู้ใช้
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
