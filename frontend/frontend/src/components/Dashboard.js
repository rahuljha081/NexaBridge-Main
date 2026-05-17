import React, { useState, useEffect, useRef } from 'react';

const Dashboard = ({ navigate }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const [activeTab, setActiveTab] = useState('overview');
    const [jobsList, setJobsList] = useState([]);
    const [realMentors, setRealMentors] = useState([]);
    const [globalChats, setGlobalChats] = useState({});
    const [referralRequests, setReferralRequests] = useState([]);
    
    const [adminStats, setAdminStats] = useState({ totalStudents: 0, totalAlumni: 0, totalJobs: 0, totalRequests: 0 });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedJobForModal, setSelectedJobForModal] = useState(null);

    // Dynamic Search query tracking states
    const [jobSearchQuery, setJobSearchQuery] = useState('');
    const [mentorSearchQuery, setMentorSearchQuery] = useState('');

    // React ref anchor to target smooth chat box auto-scroll execution
    const chatBottomRef = useRef(null);

    const [applicationForm, setApplicationForm] = useState({
        candidateName: user ? user.username : '',
        candidateEmail: user ? user.email : '',
        skills: '',
        resumeUrl: '',
        coverLetter: ''
    });
    
    const [selectedMentorEmail, setSelectedMentorEmail] = useState(null); 
    const [typedMessage, setTypedMessage] = useState('');
    
    const [referralForm, setReferralForm] = useState({ title: '', company: '', location: '', experience: '', eligibilityCriteria: '' });

    const defaultJobs = [
        { id: "job_101", title: "Software Engineer - Backend", company: "Google", location: "Bangalore", experience: "0-2 Years", postedBy: "System Node", eligibilityCriteria: "B.Tech/MCA, Proficient in Java/Python, Strong DSA Knowledge." }
    ];

    // Trigger smooth auto scroll transition anchors on chat thread updates
    useEffect(() => {
        if (chatBottomRef.current) {
            chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [globalChats, selectedMentorEmail]);

    // System Repositories Mappings Hook
    useEffect(() => {
        if (!user) return;

        const savedJobs = JSON.parse(localStorage.getItem('global_job_board_pool')) || [];
        if (savedJobs.length === 0) {
            localStorage.setItem('global_job_board_pool', JSON.stringify(defaultJobs));
            setJobsList(defaultJobs);
        } else {
            setJobsList(savedJobs);
        }

        const allUsers = JSON.parse(localStorage.getItem('registered_users_pool')) || [];
        const alumniOnly = allUsers.filter(u => u.role === 'alumni');
        const studentsOnly = allUsers.filter(u => u.role === 'student');
        setRealMentors(alumniOnly);

        const registry = JSON.parse(localStorage.getItem('global_chat_registry')) || {};
        setGlobalChats(registry);

        const requests = JSON.parse(localStorage.getItem('global_referral_requests_pool')) || [];
        setReferralRequests(requests);

        setAdminStats({
            totalStudents: studentsOnly.length || 0,
            totalAlumni: alumniOnly.length || 0,
            totalJobs: savedJobs.length || defaultJobs.length,
            totalRequests: requests.length || 0
        });

    }, [activeTab, selectedMentorEmail]);

    if (!token || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
                <div className="bg-slate-800/50 border border-red-500/30 p-8 rounded-3xl text-center max-w-sm backdrop-blur-md">
                    <h2 className="text-3xl font-black text-red-400 mb-2">Access Denied</h2>
                    <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">Go to Login</button>
                </div>
            </div>
        );
    }

    const confirmLogoutAction = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        navigate('/');
    };

    const handleFormChange = (e) => {
        setReferralForm({ ...referralForm, [e.target.name]: e.target.value });
    };

    const handleAppFormChange = (e) => {
        setApplicationForm({ ...applicationForm, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const currentPool = JSON.parse(localStorage.getItem('global_job_board_pool')) || [];
        const newReferralObj = {
            id: "job_id_" + Date.now(),
            title: referralForm.title,
            company: referralForm.company,
            location: referralForm.location,
            experience: referralForm.experience,
            eligibilityCriteria: referralForm.eligibilityCriteria,
            postedBy: user.username,
            alumniEmail: user.email.toLowerCase()
        };
        localStorage.setItem('global_job_board_pool', JSON.stringify([newReferralObj, ...currentPool]));
        setReferralForm({ title: '', company: '', location: '', experience: '', eligibilityCriteria: '' });
        setActiveTab('overview');
    };

    const handleTriggerApplicationModal = (jobObj) => {
        const currentRequests = JSON.parse(localStorage.getItem('global_referral_requests_pool')) || [];
        const alreadyRequested = currentRequests.find(req => req.jobId === jobObj.id && req.studentEmail === user.email.toLowerCase());
        
        if (alreadyRequested) {
            alert("Application Log: You have already submitted a referral request for this position.");
            return;
        }

        setSelectedJobForModal(jobObj);
        setApplicationForm({
            candidateName: user.username,
            candidateEmail: user.email.toLowerCase(),
            skills: '',
            resumeUrl: '',
            coverLetter: ''
        });
        setShowApplicationModal(true);
    };

    const handleFinalApplicationSubmit = (e) => {
        e.preventDefault();
        let inputUrl = applicationForm.resumeUrl.trim();
        if (!inputUrl) {
            alert("Validation Error: Please provide an accessible resume cloud link connection.");
            return;
        }

        if (!/^https?:\/\//i.test(inputUrl)) {
            inputUrl = 'https://' + inputUrl;
        }

        const currentRequests = JSON.parse(localStorage.getItem('global_referral_requests_pool')) || [];
        
        const newRequestObj = {
            id: "req_id_" + Date.now(),
            jobId: selectedJobForModal.id,
            jobTitle: selectedJobForModal.title,
            company: selectedJobForModal.company,
            studentName: applicationForm.candidateName,
            studentEmail: applicationForm.candidateEmail,
            studentSkills: applicationForm.skills,
            resumeUrl: inputUrl, 
            studentMessage: applicationForm.coverLetter,
            alumniName: selectedJobForModal.postedBy,
            status: "Pending Review",
            timestamp: new Date().toLocaleDateString()
        };

        const updatedRequests = [newRequestObj, ...currentRequests];
        localStorage.setItem('global_referral_requests_pool', JSON.stringify(updatedRequests));
        setReferralRequests(updatedRequests);
        
        setShowApplicationModal(false);
        setSelectedJobForModal(null);
        alert(`Success: Your profile parameters transmitted securely to ${newRequestObj.alumniName}.`);
    };

    const handleUpdateRequestStatus = (requestId, targetStatus) => {
        const currentRequests = JSON.parse(localStorage.getItem('global_referral_requests_pool')) || [];
        const updatedRequests = currentRequests.map(req => {
            if (req.id === requestId) return { ...req, status: targetStatus };
            return req;
        });
        localStorage.setItem('global_referral_requests_pool', JSON.stringify(updatedRequests));
        setReferralRequests(updatedRequests);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedMentorEmail) return;

        const studentEmail = user.role === 'student' ? user.email.toLowerCase() : selectedMentorEmail.toLowerCase();
        const alumniEmail = user.role === 'alumni' ? user.email.toLowerCase() : selectedMentorEmail.toLowerCase();
        const chatKey = `${studentEmail}_${alumniEmail}`;

        const registry = JSON.parse(localStorage.getItem('global_chat_registry')) || {};
        const activeHistory = registry[chatKey] || [];

        const newMsgObj = {
            senderEmail: user.email.toLowerCase(),
            senderName: user.username,
            senderRole: user.role,
            text: typedMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        registry[chatKey] = [...activeHistory, newMsgObj];
        localStorage.setItem('global_chat_registry', JSON.stringify(registry));
        setGlobalChats(registry);
        setTypedMessage('');
    };

    const getResolvedChatKey = () => {
        if (!selectedMentorEmail) return '';
        const studentEmail = user.role === 'student' ? user.email.toLowerCase() : selectedMentorEmail.toLowerCase();
        const alumniEmail = user.role === 'alumni' ? user.email.toLowerCase() : selectedMentorEmail.toLowerCase();
        return `${studentEmail}_${alumniEmail}`;
    };

    // Client filtering compute pipelines
    const filteredJobs = jobsList.filter(job => 
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase())
    );

    const filteredMentors = realMentors.filter(mentor => 
        mentor.username.toLowerCase().includes(mentorSearchQuery.toLowerCase()) ||
        mentor.email.toLowerCase().includes(mentorSearchQuery.toLowerCase())
    );

    return (
        <div className="w-full min-h-screen bg-slate-950 text-white pt-28 pb-12 text-left relative">
            
            {/* APPLICATION MODAL POPUP FORM */}
            {showApplicationModal && selectedJobForModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-gray-800 p-8 rounded-3xl w-full max-w-lg shadow-2xl my-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Referral Application</span>
                                <h3 className="text-2xl font-black mt-2 text-white">{selectedJobForModal.title}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Target Entity: {selectedJobForModal.company} — Alumni: {selectedJobForModal.postedBy}</p>
                            </div>
                            <button onClick={() => setShowApplicationModal(false)} className="text-gray-500 hover:text-white font-bold text-sm">✕</button>
                        </div>

                        <form onSubmit={handleFinalApplicationSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Full Name</label>
                                    <input type="text" name="candidateName" required value={applicationForm.candidateName} onChange={handleAppFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Email Address</label>
                                    <input type="email" name="candidateEmail" required readOnly value={applicationForm.candidateEmail} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-500 outline-none cursor-not-allowed" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Core Technical Skills Matrix</label>
                                <input type="text" name="skills" required placeholder="e.g., Java, React, Node.js, DSA, SQL" value={applicationForm.skills} onChange={handleAppFormChange} className="w-full bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Resume Drive/Cloud URL Connection Link</label>
                                <input type="text" name="resumeUrl" required placeholder="www.drive.google.com/your-resume-link" value={applicationForm.resumeUrl} onChange={handleAppFormChange} className="w-full bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Brief Message / Pitch to Alumni (Optional)</label>
                                <textarea name="coverLetter" rows="3" placeholder="Why are you a great fit for this specific role? Mention projects or qualifications..." value={applicationForm.coverLetter} onChange={handleAppFormChange} className="w-full bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white resize-none outline-none transition" />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowApplicationModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-xs transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs transition shadow-lg transition">Submit Full Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LOGOUT POPUP MODAL */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-gray-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
                        <div className="text-4xl mb-4">🚪</div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Confirm Logout</h3>
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Are you sure you want to terminate your current workspace session logs?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm transition">Cancel</button>
                            <button onClick={confirmLogoutAction} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition">Yes, Logout</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6">
                
                {/* Header Section */}
                <div className="w-full flex items-center justify-between border-b border-gray-800/60 pb-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Welcome, <span className="text-blue-400">{user.username}</span>!</h1>
                        <p className="text-gray-400 mt-2 text-xs font-semibold tracking-wider uppercase">Active Identity Workspace: <span className="text-purple-400 font-bold">{user.role}</span></p>
                    </div>
                    <div className="flex gap-4">
                        {activeTab !== 'overview' && (
                            <button onClick={() => { setActiveTab('overview'); setSelectedMentorEmail(null); setJobSearchQuery(''); setMentorSearchQuery(''); }} className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">← Back to Panel</button>
                        )}
                        <button onClick={() => setShowLogoutModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg">Logout</button>
                    </div>
                </div>

                {/* --- 1. OVERVIEW ENGINE --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {user.role === 'student' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div onClick={() => setActiveTab('mentors')} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">🔍</div>
                                        <h3 className="text-lg font-bold mb-2">Find Mentors</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Connect with real Alumni currently registered inside the active database.</p>
                                    </div>
                                    <div onClick={() => setActiveTab('jobs')} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">💼</div>
                                        <h3 className="text-lg font-bold mb-2">Job Board</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">See exclusive referral listings and active hiring posts shared by alumni.</p>
                                    </div>
                                    <div onClick={() => { setActiveTab('chats'); if(realMentors.length > 0) setSelectedMentorEmail(realMentors[0].email); }} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-blue-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">💬</div>
                                        <h3 className="text-lg font-bold mb-2">My Chats</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">Open secure communication rooms to message your connected alumni network.</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/30 border border-gray-800/60 p-6 rounded-3xl">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Application Status Tracker</h4>
                                    {referralRequests.filter(req => req.studentEmail === user.email.toLowerCase()).length === 0 ? (
                                        <p className="text-xs text-gray-600 font-medium">You have not transmitted any job referral logs yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {referralRequests.filter(req => req.studentEmail === user.email.toLowerCase()).map(req => (
                                                <div key={req.id} className="bg-slate-950/60 border border-gray-900 p-4 rounded-xl flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="text-white font-bold text-sm block">{req.jobTitle}</span>
                                                        <span className="text-gray-500 mt-1 block">Entity: {req.company} — Handler: {req.alumniName}</span>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-lg font-bold ${
                                                        req.status === 'Approved & Referred' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                        req.status === 'Declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {user.role === 'alumni' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div onClick={() => setActiveTab('post-referral')} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">📢</div>
                                    <h3 className="text-lg font-bold mb-2">Post a Referral</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">Share ongoing job openings and internal roles in your current company.</p>
                                </div>
                                <div onClick={() => setActiveTab('requests')} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">📥</div>
                                    <h3 className="text-lg font-bold mb-2">Inbound Requests</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">View inbound requests transmitted by students matching your listings.</p>
                                </div>
                                <div onClick={() => { setActiveTab('chats'); }} className="bg-slate-900/50 p-8 rounded-3xl border border-gray-800/60 hover:border-purple-500/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl">💬</div>
                                    <h3 className="text-lg font-bold mb-2">Student Chat Logs</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">Review incoming direct chat logs and respond to students initialization queries.</p>
                                </div>
                            </div>
                        )}

                        {user.role === 'admin' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-gray-800/60 shadow-xl flex flex-col justify-between">
                                        <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase block">Total Enrolled Students</span>
                                        <span className="text-4xl font-black text-blue-400 mt-4 block">{adminStats.totalStudents}</span>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-gray-800/60 shadow-xl flex flex-col justify-between">
                                        <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase block">Vetted Tech Alumni</span>
                                        <span className="text-4xl font-black text-purple-400 mt-4 block">{adminStats.totalAlumni}</span>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-gray-800/60 shadow-xl flex flex-col justify-between">
                                        <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase block">Broadcasted Referrals</span>
                                        <span className="text-4xl font-black text-emerald-400 mt-4 block">{adminStats.totalJobs}</span>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-gray-800/60 shadow-xl flex flex-col justify-between">
                                        <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase block">Transmitted Applications</span>
                                        <span className="text-4xl font-black text-amber-400 mt-4 block">{adminStats.totalRequests}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 2. SUB-PANEL RENDERS --- */}
                
                {/* FIND MENTORS WITH REAL FILTER ROW */}
                {activeTab === 'mentors' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-blue-400">Verified Network Mentors</h2>
                                <p className="text-gray-400 text-xs mt-0.5">Showing live database synced professional network pools.</p>
                            </div>
                            {/* SLEEK MENTOR SEARCH BAR */}
                            <input 
                                type="text" placeholder="🔍 Search mentors by name or email..." value={mentorSearchQuery}
                                onChange={(e) => setMentorSearchQuery(e.target.value)}
                                className="bg-slate-900 border border-gray-800 focus:border-blue-500 px-4 py-2 rounded-xl text-xs outline-none text-white w-full md:w-64 transition"
                            />
                        </div>

                        {filteredMentors.length === 0 ? ( 
                            <div className="bg-slate-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">No matching alumni profiles found in registries.</div> 
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredMentors.map(mentor => (
                                    <div key={mentor.email} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex items-start gap-4">
                                        <div className="text-4xl bg-slate-950 p-3 rounded-xl">👨‍💻</div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-white">{mentor.username}</h4>
                                            <p className="text-sm font-semibold text-blue-400">Verified Alumni Expert</p>
                                            <p className="text-xs text-gray-500 mt-1">{mentor.email}</p>
                                            {user.role === 'student' && ( <button onClick={() => { setSelectedMentorEmail(mentor.email.toLowerCase()); setActiveTab('chats'); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 mt-4 rounded-lg transition">Connect & Chat</button> )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* JOB BOARD WITH SEARCH INTEGRATION */}
                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-black text-blue-400">Active Internal Referrals</h2>
                            {/* SLEEK JOB SEARCH BAR */}
                            <input 
                                type="text" placeholder="🔍 Search jobs by title or corporate entity..." value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                className="bg-slate-900 border border-gray-800 focus:border-blue-500 px-4 py-2 rounded-xl text-xs outline-none text-white w-full md:w-72 transition"
                            />
                        </div>

                        {filteredJobs.length === 0 ? (
                            <div className="bg-slate-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">No active vacancies matching criteria string fields.</div>
                        ) : (
                            <div className="space-y-4">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-white">{job.title}</h4>
                                            <p className="text-sm text-gray-400">{job.company} — <span className="text-xs text-gray-500">{job.location}</span></p>
                                            <p className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-2">Exp: {job.experience} — By: {job.postedBy}</p>
                                            {job.eligibilityCriteria && (
                                                <div className="mt-3 bg-slate-950/60 border border-gray-800/40 p-3 rounded-xl text-xs">
                                                    <span className="text-amber-400 font-bold block mb-1">📋 Eligibility & Requirements:</span>
                                                    <p className="text-gray-300 leading-relaxed">{job.eligibilityCriteria}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleTriggerApplicationModal(job)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition md:self-center shrink-0">Request Referral</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* POST A REFERRAL */}
                {activeTab === 'post-referral' && (
                    <div className="w-full max-w-xl bg-slate-900/50 border border-gray-800 p-8 rounded-3xl backdrop-blur-sm">
                        <h2 className="text-2xl font-black text-purple-400 mb-6">Post Opportunity Listing</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <input type="text" name="title" required placeholder="Job Title" value={referralForm.title} onChange={handleFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                            <input type="text" name="company" required placeholder="Company" value={referralForm.company} onChange={handleFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="location" required placeholder="Location" value={referralForm.location} onChange={handleFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                                <input type="text" name="experience" required placeholder="Experience Bracket" value={referralForm.experience} onChange={handleFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none text-white" />
                            </div>
                            <div>
                                <textarea name="eligibilityCriteria" rows="3" placeholder="Enter requirements..." value={referralForm.eligibilityCriteria} onChange={handleFormChange} className="w-full bg-slate-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none text-white resize-none" />
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-sm transition">Broadcast Referral Listing</button>
                        </form>
                    </div>
                )}

                {/* INBOUND REFERRAL REQUESTS */}
                {activeTab === 'requests' && (
                    <div>
                        <h2 className="text-2xl font-black text-purple-400 mb-6">Inbound Student Referral Requests</h2>
                        {referralRequests.filter(req => req.alumniName === user.username).length === 0 ? ( <div className="bg-slate-900/40 border border-gray-800 rounded-3xl p-8 text-center text-gray-500">📥 No student application logs targeting your posts.</div> ) : (
                            <div className="space-y-4">
                                {referralRequests.filter(req => req.alumniName === user.username).map(req => (
                                    <div key={req.id} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-800/40 pb-4">
                                            <div>
                                                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Role Selected: {req.jobTitle}</span>
                                                <h4 className="text-xl font-black text-white mt-2">{req.studentName}</h4>
                                                <p className="text-xs text-gray-400">Contact Email: {req.studentEmail} — Logged: {req.timestamp}</p>
                                                <p className="text-[11px] mt-2 font-bold">Current State Status: <span className={`${req.status === 'Approved & Referred' ? 'text-emerald-400' : req.status === 'Declined' ? 'text-red-400' : 'text-amber-400'}`}>{req.status}</span></p>
                                            </div>
                                            <div className="flex gap-2">
                                                {req.status === 'Pending Review' ? (
                                                    <>
                                                        <button onClick={() => handleUpdateRequestStatus(req.id, 'Declined')} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold px-4 py-2.5 rounded-xl transition">Decline Candidate</button>
                                                        <button onClick={() => handleUpdateRequestStatus(req.id, 'Approved & Referred')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg">Accept & Refer</button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-500 border border-gray-800 px-3 py-1.5 rounded-xl italic">Logged Action Saved</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-gray-900">
                                            <div>
                                                <span className="text-blue-400 font-bold block uppercase tracking-wider text-[10px] mb-1">Declared Candidate Skills:</span>
                                                <p className="text-gray-200 font-medium">{req.studentSkills || "None Declared"}</p>
                                            </div>
                                            {req.studentMessage && (
                                                <div>
                                                    <span className="text-purple-400 font-bold block uppercase tracking-wider text-[10px] mb-1">Student Pitch Note:</span>
                                                    <p className="text-gray-300 italic">"{req.studentMessage}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {req.resumeUrl && (
                                            <div className="pt-1">
                                                <a 
                                                    href={req.resumeUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 text-xs font-black px-6 py-3 rounded-xl transition items-center gap-2 shadow-md cursor-pointer"
                                                >
                                                    📄 Open & Review Candidate Resume Document →
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CHATS INTERFACE WITH INNER AUTO SCROLL POINT */}
                {activeTab === 'chats' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 bg-slate-900/40 border border-gray-800 rounded-3xl h-[600px] overflow-hidden backdrop-blur-sm">
                        <div className="border-r border-gray-800/80 bg-slate-950/40 p-4 overflow-y-auto flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Threads Log</h3>
                            {user.role === 'student' ? (
                                realMentors.map(mentor => (
                                    <div key={mentor.email} onClick={() => setSelectedMentorEmail(mentor.email.toLowerCase())} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedMentorEmail === mentor.email.toLowerCase() ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-900/60 border border-transparent'}`}>
                                        <div className="text-xl bg-slate-950 p-2 rounded-lg">👨‍💻</div>
                                        <div className="flex-1 overflow-hidden"><h5 className="text-sm font-bold truncate text-white">{mentor.username}</h5><p className="text-xs text-gray-500 truncate">{mentor.email}</p></div>
                                    </div>
                                ))
                            ) : (
                                Object.keys(globalChats).filter(key => key.endsWith(`_${user.email.toLowerCase()}`)).map(key => {
                                    const studentEmail = key.split('_')[0];
                                    const threadMessages = globalChats[key] || [];
                                    const studentName = threadMessages.length > 0 ? threadMessages.find(m => m.senderRole === 'student')?.senderName || "Student Profile" : "Candidate Room";
                                    return (
                                        <div key={studentEmail} onClick={() => setSelectedMentorEmail(studentEmail)} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedMentorEmail === studentEmail ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-slate-900/60 border border-transparent'}`}>
                                            <div className="text-xl bg-slate-950 p-2 rounded-lg">🎓</div>
                                            <div className="flex-1 overflow-hidden"><h5 className="text-sm font-bold truncate text-white">{studentName}</h5><p className="text-xs text-purple-400 truncate">{studentEmail}</p></div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-900/10">
                            {selectedMentorEmail ? (
                                <>
                                    <div className="border-b border-gray-800/80 p-4 bg-slate-950/20">
                                        <h4 className="text-sm font-bold text-white">{selectedMentorEmail}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Channel Secure Registry Synced</p>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
                                        {(globalChats[getResolvedChatKey()] || []).map((msg, index) => (
                                            <div key={index} className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm flex flex-col ${msg.senderEmail === user.email.toLowerCase() ? 'bg-indigo-600 text-white self-end rounded-tr-none' : 'bg-slate-950 border border-gray-800 text-gray-200 self-start rounded-tl-none'}`}>
                                                <span className="text-[9px] text-gray-400 mb-0.5 font-bold">{msg.senderName} ({msg.senderRole})</span>
                                                <span>{msg.text}</span>
                                                <span className="text-[9px] mt-1 text-gray-500 self-end">{msg.time}</span>
                                            </div>
                                        ))}
                                        {/* CRITICAL CHAT BOT ANCHOR LOG POINT */}
                                        <div ref={chatBottomRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-gray-800/80 p-4 bg-slate-950/20">
                                        <input type="text" placeholder="Type verified transmission chat context string..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 text-sm outline-none text-white transition" />
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">Send</button>
                                    </form>
                                </>
                            ) : ( <div className="flex flex-col items-center justify-center text-center h-full py-10 text-gray-500 text-sm">📥 Select an active conversation string from the log sidebar index.</div> )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;