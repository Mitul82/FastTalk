import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import { AuthContext } from '../context/authContext.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
    const { authUser } = React.useContext(AuthContext);

    return (
        <div className="bg-black bg-contain">
            <Toaster/>
            <Routes>
                <Route path='/' element={ authUser ? <HomePage/> : <Navigate to='/login' /> }/>
                <Route path='/login' element={ !authUser ? <LoginPage/> : <Navigate to='/'/> }/>
                <Route path='/profile' element={ authUser ? <ProfilePage/> : <Navigate to='/login'/> }/>
            </Routes>
        </div>
    );
}

export default App;