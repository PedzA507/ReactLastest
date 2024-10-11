import React, { useEffect, useState } from 'react';
import {
  Typography, Avatar, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Grid, Card, CardContent
} from '@mui/material';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { Home as HomeIcon, People as PeopleIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Custom URL and Token setup
const url = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token');

// Sample data for charts
const data = [
  { name: 'Jan', sessions: 28 },
  { name: 'Feb', sessions: 53 },
  { name: 'Mar', sessions: 51 },
  { name: 'Apr', sessions: 26 },
  { name: 'May', sessions: 58 },
];

const pageData = [
  { name: 'Jan', views: 90 },
  { name: 'Feb', views: 70 },
  { name: 'Mar', views: 80 },
  { name: 'Apr', views: 85 },
  { name: 'May', views: 95 },
  { name: 'Jun', views: 70 },
];

// Full Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`${url}/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((response) => {
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setUsers([]); // Always default to an empty array on error
      });
}, []);


  // Sidebar Menu
  const drawerWidth = 240;
  const menuItems = [
    { text: 'จัดการข้อมูลผู้ใช้', action: () => navigate('/admin/user'), icon: <PeopleIcon /> },
    { text: 'จัดการความชอบ', action: () => navigate('/admin/preferences'), icon: <SettingsIcon /> },
    { text: 'ตรวจสอบรายงานผู้ใช้', action: () => navigate('/admin/reports'), icon: <PeopleIcon /> },
    { text: 'เพิ่มผู้ดูแล', action: () => navigate('/admin/addadmin'), icon: <SettingsIcon /> },
    { text: 'ออกจากระบบ', action: () => navigate('/logout'), icon: <HomeIcon /> }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#f5f5f5',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            borderRight: '1px solid #e0e0e0',
            paddingTop: '20px',
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem button key={item.text} onClick={item.action}>
                <ListItemIcon>
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
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Charts Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#fff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ผู้ใช้งานใหม่
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#fff' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  จำนวนการแมท
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pageData}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Table */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            ผู้ใช้ถูกระงับใหม่
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: '#fff' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">รูป</TableCell>
                  <TableCell align="left">ชื่อผู้ใช้</TableCell>
                  <TableCell align="left">เหตุผล</TableCell>
                  <TableCell align="center">จัดการข้อมูล</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.UserID}>
                    <TableCell align="center">
                      <Avatar src={`${url}/user/image/${user.imageFile}`} alt={user.username} />
                    </TableCell>
                    <TableCell align="left">{user.username}</TableCell>
                    <TableCell align="left">{user.reason || 'ไม่ระบุเหตุผล'}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained">ตรวจสอบ</Button>
                      <Button variant="outlined" sx={{ ml: 2 }}>
                        ระงับผู้ใช้
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}
