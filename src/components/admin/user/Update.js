import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function EditUser() {
  const [username, setUsername] = useState(''); // แก้ไขให้ค่าที่ตั้งได้แสดงถูกต้อง
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { id } = useParams(); // ดึง userID จาก URL

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก API
    axios.get(`${url}/profile/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const user = response.data;
      setUsername(user.username); // ตั้งค่า username จากข้อมูลที่ได้มา
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
      setAddress(user.home);  // ที่อยู่
      setPhoneNumber(user.phonenumber);  // เบอร์โทร
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.put(`${url}/user/${id}`, {
      username,
      firstname: firstName,
      lastname: lastName,
      email,
      home: address, // ที่อยู่
      phonenumber: phoneNumber // เบอร์โทร
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = response.data;
    if (result.status) {
        alert('บันทึกข้อมูลสำเร็จ');
    } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">แก้ไขข้อมูลผู้ใช้</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="ชื่อผู้ใช้"
                value={username} // แก้ให้แสดงค่า username ที่ได้มาจาก useEffect
                onChange={(e) => setUsername(e.target.value)} // รับค่าที่เปลี่ยนจาก input
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstname"
                label="ชื่อ"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastname"
                label="นามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                label="ที่อยู่"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phoneNumber"
                label="เบอร์โทร"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            บันทึกข้อมูล
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
