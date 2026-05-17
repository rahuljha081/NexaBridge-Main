import React from 'react';

const Home = ({ navigate }) => {
  return (
    <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center overflow-y-auto">
      
      {/* 1. HERO SECTION (Existing Top Part with Premium Tuning) */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight bg-gradient-to-r from-purple-400 via-indigo-200 to-blue-400 bg-clip-text text-transparent">
          Bridging the Gap Between <br /> Students & Alumni
        </h1>
        <p className="text-gray-400 mt-6 text-base md:text-lg max-w-2xl leading-relaxed">
          NexaBridge is a professional ecosystem designed to foster mentorship, networking, 
          and career growth for the next generation of leaders.
        </p>

        {/* 2. PORTAL SELECTION CARDS (Your Original Core Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16 max-w-5xl">
          {/* Student Portal */}
          <div className="bg-slate-900/40 border border-gray-800/80 p-8 rounded-3xl flex flex-col items-center text-center backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 shadow-xl group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🎓</div>
            <h3 className="text-xl font-bold mb-2">Student Portal</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Find mentors and exclusive tech job opportunities.</p>
            <button 
              onClick={() => navigate('/login?role=student')}
              className="mt-auto text-blue-400 hover:text-blue-300 text-sm font-semibold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Alumni Portal */}
          <div className="bg-slate-900/40 border border-gray-800/80 p-8 rounded-3xl flex flex-col items-center text-center backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 shadow-xl group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🏢</div>
            <h3 className="text-xl font-bold mb-2">Alumni Portal</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Network with fellow batchmates and guide your juniors.</p>
            <button 
              onClick={() => navigate('/login?role=alumni')}
              className="mt-auto text-purple-400 hover:text-purple-300 text-sm font-semibold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Admin Portal */}
          <div className="bg-slate-900/40 border border-gray-800/80 p-8 rounded-3xl flex flex-col items-center text-center backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 shadow-xl group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🔐</div>
            <h3 className="text-xl font-bold mb-2">Admin Portal</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Control configurations and manage the overall NexaBridge system.</p>
            <button 
              onClick={() => navigate('/login?role=admin')}
              className="mt-auto text-emerald-400 hover:text-emerald-300 text-sm font-semibold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. NEW SECTION: STATS COUNTER BAR */}
      <div className="w-full border-t border-b border-gray-800/60 bg-slate-950/60 py-12 mt-10 text-left">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-blue-500">15,000+</div>
            <div className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-black text-purple-500">1,200+</div>
            <div className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Verified Alumni</div>
          </div>
          <div>
            <div className="text-4xl font-black text-emerald-500">4,500+</div>
            <div className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Referrals Filled</div>
          </div>
          <div>
            <div className="text-4xl font-black text-amber-500">50+</div>
            <div className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-wider">Tier-1 Companies</div>
          </div>
        </div>
      </div>

      {/* 4. NEW SECTION: DETAILED PLATFORM FEATURES EXPLORER */}
      <div className="w-full bg-slate-950 py-24 text-left">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-4 py-1.5 rounded-full">Core Capabilities</span>
            <h2 className="text-4xl font-black mt-4 tracking-tight">Everything You Need to Advance Your Career</h2>
            <p className="text-gray-400 mt-3 text-base">A comprehensive ecosystem designed tailored specifically for college campuses and structural networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/30 p-8 rounded-3xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-xl mb-6">🛡️</div>
              <h4 className="text-xl font-bold mb-3">Vetted Corporate Credentialing</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Alumni registers through corporate email verifications (e.g., @google.com) to block fraud profiles and maintain interaction authenticity.</p>
            </div>

            <div className="bg-slate-900/30 p-8 rounded-3xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-xl mb-6">🚀</div>
              <h4 className="text-xl font-bold mb-3">Fast-Track Internal Referrals</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Students can request referrals directly on internal boards hosted by working professionals, skipping long application lines.</p>
            </div>

            <div className="bg-slate-900/30 p-8 rounded-3xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl mb-6">💬</div>
              <h4 className="text-xl font-bold mb-3">Structured Mentorship Panels</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Integrated real-time chatting interface allowing seamless setup for mock code interviews, review sessions, and resume analysis logs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. NEW SECTION: WORKFLOW - HOW IT WORKS */}
      <div className="w-full bg-slate-900 py-24 text-left border-t border-gray-800/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black tracking-tight">How NexaBridge Operates</h3>
            <p className="text-gray-400 mt-2 text-sm">Three simple operational stages connecting networks instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-gray-800 mb-4 block">01</span>
              <h5 className="text-lg font-bold mb-2">Select Target Portal</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Choose your structural workspace based on your profile—Student, Alumni or Administrator control panels.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-gray-800 mb-4 block">02</span>
              <h5 className="text-lg font-bold mb-2">Authenticate Identity</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Log into secured endpoints with structural role validation guards protecting dashboard permissions configuration parameters.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-gray-800 mb-4 block">03</span>
              <h5 className="text-lg font-bold mb-2">Collaborate Globally</h5>
              <p className="text-gray-400 text-xs leading-relaxed">Post verified tech referral listings, interact via direct systems, or monitor network traffic streams efficiently.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. NEW SECTION: PREMIUM FOOTER */}
      <div className="w-full bg-slate-950 border-t border-gray-900 py-8 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} NexaBridge Platforms Inc. All professional rights reserved.</p>
      </div>

    </div>
  );
};

export default Home;