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

export default function Index() {
  const [employees, setemployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    employeesGet();
  }, []);

  const employeesGet = () => {
    axios.get(`${url}/employee`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setemployees(response.data); 
    })
    .catch((error) => {
      console.error('Error fetching employees', error);
    });
  };

  const Viewemployee = (id) => {
    window.location = `/admin/employee/view/${id}`;
  }

  const Updateemployee = (id) => {
    window.location = `/admin/employee/update/${id}`;
  }

  const employeeDelete = (id) => {
    axios.delete(`${url}/employee/${id}`, {
      headers: {
        'Accept': 'application/form-data',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        employeesGet();
      } else {
        alert('Failed to delete employee');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

  // List of side menu items
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => navigate('/') },
    { text: 'Add Employee', icon: <AnalyticsIcon />, action: () => navigate('/addemployee') },
    { text: 'Clients', icon: <PeopleIcon />, action: () => navigate('/admin/employee') },
    { text: 'Tasks', icon: <AnalyticsIcon />, action: () => navigate('/tasks') },
    { text: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { text: 'Feedback', icon: <FeedbackIcon />, action: () => navigate('/feedback') },
    { text: 'About', icon: <InfoIcon />, action: () => navigate('/about') },
  ];

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Drawer */}
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
        <Container sx={{ marginTop: 2 }} maxWidth="lg">
          <Paper sx={{ padding: 2 }}>
            <Box display="flex">
              <Box flexGrow={1}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  จัดการข้อมูลผู้ใช้
                </Typography>
              </Box>
              <Box>
                <Link to="/admin/employee/create">
                  <Button variant="contained" color="primary">
                    เพิ่มข้อมูลผู้ใช้
                  </Button>
                </Link>
              </Box>
            </Box>
            <TableContainer>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">รหัส</TableCell>
                    <TableCell align="center">รูป</TableCell>
                    <TableCell align="left">ชื่อ</TableCell>
                    <TableCell align="left">นามสกุล</TableCell>
                    <TableCell align="left">ชื่อผู้ใช้</TableCell>
                    <TableCell align="center">จัดการข้อมูล</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.employeeID}>
                      <TableCell align="right">{employee.employeeID}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          <Avatar src={url + '/employee/image/' + employee.imageFile} />
                        </Box>
                      </TableCell>
                      <TableCell align="left">{employee.firstname}</TableCell>
                      <TableCell align="left">{employee.lastname}</TableCell>
                      <TableCell align="left">{employee.employeename}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                          <Button onClick={() => Viewemployee(employee.employeeID)}>ตรวจสอบรายงาน</Button>
                          <Button onClick={() => Updateemployee(employee.employeeID)}>แก้ไข</Button>
                          <Button onClick={() => employeeDelete(employee.employeeID)}>ระงับผู้ใช้</Button>
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
  );
}
