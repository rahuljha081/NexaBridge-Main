import React, { useState } from 'react'; // <--- Yahan useState add kiya
import './output.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  // state banayi hai: true matlab Login dikhega, false matlab Signup
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center text-center px-5 mt-20 pb-20">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Connect the World.
        </h1>
        
        <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mb-10">
          NexaBridge is the next generation platform for seamless communication.
        </p>
        
        {/* Action Buttons */}
        <div className="flex space-x-4 mb-16">
          {/* Join Now dabane par Signup dikhega */}
          <button 
            onClick={() => setShowLogin(false)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            Join Now
          </button>
          <button className="border border-gray-600 hover:bg-gray-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all">
            Learn More
          </button>
        </div>

        {/* Dynamic Section: Login ya Signup */}
        <div className="w-full flex flex-col items-center">
            {showLogin ? <Login /> : <Signup />}
            
            {/* Form ke niche toggle button */}
            <button 
                onClick={() => setShowLogin(!showLogin)} 
                className="mt-6 text-blue-400 hover:text-blue-300 transition underline font-medium"
            >
                {showLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
        </div>
        
      </main>
    </div>
  );
}

export default App;