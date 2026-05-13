import React, { useState } from 'react';
import axios from 'axios';

const Signup = ({ setAuthMode }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Debugging ke liye: Dekho ki data sahi format mein hai ya nahi
        console.log("Sending Data:", formData);

        try {
            // Ab hum pura URL nahi likhenge, sirf path likhenge kyunki proxy set hai
            const res = await axios.post('/api/register', formData);
            
            alert("Registration Successful! Now you can Login.");
            
            if(setAuthMode) setAuthMode(true); 
            
        } catch (err) {
            console.error("Signup Error:", err);
            alert("Error: " + (err.response?.data?.message || "Registration failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-gray-700 w-full max-w-md shadow-2xl text-white">
            <h2 className="text-3xl font-bold mb-6 text-center text-purple-400 font-sans">Create Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 outline-none focus:border-purple-500 transition" 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    required 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 outline-none focus:border-purple-500 transition" 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-4 rounded-xl bg-slate-900 border border-gray-700 outline-none focus:border-purple-500 transition" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
};

export default Signup;