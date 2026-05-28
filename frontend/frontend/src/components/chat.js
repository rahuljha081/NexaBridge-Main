import React, { useState, useEffect } from 'react';

const Chat = ({ currentActiveUser, selectedOppositeUser }) => {
    const [messages, setMessages] = useState([]);
    const [typedMessage, setTypedMessage] = useState('');

    // CRITICAL FIX: Chat key humesha alphabetically sort honi chahiye 
    // taaki Student aur Alumni dono ke liye EXACT SAME KEY bane!
    const generateChatKey = (user1, user2) => {
        return [user1.toLowerCase().trim(), user2.toLowerCase().trim()].sort().join('_');
    };

    const chatKey = generateChatKey(currentActiveUser.email, selectedOppositeUser.email);

    // 1. Fetch Messages Framework
    const fetchChatThreads = () => {
        fetch(`http://localhost:5000/api/messages/${chatKey}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            })
            .catch(err => console.error("Chat sync error:", err));
    };

    useEffect(() => {
        fetchChatThreads();
        // Polling setup: Har 3 second me automatically naye messages fetch honge
        const interval = setInterval(fetchChatThreads, 3000);
        return () => clearInterval(interval);
    }, [chatKey]);

    // 2. Send Message Framework
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!typedMessage.trim()) return;

        const payload = {
            chat_key: chatKey,
            sender_email: currentActiveUser.email,
            sender_name: currentActiveUser.name || currentActiveUser.username,
            sender_role: currentActiveUser.role,
            message_text: typedMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        fetch('http://localhost:5000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setTypedMessage('');
                fetchChatThreads(); // Instant update
            }
        })
        .catch(err => console.error("Message delivery failed:", err));
    };

    return (
        <div className="w-full bg-slate-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-[500px]">
            {/* Chat Header */}
            <div className="border-b border-gray-800 pb-4 mb-4">
                <h3 className="font-bold text-white text-sm">{selectedOppositeUser.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-black">{selectedOppositeUser.role}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((msg, idx) => {
                    const isMe = msg.senderEmail === currentActiveUser.email;
                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-950 text-gray-200 rounded-tl-none border border-gray-800'}`}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] text-gray-600 mt-1 px-1">{msg.time}</span>
                        </div>
                    );
                })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Type your message securely..." 
                    value={typedMessage} 
                    onChange={(e) => setTypedMessage(e.target.value)} 
                    className="flex-1 bg-slate-950 border border-gray-800 focus:border-blue-500 rounded-xl px-4 py-3 text-xs text-white outline-none transition"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-xl text-xs transition">
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;