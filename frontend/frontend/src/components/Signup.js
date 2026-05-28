import React, { useState, useEffect } from 'react';

const Signup = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: currentRole || 'student' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false); 

    useEffect(() => {
        if (currentRole) setFormData(prev => ({ ...prev, role: currentRole }));
    }, [currentRole]);

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get('role') || formData.role;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmitTrigger = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setShowRegisterModal(true);
    };

    const confirmRegistrationAction = async () => {
        setShowRegisterModal(false);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.username, email: formData.email.toLowerCase().trim(), password: formData.password, role: roleParam })
            });
            const data = await response.json();
            if (data.success) {
                navigate(`/login?role=${roleParam}`);
            } else {
                setErrorMsg(data.error || 'This email address is already registered.');
            }
        } catch (error) {
            setErrorMsg('Registration failed. Connection timed out.');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* FIXED: Minimal container matching the exact same floating dimensions as Login */
        <div className="w-full max-w-[420px] bg-white rounded-md p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] font-sans border border-slate-200/50">
            
            {/* CUSTOM MINIMAL REGISTER CONFIRMATION MODAL */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 p-8 rounded-lg w-full max-w-sm text-center shadow-xl">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Confirm Registration</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Are you sure you want to deploy this active node configuration and register into the database network?</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRegisterModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-md font-medium text-sm transition">Cancel</button>
                            <button onClick={confirmRegistrationAction} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium text-sm transition shadow-sm">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logo Header */}
            <div className="mb-8 flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                    Nexa<span className="text-blue-600">Bridge.</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">
                    CREATE ACCOUNT • {roleParam}
                </span>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-md text-xs font-bold mb-4 text-center">
                    {errorMsg}
                </div>
            )}

            {/* Form Fields: Grid row setups stripped into sleek LeetCode inputs sequence */}
            <form onSubmit={handleFormSubmitTrigger} className="space-y-4 text-left">
                <input 
                    type="text" 
                    name="username"
                    required 
                    placeholder="Full Name" 
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="email" 
                    name="email"
                    required 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="password" 
                    name="password"
                    required 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#4a5e6d] hover:bg-[#3d4f5c] text-white font-medium py-3 rounded-md text-sm transition shadow-sm tracking-wide mt-2 disabled:opacity-60"
                >
                    {loading ? 'Processing Node...' : 'Sign Up'}
                </button>
            </form>

            {/* Footer Bottom Redirect */}
            <div className="mt-6 flex justify-center text-xs text-slate-400">
                Already have an account?{' '}
                <span 
                    onClick={() => navigate(`/login?role=${roleParam}`)} 
                    className="text-slate-800 font-bold hover:text-blue-600 cursor-pointer transition ml-1"
                >
                    Sign In
                </span>
            </div>
        </div>
    );
};

export default Signup;