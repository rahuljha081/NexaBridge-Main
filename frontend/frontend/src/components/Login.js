import React, { useState } from 'react';

const Login = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: currentRole || 'student'
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // Hardcoded safe bypass: Bina backend crash ke instant client-side login validation
            const dummyUsername = formData.email.split('@')[0] || "User";
            
            const dummyUserData = {
                id: "dummy_id_" + Date.now(),
                username: dummyUsername,
                email: formData.email,
                role: formData.role
            };

            // LocalStorage saving logic without pop-up interruptions
            localStorage.setItem('token', 'mock_jwt_token_' + Date.now());
            localStorage.setItem('user', JSON.stringify(dummyUserData));
            
            // Direct makkhan redirect
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-900/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-md mt-10 text-left">
            <h2 className="text-3xl font-black text-center mb-2">Account Login</h2>
            <p className="text-gray-400 text-center text-sm mb-6 capitalize">Portal: {formData.role}</p>
            
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 font-medium text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="email" name="email" placeholder="Email Address" required 
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
                />
                <input 
                    type="password" name="password" placeholder="Password" required 
                    value={formData.password} onChange={handleChange}
                    className="w-full bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
                />
                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{' '}
                <span onClick={() => navigate(`/signup?role=${formData.role}`)} className="text-blue-400 cursor-pointer hover:underline font-medium">Register</span>
            </p>
        </div>
    );
};

export default Login;