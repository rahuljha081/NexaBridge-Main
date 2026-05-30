import React, { useState, useEffect, useRef } from 'react';

const Dashboard = ({ navigate }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    const [activeTab, setActiveTab] = useState('overview');
    const [jobsList, setJobsList] = useState([]);
    const [realMentors, setRealMentors] = useState([]);
    const [globalChats, setGlobalChats] = useState([]); 
    const [referralRequests, setReferralRequests] = useState([]);
    
    // Admin state telemetry metrics tracker
    const [adminStats, setAdminStats] = useState({ totalStudents: 0, totalAlumni: 0, globalVolume: 0 });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [showAppConfirmModal, setShowAppConfirmModal] = useState(false); 
    const [showReviewConfirmModal, setShowReviewConfirmModal] = useState(false); 
    
    const [selectedJobForModal, setSelectedJobForModal] = useState(null);
    const [pendingStatusChange, setPendingStatusChange] = useState({ id: null, status: '' });

    const [jobSearchQuery, setJobSearchQuery] = useState('');
    const [mentorSearchQuery, setMentorSearchQuery] = useState('');

    const chatContainerRef = useRef(null); 

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
        eligibilityCriteria: '',
        deadline: '' 
    });

    const [adminStudentsList, setAdminStudentsList] = useState([]);
    const [adminAlumniList, setAdminAlumniList] = useState([]);

    const getDeterministicChatKey = (email1, email2) => {
        return [email1.toLowerCase().trim(), email2.toLowerCase().trim()].sort().join('_');
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [globalChats, selectedMentorEmail]);

    // Isolated sidebar dynamic routing context reload
    const loadSidebarThreads = () => {
        if (!user || !user.email || user.role === 'admin') return;

        let endpointUrl = 'http://localhost:5000/api/mentors';
        if (activeTab === 'chats') {
            endpointUrl = user.role === 'student'
                ? `http://localhost:5000/api/mentors?email=${user.email.toLowerCase().trim()}`
                : `http://localhost:5000/api/mentors?fetchStudents=true&email=${user.email.toLowerCase().trim()}`;
        } else if (user.role === 'alumni') {
            endpointUrl = `http://localhost:5000/api/mentors?fetchStudents=true&email=${user.email.toLowerCase().trim()}`;
        }

        fetch(endpointUrl)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const currentEmail = user.email.toLowerCase().trim();
                    setRealMentors(data.filter(m => m.email.toLowerCase().trim() !== currentEmail));
                }
            })
            .catch(err => console.error("Sidebar load failure:", err));
    };

    useEffect(() => {
        if (!user || !user.email) return;

        fetch('http://localhost:5000/api/jobs')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setJobsList(data); })
            .catch(err => console.error("Jobs load failure:", err));

        // FIXED: Explicit structural endpoints sync check strictly optimized for Admin nodes
        if (user.role === 'admin') {
            // 1. Fetch telemetry stats
            fetch('http://localhost:5000/api/admin/stats')
                .then(res => res.json())
                .then(stats => {
                    if (stats) {
                        setAdminStats({
                            totalStudents: stats.students || 0,
                            totalAlumni: stats.alumni || 0,
                            globalVolume: stats.jobs || 0
                        });
                    }
                }).catch(err => console.error(err));

            // 2. Fetch full students database matrix mapping explicitly specifying unread-bypass context strings
            fetch('http://localhost:5000/api/mentors?fetchStudents=true&email=null')
                .then(res => res.json())
                .then(studentsData => { if (Array.isArray(studentsData)) setAdminStudentsList(studentsData); })
                .catch(err => console.error(err));

            // 3. Fetch full alumni database matrix mapping explicitly specifying unread-bypass context strings
            fetch('http://localhost:5000/api/mentors?fetchStudents=false&email=null')
                .then(res => res.json())
                .then(alumniData => { if (Array.isArray(alumniData)) setAdminAlumniList(alumniData); })
                .catch(err => console.error(err));
        } else {
            loadSidebarThreads();

            fetch(`http://localhost:5000/api/referrals?email=${user.email.toLowerCase()}&role=${user.role}`)
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setReferralRequests(data); })
                .catch(err => console.error("Referrals fetch failure:", err));
        }
    }, [activeTab, selectedMentorEmail]);

    useEffect(() => {
        if (!user || !selectedMentorEmail || user.role === 'admin') return;

        const syncChatMessages = () => {
            const chatKey = getDeterministicChatKey(user.email, selectedMentorEmail);
            
            fetch(`http://localhost:5000/api/messages/${chatKey}`)
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setGlobalChats(data); })
                .catch(err => console.error("Message Sync Error:", err));

            fetch('http://localhost:5000/api/messages/mark-read', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_key: chatKey, opponent_email: selectedMentorEmail })
            }).catch(err => console.error(err));
        };

        syncChatMessages();
        const chatInterval = setInterval(syncChatMessages, 3000); 
        const sidebarInterval = setInterval(loadSidebarThreads, 4000);

        return () => {
            clearInterval(chatInterval);
            clearInterval(sidebarInterval);
        };
    }, [selectedMentorEmail, user]);

    if (!token || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f7] text-slate-800 px-4">
                <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center max-w-sm shadow-xl">
                    <h2 className="text-3xl font-black text-red-500 mb-2">Access Denied</h2>
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

    const handleFormSubmitTrigger = (e) => {
        e.preventDefault();
        const compositeDescription = referralForm.eligibilityCriteria.trim() || 'No description specified';
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
                posted_by: fallbackPostedBy,
                deadline: referralForm.deadline || null
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setReferralForm({ title: '', company: '', location: '', experience: '', eligibilityCriteria: '', deadline: '' });
                alert("Success: Job Opportunity Broadcasted Successfully!");
                setActiveTab('overview');
            }
        });
    };

    const handleTriggerApplicationModal = (jobObj) => {
        const alreadyRequested = referralRequests.find(req => req.job_id === jobObj.id && req.student_email === user.email.toLowerCase());
        if (alreadyRequested) {
            alert("You have already submitted a referral request for this position.");
            return;
        }
        setSelectedJobForModal(jobObj);
        setShowApplicationModal(true);
    };

    const handleTriggerAppConfirm = (e) => {
        e.preventDefault();
        setShowAppConfirmModal(true);
    };

    const confirmApplicationAction = () => {
        let inputUrl = applicationForm.resumeUrl.trim();
        if (!/^file:\/\/\//i.test(inputUrl) && !/^https?:\/\//i.test(inputUrl)) {
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
                setShowAppConfirmModal(false);
                setShowApplicationModal(false);
                setActiveTab('overview');
            }
        });
    };

    const handleTriggerUpdateRequestStatus = (requestId, targetStatus) => {
        setPendingStatusChange({ id: requestId, status: targetStatus });
        setShowReviewConfirmModal(true);
    };

    const confirmStatusUpdateAction = () => {
        const { id, status } = pendingStatusChange;
        fetch(`http://localhost:5000/api/referrals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setReferralRequests(referralRequests.map(req => req.id === id ? { ...req, status: status } : req));
                setShowReviewConfirmModal(false);
            }
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedMentorEmail) return;

        const currentEmail = user.email.toLowerCase().trim();
        const targetEmail = selectedMentorEmail.toLowerCase().trim();
        const chatKey = getDeterministicChatKey(currentEmail, targetEmail);

        const msgPayload = {
            chat_key: chatKey,
            sender_email: currentEmail,
            sender_name: user.name || currentEmail,
            sender_role: user.role,
            message_text: typedMessage.trim(),
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
                setGlobalChats(prev => [...prev, {
                    senderEmail: msgPayload.sender_email,
                    senderName: msgPayload.sender_name,
                    senderRole: msgPayload.sender_role,
                    text: msgPayload.message_text,
                    time: msgPayload.timestamp
                }]);
                setTypedMessage('');
            }
        });
    };

    const filteredJobs = jobsList.filter(job => 
        job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobSearchQuery.toLowerCase())
    );

    const filteredMentors = realMentors.filter(mentor => 
        (mentor.name && mentor.name.toLowerCase().includes(mentorSearchQuery.toLowerCase())) ||
        (mentor.email && mentor.email.toLowerCase().includes(mentorSearchQuery.toLowerCase()))
    );

    return (
        <div className="w-full min-h-screen bg-[#f4f5f7] text-slate-800 pt-28 pb-12 text-left font-sans relative selection:bg-indigo-100">
            
            {/* APPLICATION MODAL */}
            {showApplicationModal && selectedJobForModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-lg shadow-2xl my-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2.5 py-1 rounded-md uppercase tracking-wider border border-blue-100">Referral Application</span>
                                <h3 className="text-2xl font-black mt-2 text-slate-900">{selectedJobForModal.title}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Target Entity: {selectedJobForModal.company} — Alumni: {selectedJobForModal.posted_by}</p>
                            </div>
                            <button onClick={() => setShowApplicationModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                        </div>
                        <form onSubmit={handleTriggerAppConfirm} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Full Name</label>
                                    <input type="text" name="candidateName" required value={applicationForm.candidateName} onChange={handleAppFormChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Email Address</label>
                                    <input type="email" name="candidateEmail" required readOnly value={applicationForm.candidateEmail} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-400 outline-none cursor-not-allowed" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Core Technical Skills Matrix</label>
                                <input type="text" name="skills" required placeholder="e.g., Java, React, Node.js, DSA" value={applicationForm.skills} onChange={handleAppFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Resume Drive Link</label>
                                <input type="text" name="resumeUrl" required placeholder="www.drive.google.com/your-resume" value={applicationForm.resumeUrl} onChange={handleAppFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none transition" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowApplicationModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg">Submit Full Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LOGOUT MODAL */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
                        <div className="text-4xl mb-4">🚪</div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Logout</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">Are you sure you want to terminate your current session?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition">Cancel</button>
                            <button onClick={confirmLogoutAction} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg">Yes, Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM APP MODAL */}
            {showAppConfirmModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Application</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">All data are entered right confirm?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowAppConfirmModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition">Cancel</button>
                            <button onClick={confirmApplicationAction} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* REVIEW CONFIRM MODAL */}
            {showReviewConfirmModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
                        <div className="text-4xl mb-4">⚖️</div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Update Request Status</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">You have read the resume confirm?</p>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowReviewConfirmModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs transition">Cancel</button>
                            <button onClick={confirmStatusUpdateAction} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs transition shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6">
                {/* Navbar Layout */}
                <div className="w-full flex items-center justify-between border-b border-slate-200 pb-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, <span className="text-indigo-600">{user.name || user.email}</span>!</h1>
                        <p className="text-slate-500 mt-2 text-xs font-semibold tracking-wider uppercase">Identity Domain Node: <span className={`${user.role === 'admin' ? 'text-red-500 font-black bg-red-50 border border-red-100 px-2 py-0.5 rounded' : 'text-purple-600 font-bold'}`}>{user.role}</span></p>
                    </div>
                    <div className="flex gap-4">
                        {activeTab !== 'overview' && (
                            <button onClick={() => { setActiveTab('overview'); setSelectedMentorEmail(null); setJobSearchQuery(''); setMentorSearchQuery(''); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition">← Back to Panel</button>
                        )}
                        <button onClick={() => setShowLogoutModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition">Logout</button>
                    </div>
                </div>

                {/* --- 1. OVERVIEW ENGINE WORKSPACE --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {user.role === 'student' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div onClick={() => setActiveTab('mentors')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-indigo-50 border border-indigo-100 w-12 h-12 flex items-center justify-center rounded-2xl text-indigo-600">🔍</div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-900">Find Mentors</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">Connect with real Alumni experts registered inside the system.</p>
                                    </div>
                                    <div onClick={() => setActiveTab('jobs')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-indigo-50 border border-indigo-100 w-12 h-12 flex items-center justify-center rounded-2xl text-indigo-600">💼</div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-900">Job Board</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">See vacancies shared by alumni experts.</p>
                                    </div>
                                    <div onClick={() => setActiveTab('chats')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                        <div className="text-3xl mb-4 bg-indigo-50 border border-indigo-100 w-12 h-12 flex items-center justify-center rounded-2xl text-indigo-600">💬</div>
                                        <h3 className="text-lg font-bold mb-2 text-slate-900">My Chats</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">Open secure rooms to message alumni lines.</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Application Status Tracker</h4>
                                    {referralRequests.length === 0 ? (
                                        <p className="text-xs text-slate-400 font-medium">You have not transmitted any job referral logs yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {referralRequests.map(req => (
                                                <div key={req.id} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="text-slate-900 font-bold text-sm block">Position Record (ID: {req.job_id})</span>
                                                        <span className="text-slate-500 mt-1 block">Target Entity: {req.company}</span>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-lg font-bold ${req.status === 'Approved & Referred' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : req.status === 'Declined' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>{req.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {user.role === 'alumni' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div onClick={() => setActiveTab('post-referral')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-50 border border-purple-100 w-12 h-12 flex items-center justify-center rounded-2xl text-purple-600">📢</div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-900">Post a Referral</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Share ongoing job openings inside your current company.</p>
                                </div>
                                <div onClick={() => setActiveTab('requests')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-50 border border-purple-100 w-12 h-12 flex items-center justify-center rounded-2xl text-purple-600">📥</div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-900">Inbound Requests</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">View inbound requests matching your listings.</p>
                                </div>
                                <div onClick={() => setActiveTab('chats')} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                    <div className="text-3xl mb-4 bg-purple-50 border border-purple-100 w-12 h-12 flex items-center justify-center rounded-2xl text-purple-600">💬</div>
                                    <h3 className="text-lg font-bold mb-2 text-slate-900">Student Chat Logs</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">Review incoming direct queries from student pool threads.</p>
                                </div>
                            </div>
                        )}

                        {/* --- EXPLICIT ADMIN INTERFACE DATA RENDERS --- */}
                        {user.role === 'admin' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Registered Students</span>
                                            <div className="text-3xl font-black text-slate-900 mt-1">{adminStats.totalStudents}</div>
                                        </div>
                                        <div className="text-3xl bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100/50">🎓</div>
                                    </div>
                                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Verified Alumni Nodes</span>
                                            <div className="text-3xl font-black text-slate-900 mt-1">{adminStats.totalAlumni}</div>
                                        </div>
                                        <div className="text-3xl bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100/50">🏢</div>
                                    </div>
                                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Global System Volume</span>
                                            <div className="text-3xl font-black text-slate-900 mt-1">{adminStats.globalVolume}</div>
                                        </div>
                                        <div className="text-3xl bg-purple-50 text-purple-600 p-3 rounded-xl border border-purple-100/50">⚡</div>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="text-base font-bold text-slate-900">Student System Directory</h3>
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">Active Records</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="px-6 py-3">Display Name</th>
                                                    <th className="px-6 py-3">Email Address</th>
                                                    <th className="px-6 py-3">System Role Permission</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminStudentsList.length === 0 ? (
                                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-400 italic">No student tracking nodes synced.</td></tr>
                                                ) : (
                                                    adminStudentsList.map((stu, i) => (
                                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition text-slate-600">
                                                            <td className="px-6 py-3.5 font-bold text-slate-900">{stu.name || 'Anonymous Node'}</td>
                                                            <td className="px-6 py-3.5 font-mono">{stu.email}</td>
                                                            <td className="px-6 py-3.5"><span className="bg-blue-50 text-blue-600 font-bold border border-blue-100 px-2 py-0.5 rounded text-[10px] uppercase">Student</span></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h3 className="text-base font-bold text-slate-900">Alumni Verified Corporate Matrix</h3>
                                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">Network Active</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
                                                    <th className="px-6 py-3">Alumni Expert Name</th>
                                                    <th className="px-6 py-3">Secure Corporate Endpoint</th>
                                                    <th className="px-6 py-3">Access Credential Token</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminAlumniList.length === 0 ? (
                                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-slate-400 italic">No alumni profiles logged.</td></tr>
                                                ) : (
                                                    adminAlumniList.map((alu, i) => (
                                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition text-slate-600">
                                                            <td className="px-6 py-3.5 font-bold text-slate-900">{alu.name || 'Alumni Member'}</td>
                                                            <td className="px-6 py-3.5 font-mono">{alu.email}</td>
                                                            <td className="px-6 py-3.5"><span className="bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase">Verified Alumni</span></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 2. SUB-PANEL COMPONENT RENDERS --- */}
                {activeTab === 'mentors' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-black text-indigo-600">Verified Connections Logs</h2>
                            <input type="text" placeholder="🔍 Search profiles..." value={mentorSearchQuery} onChange={(e) => setMentorSearchQuery(e.target.value)} className="bg-white border border-slate-200 focus:border-indigo-500 px-4 py-2 rounded-xl text-xs outline-none text-slate-800 w-full md:w-64 shadow-sm transition" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredMentors.map(mentor => (
                                <div key={mentor.email} className="bg-white border border-slate-200/80 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
                                    <div className="text-4xl bg-slate-50 border border-slate-100 p-3 rounded-2xl text-slate-700">👨‍💻</div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-slate-900">{mentor.name}</h4>
                                        <p className="text-sm font-semibold text-indigo-600">{mentor.role === 'alumni' ? 'Verified Alumni Expert' : 'Student Node'}</p>
                                        <p className="text-xs text-slate-400 mt-1">{mentor.email}</p>
                                        <button onClick={() => { setSelectedMentorEmail(mentor.email.toLowerCase().trim()); setActiveTab('chats'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 mt-4 rounded-xl shadow-md transition">Connect & Chat</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* JOB BOARD VIEW WITH EXPIRY NOTIFICATION */}
                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-black text-indigo-600">Active Internal Referrals</h2>
                            <input type="text" placeholder="🔍 Search jobs..." value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} className="bg-white border border-slate-200 focus:border-indigo-500 px-4 py-2 rounded-xl text-xs outline-none text-slate-800 w-full md:w-72 shadow-sm transition" />
                        </div>
                        <div className="space-y-4">
                            {filteredJobs.map(job => (
                                <div key={job.id} className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-slate-900">{job.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{job.company} — <span className="text-xs text-slate-400">{job.location}</span></p>
                                        <p className="text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full inline-block mt-2 font-medium">Exp: {job.experience} — By: {job.posted_by}</p>
                                        {job.deadline && (
                                            <p className="text-[11px] text-red-500 font-bold mt-2 bg-red-50 border border-red-100 rounded px-2 py-0.5 inline-block">⏱️ Register Before: {new Date(job.deadline).toLocaleString()}</p>
                                        )}
                                    </div>
                                    {user.role === 'student' && (
                                        <button onClick={() => handleTriggerApplicationModal(job)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition md:self-center shrink-0">Request Referral</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* POST A REFERRAL */}
                {activeTab === 'post-referral' && (
                    <div className="w-full max-w-xl bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                        <h2 className="text-2xl font-black text-purple-600 mb-6">Post Opportunity Listing</h2>
                        <form onSubmit={handleFormSubmitTrigger} className="space-y-5">
                            <input type="text" name="title" required placeholder="Job Title" value={referralForm.title} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-800 transition" />
                            <input type="text" name="company" required placeholder="Company" value={referralForm.company} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-800 transition" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" name="location" required placeholder="Location" value={referralForm.location} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-800 transition" />
                                <input type="text" name="experience" required placeholder="Experience Bracket" value={referralForm.experience} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-800 transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-purple-500 uppercase mb-1.5 tracking-wider">Registration Expiry Deadline Time</label>
                                <input type="datetime-local" name="deadline" value={referralForm.deadline} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-500 transition" />
                            </div>
                            <textarea name="eligibilityCriteria" rows="3" placeholder="Enter requirements..." value={referralForm.eligibilityCriteria} onChange={handleFormChange} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none text-slate-800 resize-none transition" />
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition">Broadcast Referral Listing</button>
                        </form>
                    </div>
                )}

                {/* INBOUND REQUESTS */}
                {activeTab === 'requests' && (
                    <div>
                        <h2 className="text-2xl font-black text-purple-400 mb-6">Inbound Student Referral Requests</h2>
                        <div className="space-y-4">
                            {referralRequests.map(req => (
                                <div key={req.id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col gap-4 text-left shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900">{req.student_name}</h4>
                                            <p className="text-xs text-slate-500 font-medium">Contact Email: {req.student_email}</p>
                                            <p className="text-[11px] mt-2 font-bold text-slate-600">Current Status: <span className={`${req.status === 'Approved & Referred' ? 'text-emerald-600' : req.status === 'Declined' ? 'text-red-600' : 'text-amber-400'}`}>{req.status}</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            {req.status === 'Pending Review' ? (
                                                <>
                                                    <button onClick={() => handleTriggerUpdateRequestStatus(req.id, 'Declined')} className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-xl transition">Decline Candidate</button>
                                                    <button onClick={() => handleTriggerUpdateRequestStatus(req.id, 'Approved & Referred')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition">Accept & Refer</button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-xl italic bg-slate-50">Logged Action Saved</span>
                                            )}
                                        </div>
                                    </div>
                                    {req.resume_url && (
                                        <div className="pt-1">
                                            <a href={req.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition items-center gap-2 cursor-pointer">📄 Open Resume Document →</a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CHATS INTERFACE SYSTEM WITH UNREAD DOT SYMBOL */}
                {activeTab === 'chats' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 bg-white border border-slate-200 rounded-3xl h-[600px] overflow-hidden shadow-sm">
                        <div className="border-r border-slate-200 bg-slate-50/50 p-4 overflow-y-auto flex flex-col gap-2 relative">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">{user.role === 'student' ? 'Threads Log (Alumni)' : 'Incoming Student Logs'}</h3>
                            {filteredMentors.map(mentor => {
                                const isSelected = selectedMentorEmail === mentor.email.toLowerCase().trim();
                                return (
                                    <div key={mentor.email} onClick={() => setSelectedMentorEmail(mentor.email.toLowerCase().trim())} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition relative ${isSelected ? 'bg-indigo-50 border border-indigo-100 text-slate-900' : 'hover:bg-slate-100 border border-transparent text-slate-600'}`}>
                                        <div className="flex-1 overflow-hidden text-left flex items-center justify-between">
                                            <div className="truncate">
                                                <h5 className="text-sm font-bold truncate">{mentor.name || 'Connection Member'}</h5>
                                                <p className="text-xs text-slate-400 truncate font-medium">{mentor.email}</p>
                                            </div>
                                            {mentor.hasUnread === 1 && !isSelected && (
                                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full min-w-[10px] min-h-[10px] animate-pulse shadow-sm shadow-red-400 mr-2"></span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#fcfdfe]">
                            {selectedMentorEmail ? (
                                <>
                                    <div className="border-b border-slate-200 p-4 bg-white shadow-sm flex flex-col text-left">
                                        <h4 className="text-sm font-bold text-slate-900">{selectedMentorEmail}</h4>
                                    </div>
                                    <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col custom-scrollbar">
                                        {globalChats.map((msg, index) => {
                                            const senderEmailStr = msg.senderEmail || msg.sender_email || '';
                                            const isMe = senderEmailStr.toLowerCase().trim() === user.email.toLowerCase().trim();
                                            return (
                                                <div key={index} className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm flex flex-col shadow-sm border ${isMe ? 'bg-indigo-600 border-indigo-500 text-white self-end rounded-tr-none' : 'bg-slate-100 border-slate-200/80 text-slate-800 self-start rounded-tl-none'}`}>
                                                    <span className="text-left leading-relaxed break-words">{msg.text || msg.message_text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-slate-200 p-4 bg-white">
                                        <input type="text" placeholder="Type message..." value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 text-sm outline-none transition" />
                                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition">Send</button>
                                    </form>
                                </>
                            ) : ( 
                                <div className="flex flex-col items-center justify-center text-center h-full py-10 text-slate-400 text-sm">📥 Select an active connection channel.</div> 
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;