import React, { useState, useEffect } from 'react';
import './output.css';
import Navbar from './components/Navbar';
import Home from './home'; 
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [page, setPage] = useState('home'); // home, login, signup, dashboard
  const [role, setRole] = useState('student');

  // URL parameters manually check karne ke liye (Bina router ke)
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const queryParams = new URLSearchParams(window.location.search);
      const roleParam = queryParams.get('role');

      if (roleParam) setRole(roleParam);

      if (path === '/login') setPage('login');
      else if (path === '/signup') setPage('signup');
      else if (path === '/dashboard') setPage('dashboard');
      else setPage('home');
    };

    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    return () => window.removeEventListener('popstate', handleLocationCheck);
  }, []);

  // Custom Navigation function jo bina crash kiye URL badlegi
  const navigate = (toPath) => {
    window.history.pushState({}, '', toPath);
    const url = new URL(window.location.origin + toPath);
    const roleParam = url.searchParams.get('role');
    
    if (roleParam) setRole(roleParam);
    
    if (url.pathname === '/login') setPage('login');
    else if (url.pathname === '/signup') setPage('signup');
    else if (url.pathname === '/dashboard') setPage('dashboard');
    else setPage('home');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar navigate={navigate} />
      
      <div className="flex flex-col items-center justify-center">
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'login' && <div className="mt-20"><Login navigate={navigate} currentRole={role} /></div>}
        {page === 'signup' && <div className="mt-20"><Signup navigate={navigate} currentRole={role} /></div>}
        {page === 'dashboard' && <Dashboard navigate={navigate} />}
      </div>
    </div>
  );
}

export default App;