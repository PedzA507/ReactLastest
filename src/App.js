import './App.css';
import SignInUser from './components/SignInUser';
import SignUp from './components/SignUp';
import ForgotPass from './components/ForgotPass';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainAdmin from './components/MainAdmin';
import Dashboard from './components/admin/user/Dashboard';
import Userview from './components/Userview';
import AddEmployee from './components/admin/user/AddEmployee';

import UserIndex from './components/admin/user/Index';
import UserCreate from './components/admin/user/Create';
import UserView from './components/admin/user/View';
import UserUpdate from './components/admin/user/Update';

import OrderIndex from './components/admin/order/Index';
import OrderView from './components/admin/order/View';
import PaymentView from './components/admin/payment/View';

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
        <Route exact path='/Userview' element={<Userview />} />
        
        <Route exact path='/admin/addemployee' element={<AddEmployee />} />
        <Route exact path='/admin/user' element={<UserIndex/>}/>
        <Route exact path='/admin/user/create' element={<UserCreate/>}/>  
        <Route exact path='/admin/user/view/:id' element={<UserView/>}/>      
        <Route exact path='/admin/user/update/:id' element={<UserUpdate/>}/>
        <Route exact path='/admin/order' element={<OrderIndex/>}/>
        <Route exact path='/admin/order/view/:id' element={<OrderView/>}/>
        <Route exact path='/admin/payment/view/:id' element={<PaymentView/>}/>
      </Routes>
    </Router>
  );
}

export default App;
