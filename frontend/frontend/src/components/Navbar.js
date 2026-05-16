import React from 'react';

const Navbar = ({ navigate }) => {
    return (
        <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-gray-800 fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                {/* Logo - Ispe click karne par bhi Home page khulega */}
                <div 
                    onClick={() => navigate('/')} 
                    className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer select-none"
                >
                    NexaBridge.
                </div>

                {/* Nav Links */}
                <div className="flex items-center space-x-8">
                    <button 
                        onClick={() => navigate('/')} 
                        className="text-gray-300 hover:text-white font-medium transition text-sm"
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => navigate('/#features')} 
                        className="text-gray-400 hover:text-white font-medium transition text-sm"
                    >
                        Features
                    </button>
                    
                    {/* Get Started Button - Yeh bhi Home page ke portals pe le jayega */}
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20"
                    >
                        Get Started
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;