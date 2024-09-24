import './App.css';
import SignInUser from './components/SignInUser';
import SignUp from './components/SignUp';
import ForgotPass from './components/ForgotPass';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainAdmin from './components/MainAdmin';
import Dashboard from './components/Dashboard';
import Cusview from './components/Cusview';
import AddEmployee from './components/AddEmployee';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signinuser" />} /> 
        <Route exact path='/signinuser' element={<SignInUser />} />
        <Route exact path='/signup' element={<SignUp />} />
        <Route exact path='/forgotpass' element={<ForgotPass />} />
        <Route exact path='/mainadmin' element={<MainAdmin />} />
        <Route exact path='/dashboard' element={<Dashboard />} />
        <Route exact path='/cusview' element={<Cusview />} />
        <Route exact path='/addemployee' element={<AddEmployee />} />
      </Routes>
    </Router>
  );
}

export default App;
