import React from 'react';

const Dashboard = ({ navigate }) => {
    // LocalStorage se user ka data nikalna
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Access control check
    if (!token || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
                <div className="bg-slate-800/50 border border-red-500/30 p-8 rounded-3xl text-center max-w-sm backdrop-blur-md">
                    <h2 className="text-3xl font-black text-red-400 mb-2">Access Denied!</h2>
                    <p className="text-gray-400 mb-6 text-sm">Bhai pehle login toh kar lo.</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Fixed: alert() pop-up hata diya hai, ab click karte hi instant logout hoga
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 text-white pt-28 pb-12 text-left">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* Header Section */}
                <div className="w-full flex items-center justify-between border-b border-gray-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Welcome, <span className="text-blue-400">{user.username}</span>!
                        </h1>
                        <p className="text-gray-400 mt-2 text-xs font-semibold tracking-wider uppercase">
                            Portal: <span className="text-purple-400 font-bold">{user.role}</span>
                        </p>
                    </div>
                    
                    {/* Logout Button right side par locked */}
                    <div>
                        <button 
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-red-600/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Dynamic Content Cards */}
                {user.role === 'student' ? (
                    /* --- STUDENT WORKSPACE --- */
                    <div>
                        <h2 className="text-xl font-black mb-6 text-blue-400 uppercase tracking-wider text-sm">
                            Student Workspace
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">🔍</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">Find Mentors</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Connect with Alumni from Google, Amazon, and top tier product companies.</p>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">💼</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">Job Board</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">See exclusive referral listings and active hiring posts shared by alumni.</p>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">💬</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">My Chats</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Resume interactions, mock interviews and guidance talks with your connections.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- ALUMNI CONTROL PANEL --- */
                    <div>
                        <h2 className="text-xl font-black mb-6 text-purple-400 uppercase tracking-wider text-sm">
                            Alumni Control Panel
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">🤝</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">Mentorship Requests</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">View juniors waiting for your approval and professional guidance.</p>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">📢</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">Post a Referral</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Share ongoing job openings and internal roles in your current company.</p>
                            </div>
                            <div className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                                <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">✨</div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors">Alumni Network</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">Connect and expand your horizons with other pass-out batches globally.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;