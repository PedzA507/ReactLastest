import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function Editemployee() {
  const [employeeID, setemployeeID] = useState(''); // เพิ่ม employeeID
  const [employeename, setemployeename] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { id } = useParams(); // ดึง employeeID จาก URL

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก API
    axios.get(`${url}/profile/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const employee = response.data;
      setemployeeID(employee.employeeID); // ตั้งค่า employeeID จากข้อมูลที่ได้มา
      setemployeename(employee.employeename);
      setFirstName(employee.firstname);
      setLastName(employee.lastname);
      setEmail(employee.email);
      setAddress(employee.home);
      setPhoneNumber(employee.phonenumber);
    })
    .catch(error => {
      console.error('Error fetching employee data:', error);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.put(`${url}/employee/${id}`, {
      employeename,
      firstname: firstName,
      lastname: lastName,
      email,
      home: address,
      phonenumber: phoneNumber
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
        <Typography variant="body1" color="textSecondary" gutterBottom>
          รหัสผู้ใช้: {employeeID} {/* แสดงรหัสผู้ใช้ */}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="employeename"
                label="ชื่อผู้ใช้"
                value={employeename}
                onChange={(e) => setemployeename(e.target.value)}
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
