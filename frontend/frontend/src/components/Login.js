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
            body: JSON.stringify({ 
                email: email.trim(), 
                password: password,
                role: roleParam 
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Invalid Credentials or Role Mismatch");
            }
            return res.json();
        })
        .then(data => {
            if (data.success && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setErrorMsg("Invalid Email, Password, or Role Mismatch");
            }
        })
        .catch(err => {
            console.error(err);
            setErrorMsg(`❌ Access Denied: Yeh account ${roleParam} workspace ke liye registered nahi hai!`);
        });
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col m-0 p-0 overflow-x-hidden box-border">
            
            {/* Top Navigation Bar */}
            <div className="w-full fixed top-0 left-0 z-50 bg-slate-950/60 backdrop-blur-md border-b border-gray-900/40 px-12 py-5 flex items-center justify-between box-border">
                <h1 className="text-2xl font-black text-indigo-500 cursor-pointer" onClick={() => navigate('/')}>NexaBridge.</h1>
                <div className="flex items-center gap-8 text-sm font-semibold text-gray-400">
                    <span className="hover:text-white cursor-pointer transition" onClick={() => navigate('/')}>Home</span>
                    <span className="hover:text-white cursor-pointer transition">Features</span>
                    <button onClick={() => navigate(`/login?role=${roleParam}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-600/20">Get Started</button>
                </div>
            </div>

            {/* Centered Form Wrapper Panel (Right Side Panel Completely Removed) */}
            <div className="w-full flex-1 flex min-h-screen items-center justify-center pt-20 p-6 box-border">
                <div className="w-full max-w-md bg-slate-900/40 border border-gray-900 p-10 rounded-3xl backdrop-blur-sm text-left shadow-2xl relative">
                    <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="text-center mb-8 relative z-10">
                        <h2 className="text-3xl font-black text-white tracking-tight">NexaBridge.</h2>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Secure Gateway • Workspace: <span className="text-indigo-400">{roleParam}</span></p>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-bold mb-5 text-center relative z-10">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Email Workspace Address</label>
                            <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-xs outline-none text-white transition" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Secret Identity Password</label>
                            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-xs outline-none text-white transition" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs transition shadow-lg uppercase tracking-wider mt-2">
                            Verify & Establish Session
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <p className="text-xs text-gray-400">
                            Don't have an account?{' '}
                            <span onClick={() => navigate(`/signup?role=${roleParam}`)} className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition underline ml-1">
                                Register Here
                            </span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;