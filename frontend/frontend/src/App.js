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

  // URL parameters aur Session Persistence check karne ke liye (Strict Role Authentication)
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const queryParams = new URLSearchParams(window.location.search);
      const roleParam = queryParams.get('role');

      // Session persistence logic: Get authenticated status from LocalStorage
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        // Strict Validation: If user is logged in, ALWAYS prioritize their registered account role
        const parsedUser = JSON.parse(user);
        setRole(parsedUser.role || 'student');
        
        // Router Barrier: Lock authenticated users inside the dashboard layout
        if (path === '/' || path === '/login' || path === '/signup' || path !== '/dashboard') {
          window.history.replaceState({}, '', '/dashboard');
        }
        setPage('dashboard');
        return;
      }

      // Guest Navigation: If not logged in, fetch requested role parameters from the URL safely
      if (roleParam) {
        setRole(roleParam);
      }

      // Unauthenticated standard path validation routing
      if (path === '/dashboard') {
        window.history.replaceState({}, '', '/');
        setPage('home');
      } else if (path === '/login') {
        setPage('login');
      } else if (path === '/signup') {
        setPage('signup');
      } else {
        setPage('home');
      }
    };

    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    return () => window.removeEventListener('popstate', handleLocationCheck);
  }, []);

  // Custom Navigation function that handles authenticated state protection
  const navigate = (toPath) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Security check: Force logged-in profiles to stay within the protected dashboard component
    if (token && user) {
      window.history.pushState({}, '', '/dashboard');
      setPage('dashboard');
      return;
    }

    // Standard public path dynamic navigation routing
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