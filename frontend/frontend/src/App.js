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

  // URL parameters aur Session Persistence check karne ke liye (Refresh & Direct URL barrier)
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const queryParams = new URLSearchParams(window.location.search);
      const roleParam = queryParams.get('role');

      // Session persistence logic: LocalStorage se token check karo
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (roleParam) {
        setRole(roleParam);
      } else if (user) {
        const parsedUser = JSON.parse(user);
        setRole(parsedUser.role || 'student');
      }

      // Barrier Check: Agar logged in hai aur user '/', '/login' ya '/signup' pe bhatak raha hai, to dashboard bhejo
      if (token && user) {
        if (path === '/' || path === '/login' || path === '/signup' || path === '/dashboard') {
          if (path !== '/dashboard') {
            window.history.replaceState({}, '', '/dashboard');
          }
          setPage('dashboard');
          return;
        }
      }

      // Normal routing agar user logged in nahi hai
      if (path === '/dashboard') {
        if (token && user) {
          setPage('dashboard');
        } else {
          window.history.replaceState({}, '', '/');
          setPage('home');
        }
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

  // Custom Navigation function jo bina crash kiye URL badlegi aur redirection rokesi
  const navigate = (toPath) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Barrier: Navbar se Home dabane par ya direct routing par agar logged in hai to dashboard pe lock rakho
    if (token && user && (toPath === '/' || toPath.startsWith('/login') || toPath.startsWith('/signup'))) {
      window.history.pushState({}, '', '/dashboard');
      setPage('dashboard');
      return;
    }

    // Normal navigation logic
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