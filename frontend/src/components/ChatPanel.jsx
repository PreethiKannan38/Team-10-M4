import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

const ChatPanel = ({ engine, currentUser, isOpen, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!engine || !engine.yChat) return;

        const handleChatUpdate = () => {
            setMessages(engine.yChat.toArray());
        };

        // Initial fetch
        handleChatUpdate();

        // Listen for new messages
        engine.yChat.observe(handleChatUpdate);

        return () => {
            engine.yChat.unobserve(handleChatUpdate);
        };
    }, [engine]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !engine) return;

        engine.addChatMessage(inputValue, currentUser);
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-24 right-6 w-80 h-[500px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden z-[60] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-[0_4px_10px_rgba(79,70,229,0.3)]">
                        <MessageSquare size={16} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Room Chat</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{messages.length} messages</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                    <X size={16} strokeWidth={3} />
                </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <MessageSquare size={32} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.author === (currentUser?.name || 'Anonymous');
                        return (
                            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 animate-in fade-in slide-in-from-bottom-2`}>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">
                                    {isMe ? 'You' : msg.author} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed shadow-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-100 text-white rounded-lg flex items-center justify-center transition-all active:scale-95"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatPanel;
