import React, { useState, useEffect } from 'react';

// GLOBAL CONFIGURATION: Apni Google Client ID yahan mapped hai
const REAL_GOOGLE_CLIENT_ID = "1052609516904-0e9fdpcl4dhnh6ino60sltivjg5mlp84.apps.googleusercontent.com";

const Signup = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: currentRole || 'student' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false); 
    const [isHumanVerified, setIsHumanVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (currentRole) setFormData(prev => ({ ...prev, role: currentRole }));
    }, [currentRole]);

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get('role') || formData.role;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmitTrigger = (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (!isHumanVerified) {
            setErrorMsg("❌ Please verify that you are human first.");
            return;
        }
        
        setShowRegisterModal(true);
    };

    const confirmRegistrationAction = async () => {
        setShowRegisterModal(false);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.username, email: formData.email.toLowerCase().trim(), password: formData.password, role: roleParam })
            });
            const data = await response.json();
            if (data.success) {
                navigate(`/login?role=${roleParam}`);
            } else {
                setErrorMsg(data.error || 'This email address is already registered.');
            }
        } catch (error) {
            setErrorMsg('Registration failed. Connection timed out.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignupSuccess = (credentialResponse) => {
        const token = credentialResponse.credential;

        fetch('http://localhost:5000/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, role: roleParam })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('token', data.backendToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setErrorMsg(data.message || "Google registration handshake failed.");
            }
        })
        .catch(err => {
            console.error(err);
            setErrorMsg("❌ Google identity server connection error.");
        });
    };

    // FIXED: Render standard button injection dynamically on Signup interface to bypass cache blocks
    useEffect(() => {
        const initializeGoogleSignUpEngine = () => {
            try {
                if (window.google && window.google.accounts) {
                    window.google.accounts.id.initialize({
                        client_id: REAL_GOOGLE_CLIENT_ID,
                        callback: handleGoogleSignupSuccess,
                        auto_select: false
                    });

                    const targetBtnDiv = document.getElementById("googleSignupButtonTargetDiv");
                    if (targetBtnDiv) {
                        window.google.accounts.id.renderButton(targetBtnDiv, {
                            theme: "outline",
                            size: "large",
                            text: "signup_with",
                            shape: "rectangular",
                            width: 340
                        });
                    }
                }
            } catch (err) {
                console.error("Google signup button mapping error:", err);
            }
        };

        const timer = setTimeout(initializeGoogleSignUpEngine, 400);
        return () => clearTimeout(timer);
    }, [isHumanVerified]);

    return (
        <div className="w-full max-w-5xl bg-white border border-[#cbebe1] rounded-[40px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[660px] transition-all duration-500 font-sans relative selection:bg-[#a7f3d0]">
            
            {/* PREMIUM REGISTER OVERLAY MODAL */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200/80 p-8 rounded-[32px] w-full max-w-sm text-center shadow-2xl border-b-4 border-[#0d9488]/20">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Registration</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">Are you sure you want to deploy this active node configuration and register into the database network?</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRegisterModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-full font-bold text-xs transition">Cancel</button>
                            <button onClick={confirmRegistrationAction} className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 rounded-full font-bold text-xs transition shadow-md">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT CONTAINER: DYNAMIC INPUT FORMS AREA */}
            <div className="md:col-span-6 p-10 flex flex-col justify-center bg-white relative z-10 text-left">
                
                {/* Brand Indicator Header */}
                <div className="flex items-center gap-1.5 mb-5 cursor-pointer" onClick={() => navigate('/')}>
                    <span className="w-3 h-3 bg-[#0d9488] rounded-full"></span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">NexaBridge</span>
                </div>

                <div className="space-y-1 mb-5">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                    <p className="text-xs font-medium text-slate-400">
                        Join NexaBridge to deploy active nodes and configure workspace settings.
                    </p>
                </div>

                {/* Sub-Tabs Selector Simulation */}
                <div className="grid grid-cols-2 bg-slate-50 p-1.5 rounded-full mb-5 border border-slate-100">
                    <button type="button" onClick={() => navigate(`/login?role=${roleParam}`)} className="text-slate-400 hover:text-slate-600 text-xs font-bold py-2 px-4 rounded-full transition">
                        Sign In
                    </button>
                    <button type="button" className="bg-white text-slate-900 text-xs font-bold py-2 px-4 rounded-full shadow-sm">
                        Sign Up
                    </button>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold mb-4 text-center">
                        {errorMsg}
                    </div>
                )}

                {/* Core Signup Form */}
                <form onSubmit={handleFormSubmitTrigger} className="space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-xs">👤</span>
                            <input 
                                type="text" 
                                name="username"
                                required 
                                placeholder="Enter your full name" 
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0d9488] focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none transition duration-300" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-xs">✉️</span>
                            <input 
                                type="email" 
                                name="email"
                                required 
                                placeholder="Enter your email address" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0d9488] focus:bg-white rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none transition duration-300" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-slate-400 text-xs">🔒</span>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                required 
                                placeholder="Create secure password" 
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-slate-50/50 border border-slate-200 focus:border-[#0d9488] focus:bg-white rounded-xl pl-11 pr-11 py-2.5 text-xs outline-none transition duration-300" 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 text-slate-400 text-xs font-bold hover:text-slate-600 transition"
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* NexaGuard Security Checkbox */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div 
                                onClick={() => setIsHumanVerified(!isHumanVerified)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border cursor-pointer transition ${isHumanVerified ? 'bg-[#0d9488] border-[#0d9488] text-white shadow-sm' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                            >
                                {isHumanVerified && (
                                    <svg className="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-xs font-bold text-slate-600 tracking-wide">
                                {isHumanVerified ? 'Success! Profile Verified.' : 'Verify you are human'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end opacity-80">
                            <span className="text-[14px]">☁️</span>
                            <span className="text-[8px] text-slate-400 font-mono tracking-tighter leading-none -mt-0.5">NexaGuard</span>
                        </div>
                    </div>

                    {/* Target Workspace Context Indicator */}
                    <div className="bg-[#e6f7f2] border border-[#b2e7d7] text-[#0f766e] text-[10px] font-bold px-4 py-2 rounded-xl flex items-center justify-between uppercase tracking-wider">
                        <span>Workspace Registry Target:</span>
                        <span className="bg-white px-2 py-0.5 rounded shadow-sm font-black text-[#0d9488]">{roleParam}</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-3 rounded-xl text-xs transition shadow-md hover:shadow-lg tracking-wide disabled:opacity-60"
                    >
                        {loading ? 'Processing Registry node...' : 'Sign Up'}
                    </button>
                </form>

                {/* OAuth Connect Separation Line */}
                <div className="mt-5 text-center space-y-4">
                    <div className="relative flex py-1 items-center justify-center">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-black tracking-widest">Or sign up with</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    {/* Official Google Container Target Binding Loop for Signup */}
                    <div className="w-full flex flex-col items-center justify-center">
                        <div id="googleSignupButtonTargetDiv" className="w-full flex justify-center min-h-[44px]"></div>
                    </div>
                </div>

                {/* Link Options */}
                <div className="mt-5 flex justify-center text-xs text-slate-400 font-semibold gap-1">
                    Already have an account?
                    <span 
                        onClick={() => navigate(`/login?role=${roleParam}`)} 
                        className="text-slate-800 font-bold hover:text-[#0d9488] cursor-pointer transition"
                    >
                        Sign In
                    </span>
                </div>
            </div>

            {/* RIGHT CONTAINER: TEAL METRICS BRAND INFRASTRUCTURE WALL */}
            <div className="hidden md:col-span-6 bg-gradient-to-br from-[#0d9488] to-[#115e59] p-10 flex flex-col justify-between relative overflow-hidden text-center items-center text-white border-l border-[#cbebe1]/20">
                
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                {/* Floating Telemetry Widgets */}
                <div className="w-full max-w-xs space-y-4 pt-4 relative z-10">
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-left shadow-lg transform -rotate-2 hover:rotate-0 transition duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold text-[#a7f3d0]">Global Referrals Volume</span>
                            <span className="text-xs">⚡ Active</span>
                        </div>
                        <div className="text-xl font-black text-white">4,500+</div>
                        <p className="text-[9px] text-[#ccfbf1] mt-1 font-medium">Internal referral requests successfully processed across network nodes.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-left shadow-lg transform translate-x-3 rotate-1 hover:rotate-0 transition duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs">🤝</span>
                            <h5 className="text-[11px] font-bold text-white">Alumni Verification Matrix</h5>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#a7f3d0] h-full w-[85%] rounded-full"></div>
                        </div>
                        <span className="text-[9px] text-[#ccfbf1] mt-1.5 block text-right font-semibold">Tier-1 Corporate Channels Sync</span>
                    </div>

                </div>

                {/* Lower Marketing Description Content */}
                <div className="space-y-2 mt-auto relative z-10 max-w-sm">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl mx-auto mb-3 shadow-md">
                        🎓
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white">A Unified Hub for Campus & Alumni Networking</h3>
                    <p className="text-[11px] text-[#ccfbf1] leading-relaxed font-medium">
                        NexaBridge provides students and operating professionals with a secure networking pipeline—offering real-time chat channels, vetted vacancy boards, and fast-track mentorship trackers.
                    </p>
                </div>

            </div>

        </div>
    );
};

export default Signup;