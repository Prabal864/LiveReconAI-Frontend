import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, ChevronDown, ChevronUp, Database, CheckCircle2, Loader2, ChevronRight, Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import MarkdownRenderer from '../utils/MarkdownRenderer';
import { setuService } from '../services/setuService';
import Toast from './Toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import "../styles/AIChatPage.css";

const AIResponseDisplay = ({ content, originalPrompt }) => {
    const [displayContent, setDisplayContent] = useState(content);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [isLongContent, setIsLongContent] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Check if content is long enough to need truncation
    useEffect(() => {
        if (contentRef.current && contentRef.current.scrollHeight > 1200) {
            setIsLongContent(true);
        }
    }, [displayContent]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handlePageChange = async (originalPromptText, pageNum) => {
        if (isPageLoading) return;
        setIsPageLoading(true);
        
        try {
            const response = await axios.post('http://localhost:9000/prompt', {
                prompt: originalPromptText,
                page: pageNum
            });
            setDisplayContent(response.data);
        } catch (error) {
            console.error("AI Pagination Error:", error);
            // Could add a local error state here if needed
        } finally {
            setIsPageLoading(false);
        }
    };

    const fetchAllTransactions = async () => {
        if (!displayContent.pagination || displayContent.pagination.total_pages <= 1) {
            return displayContent.transactions || [];
        }

        setIsExporting(true);
        let allPayload = [];
        try {
            const pages = displayContent.pagination.total_pages;
            const promises = [];
            for (let i = 1; i <= pages; i++) {
                promises.push(axios.post('http://localhost:9000/prompt', {
                    prompt: originalPrompt,
                    page: i
                }));
            }
            
            const responses = await Promise.all(promises);
            responses.forEach(res => {
                if (res.data && res.data.transactions) {
                    allPayload = [...allPayload, ...res.data.transactions];
                }
            });
            // Ensure unique transactions if necessary, but backend pages should be distinct
        } catch (error) {
            console.error("Export Fetch Error", error);
            // Fallback to current page
            allPayload = displayContent.transactions || [];
        } finally {
            setIsExporting(false);
        }
        return allPayload;
    };

    const exportToCSV = async () => {
        const txs = await fetchAllTransactions();
        if (!txs || txs.length === 0) return;
        
        const headers = ["Date", "Description", "Type", "Category", "Amount", "Mode", "Reference"];
        const rows = txs.map(tx => [
            tx.date || tx.timestamp || '',
            `"${(tx.narration || tx.description || '').replace(/"/g, '""')}"`, // Escape quotes
            tx.type || '',
            tx.category || tx.mode || '',
            tx.amount || '',
            tx.mode || '',
            tx.reference || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'transactions_full_report.csv');
    };

    const exportToExcel = async () => {
        const txs = await fetchAllTransactions();
        if (!txs || txs.length === 0) return;
        
        const worksheet = XLSX.utils.json_to_sheet(txs.map(tx => ({
            Date: tx.date || tx.timestamp,
            Description: tx.narration || tx.description,
            Type: tx.type,
            Category: tx.category || tx.mode,
            Amount: tx.amount,
            Mode: tx.mode,
            Reference: tx.reference
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, "transactions_full_report.xlsx");
    };

    const exportToPDF = async () => {
        const txs = await fetchAllTransactions();
        if (!txs || txs.length === 0) return;
        
        const doc = new jsPDF();
        doc.text("Transaction Report (Full Data)", 14, 15);
        
        const tableColumn = ["Date", "Description", "Type", "Category", "Amount"];
        const tableRows = txs.map(tx => [
            tx.date || tx.timestamp || '-',
            tx.narration || tx.description || '-',
            tx.type || '-',
            tx.category || tx.mode || '-',
            formatCurrency(tx.amount)
        ]);
        
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] }
        });
        
        doc.save("transactions_full_report.pdf");
    };

    if (!displayContent) return null;
    
    const renderContent = () => {
        if (typeof displayContent === 'string') return <MarkdownRenderer content={displayContent} />;
        
        return (
            <div className="ai-response-content-full">
                 {/* Meta Header */}
                 {displayContent.mode && (
                    <div style={{marginBottom: '1rem', display:'flex', gap:'10px', alignItems:'center'}}>
                        <span className="analysis-chip" style={{fontSize: '0.8rem'}}>
                            <Sparkles size={12} /> {displayContent.mode.replace(/_/g, ' ')}
                        </span>
                        {displayContent.matching_transactions_count > 0 && (
                            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                Found {displayContent.matching_transactions_count} matches
                            </span>
                        )}
                    </div>
                )}

                {/* Main Text Answer with Markdown */}
                <div className="response-markdown-wrapper">
                    <MarkdownRenderer content={displayContent.answer} />
                </div>

                {/* Statistics Grid */}
                {displayContent.statistics && Object.keys(displayContent.statistics).length > 0 && (
                    <div className="stats-grid-large">
                        {Object.entries(displayContent.statistics).map(([key, val]) => (
                            <div key={key} className="stat-card-large">
                                <span className="stat-label" style={{textTransform:'uppercase', fontSize:'0.7rem', color:'var(--text-secondary)', display:'block', marginBottom:'4px'}}>
                                    {key.replace(/_/g, ' ')}
                                </span>
                                <span className="stat-value" style={{fontSize:'1.2rem', fontWeight:600, color:'var(--text-primary)'}}>
                                    {typeof val === 'number' && key.toLowerCase().includes('amount') ? formatCurrency(val) : val}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Detailed Transactions Table */}
                {displayContent.transactions && displayContent.transactions.length > 0 && (
                    <div className="tx-table-container" style={{ position: 'relative' }}>
                        {isPageLoading && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(255,255,255,0.7)',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(2px)',
                                borderRadius: '8px'
                            }}>
                                <Loader2 size={32} className="icon-spin" style={{ color: 'var(--primary-color)' }} />
                            </div>
                        )}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem'}}>
                            <h4 style={{margin: 0, color:'var(--text-primary)'}}>Transaction Details</h4>
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button onClick={exportToPDF} className="ai-toolbar-btn" disabled={isExporting} style={{padding: '6px', minWidth: 'auto', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1}} title="Export PDF">
                                    {isExporting ? <Loader2 size={16} className="icon-spin" /> : <FileText size={16} />}
                                </button>
                                <button onClick={exportToExcel} className="ai-toolbar-btn" disabled={isExporting} style={{padding: '6px', minWidth: 'auto', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1}} title="Export Excel">
                                    {isExporting ? <Loader2 size={16} className="icon-spin" /> : <FileSpreadsheet size={16} />}
                                </button>
                                <button onClick={exportToCSV} className="ai-toolbar-btn" disabled={isExporting} style={{padding: '6px', minWidth: 'auto', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.7 : 1}} title="Export CSV">
                                    {isExporting ? <Loader2 size={16} className="icon-spin" /> : <Table size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="tx-full-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayContent.transactions.map((tx, idx) => (
                                        <tr key={idx}>
                                            <td>{tx.date || tx.timestamp || '-'}</td>
                                            <td>{tx.narration || tx.description}</td>
                                            <td>
                                                <span className={`status-badge ${tx.type === 'DEBIT' ? 'pending' : 'success'}`} style={{padding:'2px 8px', fontSize:'0.75rem'}}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td>{tx.category || tx.mode || '-'}</td>
                                            <td style={{
                                                fontWeight:600, 
                                                color: (String(tx.amount).startsWith('-') || tx.type==='DEBIT') ? '#ef4444' : '#22c55e'
                                            }}>
                                                {formatCurrency(tx.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {displayContent.pagination && (
                    <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border-color, #e5e7eb)'
                    }}>
                        <button 
                            className="ai-toolbar-btn"
                            disabled={!displayContent.pagination.has_prev || isPageLoading}
                            onClick={() => handlePageChange(originalPrompt, displayContent.pagination.page - 1)}
                            style={{
                                opacity: (!displayContent.pagination.has_prev || isPageLoading) ? 0.5 : 1, 
                                cursor: (!displayContent.pagination.has_prev || isPageLoading) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <ChevronRight size={16} style={{transform: 'rotate(180deg)'}} /> Previous
                        </button>
                        <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                            Page {displayContent.pagination.page} of {displayContent.pagination.total_pages}
                        </span>
                        <button 
                            className="ai-toolbar-btn"
                            disabled={!displayContent.pagination.has_next || isPageLoading}
                            onClick={() => handlePageChange(originalPrompt, displayContent.pagination.page + 1)}
                            style={{
                                opacity: (!displayContent.pagination.has_next || isPageLoading) ? 0.5 : 1, 
                                cursor: (!displayContent.pagination.has_next || isPageLoading) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {isPageLoading ? <Loader2 size={16} className="icon-spin" /> : <>Next <ChevronRight size={16} /></>}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="ai-response-wrapper">
            <div 
                ref={contentRef}
                className={`content-wrapper ${!isExpanded && isLongContent ? 'truncated' : ''}`}
            >
                {renderContent()}
            </div>
            {isLongContent && (
                <button 
                    className="show-more-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={14} /></>
                    ) : (
                        <>Show Full Analysis <ChevronDown size={14} /></>
                    )}
                </button>
            )}
        </div>
    );
};

const AIChatPage = ({ activeConsents = [] }) => {
    const [prompt, setPrompt] = useState("");
    const [selectedConsentForIngest, setSelectedConsentForIngest] = useState("");
    const [messages, setMessages] = useState([
        { 
            id: 'init', 
            role: 'ai', 
            content: { 
                answer: "Hello! I'm your AI financial assistant. \n\nI can help you analyze your transactions, detect anomalies, or answer questions about your spending.\n\nType a question below to get started." 
            } 
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [thoughtSteps, setThoughtSteps] = useState([]); // Array of steps for "Thinking" preview
    const [toast, setToast] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ingest Handler
    const handleIngest = async () => {
        if(!selectedConsentForIngest) return;
        
        const consentId = selectedConsentForIngest;
        // Find readable name or truncate ID
        const consentObj = activeConsents.find(c => c.id === consentId);
        const consentLabel = consentObj ? (consentObj.id.slice(0,8) + '...') : consentId.slice(0,8);
        
        // Show Trigger Toast
        setToast({
            title: "Ingestion Started",
            message: `Triggering ingestion for consent ${consentLabel}. This may take up to 2 minutes...`,
            type: 'loading', // Use loading to show spinner
            duration: 4000
        });
        
        setIsLoading(true);
        
        // Initial thought sequence
        setThoughtSteps([
            { text: "Used 1 reference", status: "header" },
            { text: "Initializing ingestion pipeline...", status: "active" }
        ]);

        try {
            // Simulate steps for "Thinking" preview
            setTimeout(() => setThoughtSteps([
                 { text: "Used 1 reference", status: "header" },
                 { text: "Initializing ingestion pipeline...", status: "done" },
                 { text: "Connecting to SETU backend...", status: "active" }
            ]), 1000);

            setTimeout(() => setThoughtSteps([
                 { text: "Used 1 reference", status: "header" },
                 { text: "Initializing ingestion pipeline...", status: "done" },
                 { text: "Connecting to SETU backend...", status: "done" },
                 { text: "Fetching transaction data from consent...", status: "active" }
            ]), 3000);

            setTimeout(() => setThoughtSteps([
                 { text: "Used 1 reference", status: "header" },
                 { text: "Initializing ingestion pipeline...", status: "done" },
                 { text: "Connecting to SETU backend...", status: "done" },
                 { text: "Fetching transaction data from consent...", status: "done" },
                 { text: "Processing and vectorizing transactions...", status: "active" }
            ]), 10000);

            setTimeout(() => setThoughtSteps([
                 { text: "Used 1 reference", status: "header" },
                 { text: "Initializing ingestion pipeline...", status: "done" },
                 { text: "Connecting to SETU backend...", status: "done" },
                 { text: "Fetching transaction data from consent...", status: "done" },
                 { text: "Processing and vectorizing transactions...", status: "done" },
                 { text: "Storing in RAG vector database...", status: "active" }
            ]), 30000);

            const result = await setuService.ingestData(consentId);
            
            setToast({
                title: "Ingestion Successful",
                message: `${result.transactions_ingested || 'All'} transactions processed successfully.`,
                type: 'success',
                duration: 5000
            });

        } catch (error) {
            const errorMessage = error.message || "Unknown error occurred";
            setToast({
                title: "Ingestion Failed",
                message: errorMessage,
                type: 'error',
                duration: 6000
            });
        } finally {
            setIsLoading(false);
            setThoughtSteps([]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, thoughtSteps]); // Scroll when thought process updates too

    useEffect(() => {
        // Auto-focus input on mount
        inputRef.current?.focus();
    }, []);

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
        
        // Initial thoughts
        setThoughtSteps([
            { text: "Used 1 reference", status: "header" },
            { text: "Analyzing query intent...", status: "active" }
        ]);

        try {
            // Simulation for better UX
            setTimeout(() => setThoughtSteps([
                { text: "Used 1 reference", status: "header" },
                { text: "Analyzing query intent...", status: "done" },
                { text: "Scanning transaction history...", status: "active" }
            ]), 1200);
            
            setTimeout(() => setThoughtSteps([
                { text: "Used 1 reference", status: "header" },
                { text: "Analyzing query intent...", status: "done" },
                { text: "Scanning transaction history...", status: "done" },
                { text: "Generating financial insights...", status: "active" }
            ]), 2800);

            const response = await axios.post('http://localhost:9000/prompt', {
                prompt: userMsg.content
            });

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: response.data,
                originalPrompt: userMsg.content,
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
            setThoughtSteps([]);
        }
    };



    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-chat-page">
            <div className="ai-chat-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`ai-message-row ${msg.role}`}>
                        <div className="ai-message-content-wrapper">
                            {msg.role === 'ai' && (
                                <div className="ai-avatar"><Bot size={20} color="#fff" /></div>
                            )}
                            <div className="message-content-box">
                                {msg.role === 'user' ? (
                                    <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>
                                ) : (
                                    <AIResponseDisplay 
                                        content={msg.content} 
                                        originalPrompt={msg.originalPrompt}
                                    />
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="user-avatar"><User size={20} /></div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="ai-message-row ai">
                        <div className="ai-message-content-wrapper">
                            <div className="ai-avatar"><Bot size={20} color="#fff" /></div>
                            <div className="message-content-box">
                                <div className="thinking-console">
                                    {thoughtSteps.map((step, idx) => (
                                        <div key={idx} className={`thought-step-row ${step.status}`}>
                                            {step.status === 'header' ? (
                                                <div className="thought-header">
                                                    <ChevronRight size={14} /> <span>{step.text}</span>
                                                </div>
                                            ) : (
                                                <div className="thought-content">
                                                    {step.status === 'done' ? (
                                                        <CheckCircle2 size={14} className="icon-success" />
                                                    ) : (
                                                        <Loader2 size={14} className="icon-spin" />
                                                    )}
                                                    <span className="step-text">{step.text}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {thoughtSteps.length === 0 && (
                                         <div className="thinking-placeholder">
                                            <Loader2 size={14} className="icon-spin" /> Thinking...
                                         </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="ai-input-container">
                <div className="ai-input-toolbar">
                    <div className="custom-select-container" ref={dropdownRef}>
                        <button 
                            type="button"
                            className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {selectedConsentForIngest ? (
                                <span className="selected-value">
                                    <Database size={14} />
                                    Consent {selectedConsentForIngest.slice(0, 8)}...
                                </span>
                            ) : (
                                <span className="placeholder-text">Select Active Consent</span>
                            )}
                            <ChevronUp size={16} className={`arrow-icon ${isDropdownOpen ? 'rotate' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="custom-options-list">
                                {activeConsents.map(c => (
                                    <div 
                                        key={c.id} 
                                        className={`custom-option ${selectedConsentForIngest === c.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedConsentForIngest(c.id);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <div className="option-icon-wrapper">
                                            <Database size={14} />
                                        </div>
                                        <div className="option-content">
                                            <span className="option-id">Consent {c.id.slice(0, 8)}...</span>
                                            <span className="option-status">Active</span>
                                        </div>
                                        {selectedConsentForIngest === c.id && <CheckCircle2 size={14} className="check-icon" />}
                                    </div>
                                ))}
                                {activeConsents.length === 0 && (
                                    <div style={{padding:'12px', fontSize:'0.85rem', color:'var(--text-secondary)', textAlign:'center'}}>
                                        No active consents found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        className="ai-toolbar-btn primary" 
                        onClick={handleIngest}
                        disabled={!selectedConsentForIngest || isLoading}
                    >
                        <Database size={14} />
                        Ingest Data
                    </button>
                </div>

                <div className="ai-input-wrapper">
                    <textarea
                        ref={inputRef}
                        className="ai-text-input"
                        placeholder="Ask complex financial questions..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{height: 'auto'}}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                        }}
                    />
                    <button 
                        className="ai-send-btn" 
                        onClick={handleSend}
                        disabled={!prompt.trim() || isLoading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            
            {toast && (
                <Toast 
                    title={toast.title}
                    message={toast.message} 
                    type={toast.type} 
                    duration={toast.duration}
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default AIChatPage;
