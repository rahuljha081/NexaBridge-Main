import React from 'react';

const Dashboard = ({ navigate }) => {
    // LocalStorage se user ka data nikalna
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Agar koi bina login kiye directly /dashboard par aane ki koshish kare
    if (!token || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied!</h2>
                <p className="text-gray-400 mb-6">Bhai pehle login toh kar lo.</p>
                <button onClick={() => navigate('/login')} className="bg-blue-600 px-6 py-3 rounded-xl font-bold">
                    Go to Login
                </button>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Logged out successfully!");
        navigate('/'); // Wapas home page par bhej do
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 mt-10">
            {/* Header Section */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent capitalize">
                        Welcome, {user.username}!
                    </h1>
                    <p className="text-gray-400 mt-1 capitalize">Portal: {user.role}</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500 border border-red-500 text-white px-5 py-2 rounded-xl font-semibold transition"
                >
                    Logout 🚪
                </button>
            </div>

            {/* Dynamic System based on Role */}
            {user.role === 'student' ? (
                /* --- STUDENT SYSTEM --- */
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-blue-400">Student Workspace</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">🔍</div>
                            <h3 className="text-xl font-bold mb-2">Find Mentors</h3>
                            <p className="text-gray-400 text-sm">Connect with Alumni from Google, Amazon, etc.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">💼</div>
                            <h3 className="text-xl font-bold mb-2">Job Board</h3>
                            <p className="text-gray-400 text-sm">See exclusive referral listings posted by alumni.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">💬</div>
                            <h3 className="text-xl font-bold mb-2">My Chats</h3>
                            <p className="text-gray-400 text-sm">Resume conversations with your connections.</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- ALUMNI SYSTEM --- */
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-purple-400">Alumni Control Panel</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-purple-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">🤝</div>
                            <h3 className="text-xl font-bold mb-2">Mentorship Requests</h3>
                            <p className="text-gray-400 text-sm">View juniors waiting for your guidance.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-purple-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">📢</div>
                            <h3 className="text-xl font-bold mb-2">Post a Referral</h3>
                            <p className="text-gray-400 text-sm">Share current openings in your company.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-gray-700 hover:border-purple-500 transition cursor-pointer">
                            <div className="text-3xl mb-3">✨</div>
                            <h3 className="text-xl font-bold mb-2">Alumni Network</h3>
                            <p className="text-gray-400 text-sm">Connect with other pass-out batches.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;