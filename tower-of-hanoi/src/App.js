// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TowerOfHanoiGame from './components/TowerOfHanoiGame';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      setIsLoggedIn(true);
      setLoggedInUser(savedUser);
    }
  }, []);

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setLoggedInUser(username);
    localStorage.setItem('loggedInUser', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    localStorage.removeItem('loggedInUser');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/game"
          element={
            isLoggedIn ? (
              <TowerOfHanoiGame username={loggedInUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
