import React, { useState, useEffect } from 'react';

const Signup = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: currentRole || 'student'
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (currentRole) {
            setFormData(prev => ({ ...prev, role: currentRole }));
        }
    }, [currentRole]);

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get('role') || formData.role;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.username,
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password,
                    role: roleParam
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account Configuration Secured: User data successfully logged into MySQL Database!");
                
                const mockUserSession = {
                    name: formData.username,
                    email: formData.email.toLowerCase().trim(),
                    role: roleParam
                };
                localStorage.setItem('token', 'mock-jwt-token-node');
                localStorage.setItem('user', JSON.stringify(mockUserSession));
                
                navigate('/dashboard');
            } else {
                setErrorMsg(data.error || 'Account configuration error: This email address is already registered.');
            }
        } catch (error) {
            console.error('Registration configuration error:', error);
            setErrorMsg('Registration failed. Connection timed out with backend server.');
        } finally {
            setLoading(false);
        }
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
                        <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Joining As Workspace: <span className="text-indigo-400">{roleParam}</span></p>
                    </div>

                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-bold mb-5 text-center relative z-10">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Full Name</label>
                            <input 
                                type="text" name="username" placeholder="Rahul Jha" required 
                                value={formData.username} onChange={handleChange}
                                className="w-full bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Email Address</label>
                            <input 
                                type="email" name="email" placeholder="rahul@gmail.com" required 
                                value={formData.email} onChange={handleChange}
                                className="w-full bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Secret Security Password</label>
                            <input 
                                type="password" name="password" placeholder="••••••••" required 
                                value={formData.password} onChange={handleChange}
                                className="w-full bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition"
                            />
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-xs transition shadow-lg uppercase tracking-wider mt-4 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Register Account Node'}
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <p className="text-xs text-gray-400">
                            Already have an account?{' '}
                            <span onClick={() => navigate(`/login?role=${roleParam}`)} className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition underline ml-1">
                                Login Here
                            </span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Signup;