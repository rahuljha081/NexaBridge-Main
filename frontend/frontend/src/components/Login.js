import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            
            // Bhai token aur user info save karlo
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            alert("Login Successful! Welcome back " + res.data.user.username);
            
            // Yahan tu redirect kar sakta hai (e.g. window.location.href = '/dashboard')
        } catch (err) {
            alert("Login Failed: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-700 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-5">
                <input 
                    type="email" placeholder="Email Address" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 focus:border-blue-500 outline-none transition"
                    onChange={(e) => setEmail(e.target.value)} required 
                />
                <input 
                    type="password" placeholder="Password" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 focus:border-blue-500 outline-none transition"
                    onChange={(e) => setPassword(e.target.value)} required 
                />
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                    {loading ? "Checking..." : "Sign In"}
                </button>
            </form>
        </div>
    );
};

export default Login;