import React, { useState, useEffect } from 'react';

const REAL_GOOGLE_CLIENT_ID = "1052609516904-0e9fdpcl4dhnh6ino60sltivjg5mlp84.apps.googleusercontent.com";

const Login = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isHumanVerified, setIsHumanVerified] = useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const roleParam = queryParams.get('role') || 'student';

    // Core handle wrapper trigger for traditional login
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!isHumanVerified) {
            setErrorMsg("❌ Please verify that you are human first.");
            return;
        }

        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password: password, role: roleParam })
        })
        .then(res => {
            if (!res.ok) throw new Error("Invalid Credentials");
            return res.json();
        })
        .then(data => {
            if (data.success && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setErrorMsg("Invalid Email or Password");
            }
        })
        .catch(err => {
            console.error(err);
            setErrorMsg("❌ Galat Email ya Password! Please sahi details daalein.");
        });
    };

    const handleGoogleLoginSuccess = (credentialResponse) => {
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
                setErrorMsg(data.message || "Google Authentication Failed");
            }
        })
        .catch(err => {
            console.error(err);
            setErrorMsg("❌ Google Server Interaction Error.");
        });
    };

    // FIXED: Render standard button injection dynamically to absolute bypass background suppression traps
    useEffect(() => {
        const initializeGoogleSignInEngine = () => {
            try {
                if (window.google && window.google.accounts) {
                    window.google.accounts.id.initialize({
                        client_id: REAL_GOOGLE_CLIENT_ID,
                        callback: handleGoogleLoginSuccess,
                        auto_select: false
                    });

                    // Target explicit target button binding container node
                    const targetBtnDiv = document.getElementById("googleButtonTargetDiv");
                    if (targetBtnDiv) {
                        window.google.accounts.id.renderButton(targetBtnDiv, {
                            theme: "outline",
                            size: "large",
                            text: "signin_with",
                            shape: "rectangular",
                            width: 340
                        });
                    }
                }
            } catch (err) {
                console.error("Google button mapping error:", err);
            }
        };

        // Delay slight execution thread to let DOM node bindings settle
        const timer = setTimeout(initializeGoogleSignInEngine, 400);
        return () => clearTimeout(timer);
    }, [isHumanVerified]);

    return (
        <div className="w-full max-w-[420px] bg-white rounded-md p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] font-sans border border-slate-200/50 transition-all duration-300">
            
            <div className="mb-6 flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                    Nexa<span className="text-blue-600">Bridge.</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">
                    WORKSPACE: {roleParam}
                </span>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-md text-xs font-bold mb-4 text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <input 
                    type="email" 
                    required 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="password" 
                    required 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <div className="w-full bg-[#fcfcfc] border border-[#e5e7eb] rounded-md p-3 flex items-center justify-between my-2 select-none shadow-sm">
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={() => setIsHumanVerified(!isHumanVerified)}
                            className={`w-5 h-5 rounded flex items-center justify-center border cursor-pointer transition ${isHumanVerified ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                        >
                            {isHumanVerified && (
                                <svg className="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 tracking-wide">
                            {isHumanVerified ? 'Success! Verified.' : 'Verify you are human'}
                        </span>
                    </div>
                    <div className="flex flex-col items-end opacity-85">
                        <span className="text-[14px]">☁️</span>
                        <span className="text-[8px] text-slate-400 font-mono tracking-tighter leading-none -mt-0.5">NexaGuard</span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-[#4a5e6d] hover:bg-[#3d4f5c] text-white font-medium py-3 rounded-md text-sm transition shadow-sm tracking-wide mt-2"
                >
                    Sign In
                </button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col items-center justify-center">
                {/* FIXED PLACEHOLDER NODES: Google official direct standard safe injector container block */}
                <div 
                    onClick={() => setErrorMsg('')}
                    id="googleButtonTargetDiv" 
                    className="w-full flex justify-center min-h-[44px]"
                ></div>
            </div>

            <div className="mt-6 flex justify-between items-center text-xs text-slate-400 px-1">
                <span className="hover:text-slate-800 cursor-pointer transition font-medium">
                    Forgot Password?
                </span>
                <span 
                    onClick={() => navigate(`/signup?role=${roleParam}`)} 
                    className="text-slate-800 font-bold hover:text-blue-600 cursor-pointer transition"
                >
                    Sign Up
                </span>
            </div>
        </div>
    );
};

export default Login;