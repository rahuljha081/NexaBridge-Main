import React, { useState } from 'react';

const Login = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get('role') || 'student';

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: password, role: roleParam })
        })
        .then(res => {
            if (!res.ok) throw new Error("Invalid Credentials");
            return res.json();
        })
        .then(data => {
            if (data.success && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setErrorMsg("Invalid Email or Password");
            }
        })
        .catch(err => {
            console.error(err);
            setErrorMsg("❌ Galat Email ya Password! Please sahi details daalein.");
        });
    };

    return (
        /* FIXED: Pure clean floating card structure just like the one before */
        <div className="w-full max-w-[420px] bg-white rounded-md p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] font-sans border border-slate-200/50">
            
            {/* Logo and Workspace Label */}
            <div className="mb-8 flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                    Nexa<span className="text-blue-600">Bridge.</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">
                    WORKSPACE: {roleParam}
                </span>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-md text-xs font-bold mb-4 text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <input 
                    type="email" 
                    required 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="password" 
                    required 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <button 
                    type="submit" 
                    className="w-full bg-[#4a5e6d] hover:bg-[#3d4f5c] text-white font-medium py-3 rounded-md text-sm transition shadow-sm tracking-wide mt-2"
                >
                    Sign In
                </button>
            </form>

            {/* LeetCode Bottom Links Row */}
            <div className="mt-6 flex justify-between items-center text-xs text-slate-400 px-1">
                <span className="hover:text-slate-800 cursor-pointer transition font-medium">
                    Forgot Password?
                </span>
                <span 
                    onClick={() => navigate(`/signup?role=${roleParam}`)} 
                    className="text-slate-800 font-bold hover:text-blue-600 cursor-pointer transition"
                >
                    Sign Up
                </span>
            </div>
        </div>
    );
};

export default Login;