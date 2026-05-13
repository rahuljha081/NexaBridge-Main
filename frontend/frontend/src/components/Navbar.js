import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-slate-900 text-white border-b border-gray-700">
      <div className="text-2xl font-bold tracking-tighter text-blue-500">
        NexaBridge<span className="text-white">.</span>
      </div>
      <div className="space-x-8 font-medium">
        <a href="#" className="hover:text-blue-400 transition">Home</a>
        <a href="#" className="hover:text-blue-400 transition">Features</a>
        <button className="bg-blue-600 px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;