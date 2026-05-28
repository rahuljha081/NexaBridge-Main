import React from 'react';

const Home = ({ navigate }) => {
  return (
    /* FIXED: Swapped dark theme classes for premium clean off-white (#f4f5f7) canvas */
    <div className="w-full min-h-screen bg-[#f4f5f7] text-slate-800 font-sans pb-24 selection:bg-blue-100">
      
      {/* 1. HERO SECTION */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        {/* FIXED: Shifted from multi-color transparent gradient to crisp solid black/slate-900 typography exactly as requested */}
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
          Bridging the Gap Between <br /> Students & Alumni
        </h1>
        <p className="text-slate-500 mt-6 text-base md:text-lg max-w-2xl leading-relaxed font-medium">
          NexaBridge is a professional ecosystem designed to foster mentorship, networking, 
          and career growth for the next generation of leaders.
        </p>

        {/* 2. PORTAL SELECTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16 max-w-5xl">
          {/* Student Portal */}
          <div className="bg-white border border-slate-200/70 p-8 rounded-3xl flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.05)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🎓</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Student Portal</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Find mentors and exclusive tech job opportunities.</p>
            <button 
              onClick={() => navigate('/login?role=student')}
              className="mt-auto text-blue-600 hover:text-blue-700 text-sm font-bold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Alumni Portal */}
          <div className="bg-white border border-slate-200/70 p-8 rounded-3xl flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.05)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🏢</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Alumni Portal</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Network with fellow batchmates and guide your juniors.</p>
            <button 
              onClick={() => navigate('/login?role=alumni')}
              className="mt-auto text-blue-600 hover:text-blue-700 text-sm font-bold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Admin Portal */}
          <div className="bg-white border border-slate-200/70 p-8 rounded-3xl flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.05)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">🔐</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">Admin Portal</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Control configurations and manage the overall NexaBridge system.</p>
            <button 
              onClick={() => navigate('/login?role=admin')}
              className="mt-auto text-blue-600 hover:text-blue-700 text-sm font-bold tracking-wide flex items-center gap-1 transition-colors"
            >
              Enter Portal <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. STATS COUNTER BAR */}
      <div className="w-full border-t border-b border-slate-200 bg-white/60 py-12 mt-10 text-left">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-blue-600">15,000+</div>
            <div className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-wider">Active Students</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600">1,200+</div>
            <div className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-wider">Verified Alumni</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600">4,500+</div>
            <div className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-wider">Referrals Filled</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600">50+</div>
            <div className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-wider">Tier-1 Companies</div>
          </div>
        </div>
      </div>

      {/* 4. DETAILED PLATFORM FEATURES EXPLORER */}
      <div className="w-full bg-white py-24 text-left border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Core Capabilities</span>
            <h2 className="text-4xl font-black mt-4 text-slate-900 tracking-tight">Everything You Need to Advance Your Career</h2>
            <p className="text-slate-500 mt-3 text-base font-medium">A comprehensive ecosystem designed tailored specifically for college campuses and structural networks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f9fa] p-8 rounded-3xl border border-slate-200/60 hover:border-blue-500/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl mb-6">🛡️</div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Vetted Corporate Credentialing</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Alumni registers through corporate email verifications (e.g., @google.com) to block fraud profiles and maintain interaction authenticity.</p>
            </div>

            <div className="bg-[#f8f9fa] p-8 rounded-3xl border border-slate-200/60 hover:border-blue-500/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl mb-6">🚀</div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Fast-Track Internal Referrals</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Students can request referrals directly on internal boards hosted by working professionals, skipping long application lines.</p>
            </div>

            <div className="bg-[#f8f9fa] p-8 rounded-3xl border border-slate-200/60 hover:border-blue-500/30 transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl mb-6">💬</div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Structured Mentorship Panels</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Integrated real-time chatting interface allowing seamless setup for mock code interviews, review sessions, and resume analysis logs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. WORKFLOW - HOW IT WORKS */}
      <div className="w-full bg-[#f8f9fa] py-24 text-left">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">How NexaBridge Operates</h3>
            <p className="text-slate-500 mt-2 text-sm font-medium">Three simple operational stages connecting networks instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-slate-300 mb-4 block">01</span>
              <h5 className="text-lg font-bold mb-2 text-slate-900">Select Target Portal</h5>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Choose your structural workspace based on your profile—Student, Alumni or Administrator control panels.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-slate-300 mb-4 block">02</span>
              <h5 className="text-lg font-bold mb-2 text-slate-900">Authenticate Identity</h5>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Log into secured endpoints with structural role validation guards protecting dashboard permissions configuration parameters.</p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-black text-slate-300 mb-4 block">03</span>
              <h5 className="text-lg font-bold mb-2 text-slate-900">Collaborate Globally</h5>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Post verified tech referral listings, interact via direct systems, or monitor network traffic streams efficiently.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PREMIUM FOOTER */}
      <div className="w-full bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-semibold">
        <p>© {new Date().getFullYear()} NexaBridge Platforms Inc. All professional rights reserved.</p>
      </div>

    </div>
  );
};

export default Home;