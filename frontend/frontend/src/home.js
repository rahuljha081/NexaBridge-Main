import React, { useEffect, useRef } from 'react';

const Home = ({ navigate }) => {
    const portalSectionRef = useRef(null);
    
    // PREMIUM SCROLL REVEAL ENGINE: Automatically tracks and animates elements as they scroll into view
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-12');
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        const hiddenElements = document.querySelectorAll('.scroll-reveal');
        hiddenElements.forEach(el => observer.observe(el));

        return () => {
            hiddenElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    const scrollToPortals = () => {
        portalSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full min-h-screen bg-[#f7fdfb] text-slate-800 font-sans relative overflow-x-hidden selection:bg-[#a7f3d0]">
            
            <div className="absolute bottom-[5%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#a7f3d0]/20 to-[#ccfbf1]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Premium Header Navigation Layout */}
            <nav className="w-full fixed top-0 left-0 z-50 bg-white border-b border-[#e2f2ed] px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            Nexa<span className="text-[#0d9488]">Bridge.</span>
                        </span>
                    </div>
                    
                    {/* FIXED: Shifted links even more to the right, right next to the button */}
                    <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600 ml-auto mr-4">
                        <span className="hover:text-[#0d9488] cursor-pointer transition">Home</span>
                        <span className="hover:text-[#0d9488] cursor-pointer transition" onClick={scrollToPortals}>Portals</span>
                        <span className="hover:text-[#0d9488] cursor-pointer transition">Services</span>
                        <span className="hover:text-[#0d9488] cursor-pointer transition">Shop</span>
                        <span className="hover:text-[#0d9488] cursor-pointer transition">Contact</span>
                    </div>

                    <button 
                        onClick={() => navigate('/login')} 
                        className="bg-white hover:bg-slate-50 text-[#0d9488] border-2 border-[#0d9488] px-6 py-2 rounded-full text-xs font-black transition shadow-sm shrink-0"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Grid Wrapper Section */}
            <main className="max-w-6xl mx-auto px-6 pt-36 pb-16 relative z-10">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Premium Headings Stream */}
                    <div className="lg:col-span-7 text-left space-y-6 transform transition-all duration-1000 ease-out">
                        <span className="inline-block text-[11px] bg-[#d1f4e9] text-[#0f766e] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            Campus Connectivity Hub
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            Find your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d9488] to-[#14b8a6]">
                                dream future
                            </span> & mentor.
                        </h1>
                        <p className="text-slate-500 text-sm md:text-base max-w-xl leading-relaxed">
                            NexaBridge is a professional ecosystem designed to foster mentorship, networking, 
                            and career growth for the next generation of leaders. Bridging the gap seamlessly between students & alumni.
                        </p>

                        <div className="pt-2">
                            <button 
                                onClick={scrollToPortals} 
                                className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-black text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                            >
                                Explore Dashboard Portals <span>↓</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: FIXED IMAGE MODULE */}
                    <div className="lg:col-span-5 relative flex items-center justify-center">
                        <div className="bg-white border border-slate-100 p-4 rounded-[40px] shadow-2xl relative w-full max-w-sm overflow-hidden transform hover:scale-[1.02] transition duration-500">
                            <img 
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" 
                                alt="Nexa Networking Ecosystem Workspace"
                                className="w-full h-48 object-cover rounded-[28px] mb-4 shadow-sm"
                            />
                            <div className="px-3 pb-2 text-center">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nexa Network Workspace</h4>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">Over 2,000+ trusted corporate tracks globally mapped around our dashboard structures.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- 2. PORTAL SELECTION CARDS --- */}
                <div 
                    ref={portalSectionRef}
                    className="w-full pt-28 space-y-6 scroll-reveal opacity-0 translate-y-12 transition-all duration-1000 ease-out"
                >
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#0d9488] bg-[#d1f4e9] px-4 py-1.5 rounded-full border border-[#b2e7d7]">Portal Gateway</span>
                        <h2 className="text-3xl font-black mt-4 text-slate-900 tracking-tight">Select Target Identity Workspace</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-6 px-2">
                        
                        {/* Student Portal */}
                        <div className="group bg-white border border-[#e2f2ed] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgb(13,148,136,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden bg-white/80 backdrop-blur-sm min-h-[380px]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d9488] to-[#14b8a6] opacity-0 group-hover:opacity-100 transition z-20" />
                            <div className="w-full h-44 overflow-hidden relative shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80" 
                                    alt="Students Integration Panel" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                            </div>
                            <div className="p-6 flex flex-col flex-1 justify-between text-center items-center">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">Student Portal</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium px-2">Find mentors and exclusive tech job opportunities mapping vacancies.</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/login?role=student')}
                                    className="mt-4 bg-[#e6f7f2] hover:bg-[#0d9488] text-[#0d9488] hover:text-white font-black text-xs px-6 py-3 rounded-full transition-all duration-300 w-full shadow-sm"
                               >
                                    Enter Portal →
                                </button>
                            </div>
                        </div>

                        {/* Alumni Portal */}
                        <div className="group bg-white border border-[#e2f2ed] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgb(13,148,136,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden bg-white/70 backdrop-blur-sm min-h-[380px]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0d9488] to-[#14b8a6] opacity-0 group-hover:opacity-100 transition z-20" />
                            <div className="w-full h-44 overflow-hidden relative shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80" 
                                    alt="Alumni Dashboard Ecosystem" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                            </div>
                            <div className="p-6 flex flex-col flex-1 justify-between text-center items-center">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">Alumni Portal</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium px-2">Network with fellow batchmates and guide your juniors lines safely.</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/login?role=alumni')}
                                    className="mt-4 bg-[#e6f7f2] hover:bg-[#0d9488] text-[#0d9488] hover:text-white font-black text-xs px-6 py-3 rounded-full transition-all duration-300 w-full shadow-sm"
                                >
                                    Enter Portal →
                                </button>
                            </div>
                        </div>

                        {/* Admin Portal */}
                        <div className="group bg-white border border-[#e2f2ed] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgb(13,148,136,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden bg-white/70 backdrop-blur-sm min-h-[380px]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e11d48] to-[#f43f5e] opacity-0 group-hover:opacity-100 transition z-20" />
                            <div className="w-full h-44 overflow-hidden relative shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80" 
                                    alt="System Administrator Core Interface" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                            </div>
                            <div className="p-6 flex flex-col flex-1 justify-between text-center items-center">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">Admin Portal</h3>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium px-2">Control configurations and manage the overall NexaBridge network layers.</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/login?role=admin')}
                                    className="mt-4 bg-[#ffe4e6] hover:bg-[#e11d48] text-[#e11d48] hover:text-white font-black text-xs px-6 py-3 rounded-full transition-all duration-300 w-full shadow-sm"
                                >
                                    Enter Portal →
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- 3. STATS COUNTER BAR --- */}
                <div className="w-full pt-16 border-t border-[#e2f2ed] mt-24 scroll-reveal opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl md:text-4xl font-black text-slate-900">15,000+</div>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Active Students</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-black text-slate-900">1,200+</div>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Verified Alumni</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-black text-slate-900">4,500+</div>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Referrals Filled</div>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-black text-slate-900">50+</div>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Tier-1 Companies</div>
                        </div>
                    </div>
                </div>

                {/* --- 4. DETAILED PLATFORM FEATURES EXPLORER --- */}
                <div className="w-full pt-28 text-left scroll-reveal opacity-0 translate-y-12 transition-all duration-1000 ease-out">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#0d9488] bg-[#d1f4e9] px-4 py-1.5 rounded-full border border-[#b2e7d7]">Core Capabilities</span>
                        <h2 className="text-4xl font-black mt-4 text-slate-900 tracking-tight">Everything You Need to Advance Your Career</h2>
                        <p className="text-slate-500 mt-3 text-sm font-medium"> A comprehensive ecosystem designed specifically for campuses and structural verification networks.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl border border-[#e2f2ed] hover:border-[#0d9488]/30 transition-all duration-300 shadow-sm flex flex-col">
                            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80" alt="Identity Check" className="w-full h-32 object-cover" />
                            <div className="p-6 flex-1">
                                <h4 className="text-base font-bold mb-2 text-slate-900">Vetted Corporate Identity</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium">Alumni registers through strict corporate endpoints verification loops (e.g., @google.com) to neutralize fraud logs completely.</p>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl border border-[#e2f2ed] hover:border-[#0d9488]/30 transition-all duration-300 shadow-sm flex flex-col">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80" alt="Career Opportunities Placement" className="w-full h-32 object-cover" />
                            <div className="p-6 flex-1">
                                <h4 className="text-base font-bold mb-2 text-slate-900">Fast-Track Referrals</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium">Students can directly request referrals on internal vacancy pools hosted by operating verified alumni network panels, skipping queues.</p>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl border border-[#e2f2ed] hover:border-[#0d9488]/30 transition-all duration-300 shadow-sm flex flex-col">
                            <img src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=400&q=80" alt="Mentorship Track Stream" className="w-full h-32 object-cover" />
                            <div className="p-6 flex-1">
                                <h4 className="text-base font-bold mb-2 text-slate-900">Structured Panels</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium">Integrated real-time chatting interface allowing seamless setup for mock code interviews, review sessions, and resume analysis logs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 5. WORKFLOW - HOW IT WORKS --- */}
                <div className="w-full pt-28 text-left scroll-reveal opacity-0 translate-y-12 transition-all duration-1000 ease-out">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">How NexaBridge Operates</h3>
                        <p className="text-slate-500 mt-2 text-xs font-medium">Three simple operational stages connecting networks instantly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-5xl font-black text-[#b2e7d7] mb-4 block">01</span>
                            <h5 className="text-lg font-bold mb-2 text-slate-900">Select Target Portal</h5>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">Choose your structural workspace based on your profile—Student, Alumni or Administrator control panels.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-5xl font-black text-[#b2e7d7] mb-4 block">02</span>
                            <h5 className="text-lg font-bold mb-2 text-slate-900">Authenticate Identity</h5>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">Log into secured endpoints with structural role validation guards protecting dashboard permissions configuration parameters.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-5xl font-black text-[#b2e7d7] mb-4 block">03</span>
                            <h5 className="text-lg font-bold mb-2 text-slate-900">Collaborate Globally</h5>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">Post verified tech referral listings, interact via direct systems, or monitor network traffic streams efficiently.</p>
                        </div>
                    </div>
                </div>

                {/* --- PREMIUM FOOTER --- */}
                <footer className="w-full border-t border-[#e2f2ed] pt-8 mt-24 text-center text-xs text-slate-400 font-semibold">
                    <p>© {new Date().getFullYear()} NexaBridge Platforms Inc. All professional rights reserved.</p>
                </footer>

            </main>
        </div>
    );
};

export default Home;