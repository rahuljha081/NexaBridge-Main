import React, { useState, useEffect } from 'react';

// GLOBAL CONFIGURATION: Apni Google Client ID yahan mapped hai
const REAL_GOOGLE_CLIENT_ID = "1052609516904-0e9fdpcl4dhnh6ino60sltivjg5mlp84.apps.googleusercontent.com";

const Signup = ({ navigate, currentRole }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: currentRole || 'student' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false); 
    const [isHumanVerified, setIsHumanVerified] = useState(false);

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
        <div className="w-full max-w-[420px] bg-white rounded-md p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] font-sans border border-slate-200/50 transition-all duration-300">
            
            {showRegisterModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 p-8 rounded-lg w-full max-w-sm text-center shadow-xl">
                        <div className="text-3xl mb-3">🚀</div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Confirm Registration</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Are you sure you want to deploy this active node configuration and register into the database network?</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRegisterModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-md font-medium text-sm transition">Cancel</button>
                            <button onClick={confirmRegistrationAction} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium text-sm transition shadow-sm">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                    Nexa<span className="text-blue-600">Bridge.</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-1">
                    CREATE ACCOUNT • {roleParam}
                </span>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-md text-xs font-bold mb-4 text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleFormSubmitTrigger} className="space-y-4 text-left">
                <input 
                    type="text" 
                    name="username"
                    required 
                    placeholder="Full Name" 
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="email" 
                    name="email"
                    required 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#f7f8fa] border border-[#e5e7eb] focus:border-blue-500 focus:bg-white rounded-md px-4 py-3 text-sm text-slate-800 outline-none transition placeholder-slate-400" 
                />

                <input 
                    type="password" 
                    name="password"
                    required 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleChange}
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
                    disabled={loading} 
                    className="w-full bg-[#4a5e6d] hover:bg-[#3d4f5c] text-white font-medium py-3 rounded-md text-sm transition shadow-sm tracking-wide mt-2 disabled:opacity-60"
                >
                    {loading ? 'Processing Node...' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-5 flex flex-col items-center justify-center">
                {/* Google official dynamic safe injector container block for signup */}
                <div 
                    onClick={() => setErrorMsg('')}
                    id="googleSignupButtonTargetDiv" 
                    className="w-full flex justify-center min-h-[44px]"
                ></div>
            </div>

            <div className="mt-6 flex justify-center text-xs text-slate-400">
                Already have an account?{' '}
                <span 
                    onClick={() => navigate(`/login?role=${roleParam}`)} 
                    className="text-slate-800 font-bold hover:text-blue-600 cursor-pointer transition ml-1"
                >
                    Sign In
                </span>
            </div>
        </div>
    );
};

export default Signup;