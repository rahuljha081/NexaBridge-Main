import React, { useState, useEffect, useRef } from 'react';

const Dashboard = ({ navigate }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const [activeTab, setActiveTab] = useState('overview');
    const [jobsList, setJobsList] = useState([]);
    const [realMentors, setRealMentors] = useState([]);
    const [globalChats, setGlobalChats] = useState([]); 
    const [referralRequests, setReferralRequests] = useState([]);
    
    const [adminStats, setAdminStats] = useState({ totalStudents: 0, totalAlumni: 0, totalJobs: 0, totalRequests: 0 });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [selectedJobForModal, setSelectedJobForModal] = useState(null);

    const [jobSearchQuery, setJobSearchQuery] = useState('');
    const [mentorSearchQuery, setMentorSearchQuery] = useState('');

    const chatBottomRef = useRef(null);

    const [applicationForm, setApplicationForm] = useState({
        candidateName: user ? user.name : '',
        candidateEmail: user ? user.email : '',
        skills: '',
        resumeUrl: '',
        coverLetter: ''
    });
    
    const [selectedMentorEmail, setSelectedMentorEmail] = useState(null); 
    const [typedMessage, setTypedMessage] = useState('');
    
    const [referralForm, setReferralForm] = useState({ 
        title: '', 
        company: '', 
        location: '', 
        experience: '', 
        eligibilityCriteria: '' 
    });

    useEffect(() => {
        if (chatBottomRef.current) {
            chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [globalChats]);

    // Core Data Synchronizer Pipeline
    useEffect(() => {
        if (!user || !user.email) return;

        fetch('http://localhost:5000/api/jobs')
            .then(res => res.json())
            .then(data => setJobsList(data))
            .catch(err => console.error("Jobs load failure:", err));

        fetch('http://localhost:5000/api/mentors')
            .then(res => res.json())
            .then(data => setRealMentors(data))
            .catch(err => console.error("Mentors load failure:", err));

        fetch(`http://localhost:5000/api/referrals?email=${user.email.toLowerCase()}&role=${user.role}`)
            .then(res => res.json())
            .then(data => setReferralRequests(data))
            .catch(err => console.error("Referrals stream tracking failure:", err));

        // CHAT SYNC FIX: Logic sequence aligned correctly with backend
        if (selectedMentorEmail) {
            const currentEmail = user.email.toLowerCase();
            const targetEmail = selectedMentorEmail.toLowerCase();
            
            const chatKey = user.role === 'student' 
                ? `${currentEmail}_${targetEmail}`
                : `${targetEmail}_${currentEmail}`;

            fetch(`http://localhost:5000/api/messages/${chatKey}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setGlobalChats(data);
                    }
                })
                .catch(err => console.error("Messages sync channel error:", err));
        }

        if (user.role === 'admin') {
            fetch('http://localhost:5000/api/admin/stats')
                .then(res => res.json())
                .then(data => {
                    setAdminStats({
                        totalStudents: data.students,
                        totalAlumni: data.jobs, 
                        totalJobs: data.jobs,
                        totalRequests: data.requests
                    });
                })
                .catch(err => console.error("Administrative logs failure:", err));
        }

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
        const compositeDescription = referralForm.eligibilityCriteria.trim() || 'No description requirements specified';
        const fallbackPostedBy = user && user.name && user.name.trim() !== "" ? user.name : user.email;
        
        fetch('http://localhost:5000/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: referralForm.title,
                company: referralForm.company,
                location: referralForm.location, 
                description: compositeDescription,
                experience: referralForm.experience,
                posted_by: fallbackPostedBy
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Database Confirmed: Job vacancy successfully locked and broadcasted into MySQL Workbench!");
                setReferralForm({ title: '', company: '', location: '', experience: '', eligibilityCriteria: '' });
                setActiveTab('overview');
            } else {
                alert("API Insertion Failure: Review database configuration schema logs.");
            }
        });
    };

    const handleTriggerApplicationModal = (jobObj) => {
        const alreadyRequested = referralRequests.find(req => req.job_id === jobObj.id && req.student_email === user.email.toLowerCase());
        if (alreadyRequested) {
            alert("Application Log: You have already submitted a referral request for this position.");
            return;
        }

        setSelectedJobForModal(jobObj);
        setApplicationForm({
            candidateName: user.name || '',
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
        if (!inputUrl) return;

        if (!/^https?:\/\//i.test(inputUrl)) {
            inputUrl = 'https://' + inputUrl;
        }

        fetch('http://localhost:5000/api/referrals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_name: applicationForm.candidateName,
                student_email: applicationForm.candidateEmail,
                job_id: selectedJobForModal.id,
                company: selectedJobForModal.company,
                resume_url: inputUrl
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Database Integration Completed: Referral token parameters registered safely.");
                setShowApplicationModal(false);
                setSelectedJobForModal(null);
                setActiveTab('overview');
            }
        });
    };

    const handleUpdateRequestStatus = (requestId, targetStatus) => {
        fetch(`http://localhost:5000/api/referrals/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: targetStatus })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`Status successfully modified to: ${targetStatus}`);
                setReferralRequests(referralRequests.map(req => req.id === requestId ? { ...req, status: targetStatus } : req));
            }
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedMentorEmail || !user.email) {
            alert("Chat Engine Parameter Validation Mismatch. Ensure active selection channel is open.");
            return;
        }

        const currentEmail = user.email.toLowerCase();
        const targetEmail = selectedMentorEmail.toLowerCase();

        const studentEmail = user.role === 'student' ? currentEmail : targetEmail;
        const alumniEmail = user.role === 'alumni' ? currentEmail : targetEmail;
        const chatKey = `${studentEmail}_${alumniEmail}`;

        const msgPayload = {
            chat_key: chatKey,
            sender_email: currentEmail,
            sender_name: user.name || currentEmail,
            sender_role: user.role,
            message_text: typedMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgPayload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setGlobalChats([...globalChats, {
                    senderEmail: msgPayload.sender_email,
                    senderName: msgPayload.sender_name,
                    senderRole: msgPayload.sender_role,
                    text: msgPayload.message_text,
                    time: msgPayload.timestamp
                }]);
                setTypedMessage('');
            } else {
                alert("Backend storage rejection. Check backend terminal traces.");
            }
        })
        .catch(err => console.error("Chat push payload wire transmission failed: ", err));
    };

    const filteredJobs = jobsList.filter(job => 
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase())
    );

    const filteredMentors = realMentors.filter(mentor => 
        mentor.name.toLowerCase().includes(mentorSearchQuery.toLowerCase()) ||
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
                                <p className="text-xs text-gray-400 mt-0.5">Target Entity: {selectedJobForModal.company} — Alumni: {selectedJobForModal.posted_by}</p>
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
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowApplicationModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-xs transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs transition shadow-lg">Submit Full Profile</button>
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
                        <h1 className="text-4xl font-black text-white tracking-tight">Welcome, <span className="text-blue-400">{user.name || user.email}</span>!</h1>
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
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Application Status Tracker (Live from MySQL)</h4>
                                    {referralRequests.length === 0 ? (
                                        <p className="text-xs text-gray-600 font-medium">You have not transmitted any job referral logs yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {referralRequests.map(req => (
                                                <div key={req.id} className="bg-slate-950/60 border border-gray-900 p-4 rounded-xl flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="text-white font-bold text-sm block">Position Record (ID: {req.job_id})</span>
                                                        <span className="text-gray-500 mt-1 block">Target Status Tracker Entity: {req.company}</span>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-gray-800/60 shadow-xl flex flex-col justify-between">
                                        <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase block">Total System Users</span>
                                        <span className="text-4xl font-black text-blue-400 mt-4 block">{adminStats.totalStudents}</span>
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
                {activeTab === 'mentors' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-black text-blue-400">Verified Network Mentors</h2>
                            <input type="text" placeholder="🔍 Search mentors..." value={mentorSearchQuery} onChange={(e) => setMentorSearchQuery(e.target.value)} className="bg-slate-900 border border-gray-800 focus:border-blue-500 px-4 py-2 rounded-xl text-xs outline-none text-white w-full md:w-64 transition" />
                        </div>
                        {filteredMentors.length === 0 ? ( <div className="bg-slate-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">No real alumni registered inside DB.</div> ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredMentors.map(mentor => (
                                    <div key={mentor.email} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex items-start gap-4">
                                        <div className="text-4xl bg-slate-950 p-3 rounded-xl">👨‍💻</div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-white">{mentor.name}</h4>
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

                {/* JOB BOARD */}
                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-black text-blue-400">Active Internal Referrals</h2>
                            <input type="text" placeholder="🔍 Search jobs..." value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} className="bg-slate-900 border border-gray-800 focus:border-blue-500 px-4 py-2 rounded-xl text-xs outline-none text-white w-full md:w-72 transition" />
                        </div>
                        {filteredJobs.length === 0 ? ( <div className="bg-slate-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">No active vacancies found in MySQL pools.</div> ) : (
                            <div className="space-y-4">
                                {filteredJobs.map(job => (
                                    <div key={job.id} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-white">{job.title}</h4>
                                            <p className="text-sm text-gray-400">{job.company} — <span className="text-xs text-gray-500">{job.location || 'Remote/Hybrid'}</span></p>
                                            <p className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-2">Exp: {job.experience} — By: {job.posted_by}</p>
                                            {job.description && (
                                                <div className="mt-3 bg-slate-950/60 border border-gray-800/40 p-3 rounded-xl text-xs">
                                                    <span className="text-amber-400 font-bold block mb-1">📋 Eligibility & Requirements:</span>
                                                    <p className="text-gray-300 leading-relaxed">{job.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        {user.role === 'student' && (
                                            <button onClick={() => handleTriggerApplicationModal(job)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition md:self-center shrink-0">Request Referral</button>
                                        )}
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
                            <input 
                                type="text" 
                                name="title" 
                                required 
                                placeholder="Job Title" 
                                value={referralForm.title} 
                                onChange={handleFormChange} 
                                className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition" 
                            />
                            <input 
                                type="text" 
                                name="company" 
                                required 
                                placeholder="Company" 
                                value={referralForm.company} 
                                onChange={handleFormChange} 
                                className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition" 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    name="location" 
                                    required 
                                    placeholder="Location" 
                                    value={referralForm.location} 
                                    onChange={handleFormChange} 
                                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition" 
                                />
                                <input 
                                    type="text" 
                                    name="experience" 
                                    required 
                                    placeholder="Experience Bracket" 
                                    value={referralForm.experience} 
                                    onChange={handleFormChange} 
                                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition" 
                                />
                            </div>
                            <div>
                                <textarea 
                                    name="eligibilityCriteria" 
                                    rows="3" 
                                    placeholder="Enter requirements or job description..." 
                                    value={referralForm.eligibilityCriteria} 
                                    onChange={handleFormChange} 
                                    className="w-full bg-slate-950 border border-gray-800 focus:border-purple-500 rounded-xl px-4 py-3 text-sm outline-none text-white resize-none transition" 
                                />
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg">
                                Broadcast Referral Listing
                            </button>
                        </form>
                    </div>
                )}

                {/* INBOUND REQUESTS MANAGEMENT CENTER */}
                {activeTab === 'requests' && (
                    <div>
                        <h2 className="text-2xl font-black text-purple-400 mb-6">Inbound Student Referral Requests</h2>
                        {referralRequests.length === 0 ? ( <div className="bg-slate-900/40 border border-gray-800 rounded-3xl p-8 text-center text-gray-500">📥 No candidate logs found inside MySQL server tables.</div> ) : (
                            <div className="space-y-4">
                                {referralRequests.map(req => (
                                    <div key={req.id} className="bg-slate-900/60 border border-gray-800 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-800/40 pb-4">
                                            <div>
                                                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Job Target Node Identifier: {req.job_id}</span>
                                                <h4 className="text-xl font-black text-white mt-2">{req.student_name}</h4>
                                                <p className="text-xs text-gray-400">Contact Email: {req.student_email}</p>
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

                                        {req.resume_url && (
                                            <div className="pt-1">
                                                <a href={req.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 text-xs font-black px-6 py-3 rounded-xl transition items-center gap-2 shadow-md cursor-pointer">
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

                {/* CHATS INTERFACE SYSTEM */}
                {activeTab === 'chats' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 bg-slate-900/40 border border-gray-800 rounded-3xl h-[600px] overflow-hidden backdrop-blur-sm">
                        <div className="border-r border-gray-800/80 bg-slate-950/40 p-4 overflow-y-auto flex flex-col gap-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Threads Log (MySQL Pool)</h3>
                            {realMentors.length === 0 ? (
                                <div className="text-xs text-gray-600 p-4 italic">No active users found.</div>
                            ) : (
                                realMentors.map(mentor => (
                                    <div key={mentor.email} onClick={() => setSelectedMentorEmail(mentor.email.toLowerCase())} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition ${selectedMentorEmail === mentor.email.toLowerCase() ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-900/60 border border-transparent'}`}>
                                        <div className="text-xl bg-slate-950 p-2 rounded-lg">💬</div>
                                        <div className="flex-1 overflow-hidden">
                                            <h5 className="text-sm font-bold truncate text-white">{mentor.name}</h5>
                                            <p className="text-xs text-gray-500 truncate">{mentor.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-900/10">
                            {selectedMentorEmail ? (
                                <>
                                    <div className="border-b border-gray-800/80 p-4 bg-slate-950/20">
                                        <h4 className="text-sm font-bold text-white">{selectedMentorEmail}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">SQL Thread Secure Channel Synced</p>
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
                                        {globalChats.map((msg, index) => (
                                            <div key={index} className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm flex flex-col ${msg.senderEmail === user.email.toLowerCase() ? 'bg-indigo-600 text-white self-end rounded-tr-none' : 'bg-slate-950 border border-gray-800 text-gray-200 self-start rounded-tl-none'}`}>
                                                <span className="text-[9px] text-gray-400 mb-0.5 font-bold">{msg.senderName} ({msg.senderRole})</span>
                                                <span>{msg.text}</span>
                                                <span className="text-[9px] mt-1 text-gray-500 self-end">{msg.time}</span>
                                            </div>
                                        ))}
                                        <div ref={chatBottomRef} />
                                    </div>
                                    <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-gray-800/80 p-4 bg-slate-950/20">
                                        <input type="text" placeholder="Type message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 bg-slate-950 border border-gray-800 focus:border-indigo-500 rounded-xl px-4 text-sm outline-none text-white transition" />
                                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">Send</button>
                                    </form>
                                </>
                            ) : ( <div className="flex flex-col items-center justify-center text-center h-full py-10 text-gray-500 text-sm">📥 Select an active connection channel to fetch data rows from DB.</div> )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;