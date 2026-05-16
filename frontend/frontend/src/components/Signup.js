import React, { useState } from 'react';

const Signup = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({
        username: '',
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
            // Client-side self authentication registration bypass
            const dummyUserData = {
                id: "dummy_id_" + Date.now(),
                username: formData.username,
                email: formData.email,
                role: formData.role
            };

            localStorage.setItem('token', 'mock_jwt_token_' + Date.now());
            localStorage.setItem('user', JSON.stringify(dummyUserData));
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Signup error:', error);
            setErrorMsg('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-900/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-md mt-10 text-left">
            <h2 className="text-3xl font-black text-center mb-2">Create Account</h2>
            <p className="text-gray-400 text-center text-sm mb-6 capitalize">Joining As {formData.role}</p>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 font-medium text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text" name="username" placeholder="Full Name" required 
                    value={formData.username} onChange={handleChange}
                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition"
                />
                <input 
                    type="email" name="email" placeholder="Email Address" required 
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition"
                />
                <input 
                    type="password" name="password" placeholder="Password" required 
                    value={formData.password} onChange={handleChange}
                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition"
                />
                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Register'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <span onClick={() => navigate(`/login?role=${formData.role}`)} className="text-purple-400 cursor-pointer hover:underline font-medium">Login</span>
            </p>
        </div>
    );
};

export default Signup;