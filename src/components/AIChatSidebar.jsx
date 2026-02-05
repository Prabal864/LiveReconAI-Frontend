import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, Sparkles, Shield, MessageSquare } from 'lucide-react';
import AnomalyDetection from './AnomalyDetection';
import "../styles/AIChatSidebar.css";

const AIChatSidebar = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'anomaly'
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([
        { 
            id: 'init', 
            role: 'ai', 
            content: { 
                answer: "Hello! I'm your AI financial assistant. Ask me anything about your transactions, spending habits, or account details." 
            } 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!prompt.trim()) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: prompt
        };

        setMessages(prev => [...prev, userMsg]);
        setPrompt("");
        setIsLoading(true);

        try {
            // Updated URL to match requirements
            const response = await axios.post('https://api.prabalsingh.dev/api/setu/auth/prompt', {
                prompt: userMsg.content
            });

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response.data
            };
            
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: {
                    answer: "Sorry, I encountered an error connecting to the AI service. Please try again later."
                }
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const renderAIContent = (content) => {
        if (typeof content === 'string') return content;
        
        return (
            <div className="ai-response-content">
                {/* Mode Badge if available */}
                {content.mode && (
                    <div className="response-meta-header">
                        <span className="analysis-chip">
                            <Sparkles size={10} /> {content.mode.replace('_', ' ')}
                        </span>
                        {content.matching_transactions_count > 0 && (
                            <span className="count-badge">
                                {content.matching_transactions_count} matches
                            </span>
                        )}
                    </div>
                )}

                {/* Main Answer */}
                <div className="response-text">
                    {content.answer}
                </div>

                {/* Statistics Block */}
                {content.statistics && (
                    <div className="stats-grid-mini">
                        {Object.entries(content.statistics).map(([key, val]) => (
                            <div key={key} className="stat-box">
                                <span className="stat-label">{key.replace(/_/g, ' ')}</span>
                                <span className="stat-val">{typeof val === 'number' && key.includes('amount') ? formatCurrency(val) : val}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Transactions Preview */}
                {content.transactions && content.transactions.length > 0 && (
                    <div className="transaction-mini-list">
                        <div style={{fontSize: '0.8rem', fontWeight: 600, marginTop: '8px', color: '#94a3b8'}}>Relevant Transactions</div>
                        {content.transactions.slice(0, 3).map((tx, idx) => (
                            <div key={idx} className="mini-tx-card">
                                <div className="mini-tx-info">
                                    <span style={{color:'#fff'}}>{tx.narration || tx.description || 'Transaction'}</span>
                                    <span style={{fontSize: '0.7rem', color: '#64748b'}}>{tx.date || tx.timestamp}</span>
                                </div>
                                <div className={`mini-tx-amount ${String(tx.amount).startsWith('-') || tx.type==='DEBIT' ? 'debit' : 'credit'}`}>
                                    {formatCurrency(tx.amount)}
                                </div>
                            </div>
                        ))}
                        {content.transactions.length > 3 && (
                            <div style={{textAlign:'center', fontSize: '0.75rem', color: '#64748b', cursor:'pointer'}}>
                                +{content.transactions.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={`ai-chat-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`ai-chat-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="ai-chat-header">
                    <div className="ai-chat-title">
                        <Bot size={24} color="#3b82f6" />
                        AI Assistant
                    </div>
                    <button className="ai-chat-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="sidebar-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare size={18} />
                        Chat
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'anomaly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('anomaly')}
                    >
                        <Shield size={18} />
                        Anomaly Detection
                    </button>
                </div>

                {/* Chat Tab Content */}
                {activeTab === 'chat' && (
                    <>
                        <div className="ai-chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-message ${msg.role}`}>
                            <div className="message-meta">
                                {msg.role === 'ai' ? 'AI Assistant' : 'You'}
                            </div>
                            <div className="message-bubble">
                                {msg.role === 'user' ? msg.content : renderAIContent(msg.content)}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-message ai">
                            <div className="message-meta">AI Assistant</div>
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
        </>
                )}

                {/* Anomaly Detection Tab Content */}
                {activeTab === 'anomaly' && (
                    <div className="anomaly-tab-content">
                        <AnomalyDetection />
                    </div>
                )}
            
                <div className="ai-chat-input-area">
                    <div className="input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Ask about your finances..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button 
                            className="send-btn" 
                            onClick={handleSend}
                            disabled={!prompt.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChatSidebar;
