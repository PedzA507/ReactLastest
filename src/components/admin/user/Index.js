import React, { useEffect, useState } from "react";
import { Typography, Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const drawerWidth = 240;
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1976d2',
    },
    h5: {
      color: '#333333',
    },
    h6: {
      color: '#333333',
      fontWeight: 'bold',
    },
  },
});

export default function Index() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    UsersGet();
  }, []);
  
  const UsersGet = () => {
    axios.get(`${url}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("User Data:", response.data); // Add this line to debug
        const data = Array.isArray(response.data) ? response.data : []; // Ensure data is always an array
        setUsers(data); 
      })
      .catch((error) => {
        console.error('Error fetching users', error);
        setUsers([]); 
      });
  };
  
  

  const ViewUser = (id) => {
    navigate(`/admin/user/view/${id}`);
  };

  const UpdateUser = (id) => {
    navigate(`/admin/user/update/${id}`);
  };

  const UserDelete = (id) => {
    axios.delete(`${url}/user/${id}`, {
      headers: {
        'Accept': 'application/form-data',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        UsersGet();
      } else {
        alert('Failed to delete user');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

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
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#f5f5f5',
              color: '#333333',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem button key={item.text} onClick={item.action}>
                  <ListItemIcon sx={{ color: '#333333' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Container sx={{ marginTop: 4 }} maxWidth="lg">
          <Paper sx={{ padding: 3, color: 'text.secondary' }}>
            <Box display="flex" justifyContent="space-between">
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                จัดการข้อมูลผู้ใช้
              </Typography>
              <Link to="/admin/user/create">
                <Button variant="contained" color="primary">
                  เพิ่มข้อมูลผู้ใช้
                </Button>
              </Link>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">รูป</TableCell>
                    <TableCell align="left">ชื่อ</TableCell>
                    <TableCell align="left">นามสกุล</TableCell>
                    <TableCell align="left">ชื่อผู้ใช้</TableCell>
                    <TableCell align="center">จัดการข้อมูล</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.UserID}>
                      <TableCell align="center">
                        <Avatar src={`${url}/user/image/${user.imageFile}`} />
                      </TableCell>
                      <TableCell align="left">{user.firstname}</TableCell>
                      <TableCell align="left">{user.lastname}</TableCell>
                      <TableCell align="left">{user.username}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup>
                          <Button onClick={() => ViewUser(user.UserID)}>ตรวจสอบรายงาน</Button>
                          <Button onClick={() => UpdateUser(user.UserID)}>แก้ไข</Button>
                          <Button onClick={() => UserDelete(user.UserID)}>ระงับผู้ใช้</Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
