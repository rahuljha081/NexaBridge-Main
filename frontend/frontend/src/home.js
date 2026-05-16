import React from 'react';

const Home = ({ navigate }) => {
    const portals = [
        { title: "Student Portal", role: "student", icon: "🎓", desc: "Find mentors and job opportunities." },
        { title: "Alumni Portal", role: "alumni", icon: "🏢", desc: "Network with peers and guide juniors." },
        { title: "Admin Portal", role: "admin", icon: "🔐", desc: "Control and manage the NexaBridge system." }
    ];

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <h2 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Bridging the Gap Between <br /> Students & Alumni
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg mb-12">
                NexaBridge is a professional ecosystem designed to foster mentorship, networking, and career growth for the next generation of leaders.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                {portals.map((portal, idx) => (
                    <div 
                        key={idx}
                        onClick={() => navigate(`/login?role=${portal.role}`)}
                        className="bg-slate-800/40 p-8 rounded-3xl border border-gray-700 hover:border-purple-500 cursor-pointer transition-all hover:scale-105 group"
                    >
                        <div className="text-4xl mb-4">{portal.icon}</div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition">{portal.title}</h3>
                        <p className="text-gray-400 text-sm">{portal.desc}</p>
                        <div className="mt-6 text-purple-500 font-bold text-sm underline underline-offset-4">Enter Portal →</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;