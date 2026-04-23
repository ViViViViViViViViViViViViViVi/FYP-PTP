import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './app.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import CreateAccount from './pages/Create_Account';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Receipt from './pages/Receipt';
import LearningPage from './pages/Learning_Page';
import Admin from './pages/Admin';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
//import About from './pages/About';

// --- Protected Route (Any Logged In User) ---
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user_id'); 
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// --- Admin Only Route ---
const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user_id');
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const location = useLocation();

  const pathMap = {
    '/login': 'Login',
    '/home': 'Home',
    '/create-account': 'Create Account',
    '/profile': 'Profile',
    '/receipt': 'Receipt',
    '/learning': 'Learning Sandbox',
    '/admin': 'System Administration',
    // '/about': 'About Us'
    '/welcome': 'Welcome',
    '/settings': 'Settings'
  };

  const pageName = pathMap[location.pathname] || 'Welcome';
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  // --- NEW: LOGIC TO HIDE NAVBAR ---
  // Add any path to this array where you DON'T want the Navbar to show
  const hideNavbarPaths = ['/admin', '/login', '/create-account','/welcome'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div>
      {/* 1. Only show Navbar if we are NOT on a hidden path */}
      {!shouldHideNavbar && <Navbar setSymbol={setSymbol} pageName={pageName} />}
      
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Navigate to="/welcome" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/welcome" element={<Welcome />} />
        
        {/* ADMIN ROUTE */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />

        {/* TRADING ROUTES */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <Home symbol={symbol} setSymbol={setSymbol} />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <Profile />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/receipt" 
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <Receipt />}
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/learning" 
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <LearningPage />}
            </ProtectedRoute>
          } 
        />
        <Route 
  path="/settings" 
  element={
    <ProtectedRoute>
      {isAdmin ? <Navigate to="/admin" /> : <Settings />}
    </ProtectedRoute>
  } 
/>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;