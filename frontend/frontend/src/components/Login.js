import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ navigate, currentRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend ko email aur password ke sath ab CURRENT ROLE bhi jayega
            const res = await axios.post('/api/login', { 
                email, 
                password, 
                role: currentRole // <--- Ye line update kar di hai
            });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            alert(`Login Successful! Welcome back ${res.data.user.username}`);
            
            // Dashboard par bhejega
            navigate('/dashboard');
        } catch (err) {
            alert("Login Failed: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-700 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400 capitalize">
                {currentRole} Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-5">
                <input 
                    type="email" placeholder="Email Address" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 focus:border-blue-500 outline-none transition text-white"
                    onChange={(e) => setEmail(e.target.value)} required 
                />
                <input 
                    type="password" placeholder="Password" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 focus:border-blue-500 outline-none transition text-white"
                    onChange={(e) => setPassword(e.target.value)} required 
                />
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-white">
                    {loading ? "Checking..." : "Sign In"}
                </button>
            </form>
            
            {/* Sign Up Link toggler */}
            <div className="mt-6 text-center">
                <button 
                    onClick={() => navigate(`/signup?role=${currentRole}`)}
                    className="text-blue-400 hover:text-blue-300 transition underline font-medium text-sm"
                >
                    Don't have an account? Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;