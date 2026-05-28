import React from 'react';

const Navbar = ({ navigate }) => {
  return (
    <nav className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Brand Logo Section */}
      <span className="text-xl font-black tracking-tight text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
        Nexa<span className="text-blue-600">Bridge.</span>
      </span>
      
      {/* Navigation Controls Section */}
      <div className="flex items-center">
        {/* FIXED: Removed Get Started and Features link. Shifted Home into a premium blue action button */}
        <button 
          onClick={() => navigate('/login')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-600/10 transition active:scale-95"
        >
          Home
        </button>
      </div>
    </nav>
  );
};

export default Navbar;