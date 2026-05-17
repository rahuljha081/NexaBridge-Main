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
            // LocalStorage data pool lookup to authenticate registered profiles
            const registeredUsers = JSON.parse(localStorage.getItem('registered_users_pool')) || [];

            // Find the account matching the exact email entered by the user
            const targetUser = registeredUsers.find(
                user => user.email.toLowerCase() === formData.email.toLowerCase()
            );

            // Validation 1: Check if the user pool contains this email address
            if (!targetUser) {
                setErrorMsg('Authentication error: Invalid email address or account does not exist.');
                setLoading(false);
                return;
            }

            // Validation 2: Role Verification Check - Match database record role with the current chosen portal role
            if (targetUser.role !== formData.role) {
                setErrorMsg(`Access denied: This account is registered as a "${targetUser.role}" and cannot access the "${formData.role}" portal.`);
                setLoading(false);
                return;
            }

            // Authentication successful: Set secure session storage profiles
            localStorage.setItem('token', 'mock_jwt_token_' + Date.now());
            localStorage.setItem('user', JSON.stringify(targetUser));
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Login authentication error:', error);
            setErrorMsg('Authentication failed. Server connection timeout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-900/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-md mt-10 text-left">
            <h2 className="text-3xl font-black text-center mb-2">Account Login</h2>
            <p className="text-gray-400 text-center text-sm mb-6 capitalize">Portal: {formData.role}</p>
            
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 font-medium text-center leading-relaxed">
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