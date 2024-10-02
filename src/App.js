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

import CustomerIndex from './components/admin/customer/Index';
import CustomerCreate from './components/admin/customer/Create';
import CustomerView from './components/admin/customer/View';
import CustomerUpdate from './components/admin/customer/Update';

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
        <Route exact path='/cusview' element={<Cusview />} />
        <Route exact path='/addemployee' element={<AddEmployee />} />
        


        <Route exact path='/admin/customer' element={<CustomerIndex/>}/>
        <Route exact path='/admin/customer/create' element={<CustomerCreate/>}/>  
        <Route exact path='/admin/customer/view/:id' element={<CustomerView/>}/>      
        <Route exact path='/admin/customer/update/:id' element={<CustomerUpdate/>}/>
        <Route exact path='/admin/order' element={<OrderIndex/>}/>
        <Route exact path='/admin/order/view/:id' element={<OrderView/>}/>
        <Route exact path='/admin/payment/view/:id' element={<PaymentView/>}/>
      </Routes>
    </Router>
  );
}

export default App;
