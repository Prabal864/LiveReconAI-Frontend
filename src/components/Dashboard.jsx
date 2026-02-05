import React, { useMemo, useState, useEffect } from "react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import "../index.css";
import { fetchTransactionsByConsentId } from "../api";
import { useTransactionsByConsentId } from "../hooks/useTransactionsByConsentId";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import ConsentManager from "./ConsentManager";
import ProcessingModal from "./ProcessingModal";
import { SetuProvider } from "../contexts/SetuContext";
import { 
  LayoutDashboard, 
  BarChart2, 
  PiggyBank, 
  Briefcase, 
  MessageSquare, 
  ArrowRightLeft, 
  FileCheck, 
  Settings, 
  Palette, 
  HelpCircle, 
  LogOut,
  Zap,
  Sun,
  Moon,
  Wifi,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Search,
  Smartphone,
  Globe,
  Download,
  MoreHorizontal,
  User,
  Edit,
  ChevronDown,
  Wallet,
  Database,
  TrendingUp,
  TrendingDown,
  Bot,
  FileText,
  FileSpreadsheet,
  Table
} from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import AIChatPage from "./AIChatPage";
import "../styles/DashboardRedesign.css";
import "../styles/Transactions.css";
import "../styles/TransactionsCarousel.css";
import "../styles/ConsentManager.css";

const Dashboard = ({ setAuthenticated }) => {
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && params.get("id")) {
      return "Consent";
    }
    return "Dashboard";
  });
  const [theme, setTheme] = useState("dark");
  const [selectedConsentId, setSelectedConsentId] = useState("ALL"); // New State for Dropdown
  const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
  const [graphTimeRange, setGraphTimeRange] = useState("Weekly"); // State for Graph Time Range
  const [graphStartDate, setGraphStartDate] = useState(""); // Custom Start Date
  const [graphEndDate, setGraphEndDate] = useState("");   // Custom End Date
  const [isStackExpanded, setIsStackExpanded] = useState(false); // New State for Stack Animation
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Sidebar State
  const [consentId, setConsentId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const { transactions, allTransactions, loading, error, fetchTransactionsViaSession, total, paginate, rawResponse, notification, loadingMessage } = useTransactionsByConsentId();
  
  // State to track localStorage changes for reactivity
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user-specific consents dynamically
  const activeConsents = useMemo(() => {
    const saved = localStorage.getItem('setu_consents');
    const userConsentIdsStr = localStorage.getItem('userConsentIds');
    
    let userConsentIds = [];
    try {
      userConsentIds = userConsentIdsStr ? JSON.parse(userConsentIdsStr) : [];
    } catch (error) {
      console.error("Error parsing userConsentIds:", error);
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const activeConsentsList = parsed.filter(c => c.status === 'ACTIVE');
        
        // ALWAYS filter by user consent IDs - show nothing if user has no consents
        if (userConsentIds.length > 0) {
          return activeConsentsList.filter(c => userConsentIds.includes(c.id));
        }
        
        // If no userConsentIds, show nothing (user hasn't created any consents)
        return [];
      } catch (error) {
        console.error("Error parsing setu_consents:", error);
        return [];
      }
    }
    return [];
  }, [refreshKey]); // Add refreshKey as dependency

  // Listen for storage changes from ConsentManager
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Listen for custom event from ConsentManager
    window.addEventListener('consentsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('consentsUpdated', handleStorageChange);
    };
  }, []);

  // Close consent dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isConsentDropdownOpen && !event.target.closest('.custom-consent-dropdown')) {
        setIsConsentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConsentDropdownOpen]);

  // Derived state for the currently selected consent object
  const currentConsent = useMemo(() => {
    return activeConsents.find(c => c.id === selectedConsentId) || null;
  }, [selectedConsentId, activeConsents]);

  const getUserInfoFromStorage = () => {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    let displayName = username || "User";
    if (firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    } else if (firstName) {
      displayName = firstName;
    }

    let displayEmail = email || "";
    if (!displayEmail && username && username.includes('@')) {
      displayEmail = username;
    }

    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      name: displayName,
      email: displayEmail,
      initials
    };
  };

  const [userInfo, setUserInfo] = useState(getUserInfoFromStorage);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Refresh user info on mount to ensure fresh data after login
  useEffect(() => {
    setUserInfo(getUserInfoFromStorage());
  }, []);

  const [dashboardStats, setDashboardStats] = useState({
    totalIncome: 0,
    totalSpending: 0,
    netSavings: 0,
    balance: 0,
    transactionCount: 0,
    topSpendingCategory: "None",
    loading: false,
    spendingTrend: [], // For the graph
    topExpenses: [], // For the "Most Spent" list
    spendingCategories: {}
  });

  // Calculate statistics based on selectedConsentId
  useEffect(() => {
    const calculateStats = async () => {
      if (!activeConsents || activeConsents.length === 0) return;
      
      setDashboardStats(prev => ({ ...prev, loading: true }));
      try {
        // Filter consents to fetch based on dropdown selection
        const consentsToFetch = selectedConsentId === "ALL" 
            ? activeConsents 
            : activeConsents.filter(c => c.id === selectedConsentId);

        const statsPromises = consentsToFetch.map(consent => 
            fetchTransactionsByConsentId(consent.id)
              .catch(err => {
                console.warn(`Failed to fetch transactions for consent ${consent.id}`, err);
                return []; 
              })
        );
        
        const results = await Promise.all(statsPromises);
        
        let allTxList = [];
        results.forEach(data => {
            const txs = Array.isArray(data) ? data : (data?.transactions || []);
            allTxList = [...allTxList, ...txs];
        });

        // --- Date Range & Filter Logic ---
        const normalizeDate = (d) => {
           const n = new Date(d);
           n.setHours(0, 0, 0, 0);
           return n;
        };

        let rangeStart, rangeEnd;
        
        // Find latest transaction date for default anchoring
        let latestTxDate = new Date();
        if (allTxList.length > 0) {
             const timestamps = allTxList
                .map(t => t.date || t.timestamp || t.valueDate)
                .map(ts => new Date(ts).getTime())
                .filter(ts => !isNaN(ts));
             if (timestamps.length > 0) {
                 latestTxDate = new Date(Math.max(...timestamps));
             }
        }
        latestTxDate = normalizeDate(latestTxDate);

        // Determine Start/End
        if (graphStartDate && graphEndDate) {
            rangeStart = normalizeDate(graphStartDate);
            rangeEnd = normalizeDate(graphEndDate);
        } else {
            // Default: Last 7 days ending at latest transaction
            rangeEnd = graphEndDate ? normalizeDate(graphEndDate) : latestTxDate;
            rangeStart = graphStartDate ? normalizeDate(graphStartDate) : new Date(rangeEnd);
            
            if (!graphStartDate) {
                rangeStart.setDate(rangeEnd.getDate() - 6); // 7 days window (inclusive)
            }
        }
        
        // Safety swap
        if (rangeStart > rangeEnd) {
             const temp = rangeStart;
             rangeStart = rangeEnd;
             rangeEnd = temp;
        }

        // --- Filter Transactions & Calculate Stats ---
        const filteredTxList = allTxList.filter(t => {
            const raw = t.date || t.timestamp || t.bookingDate || t.valueDate;
            if (!raw) return false;
            const d = normalizeDate(raw);
            return d >= rangeStart && d <= rangeEnd;
        });

        let income = 0;
        let spending = 0;
        let count = filteredTxList.length;
        const spendingCategories = {};
        const paymentMethods = {}; // New: Payment Method aggregation
        const dateMap = new Map(); // Date String -> {income, expense}

        filteredTxList.forEach(t => {
            const amount = Number(t.amount);
            if (!isNaN(amount)) {
                
                // Robust Type Checking
                const type = String(t.type || t.transactionType || '').toUpperCase();
                const isCredit = (type === 'CREDIT' || type === 'CR' || type === 'INCOME');
                const isDebit = (type === 'DEBIT' || type === 'DR' || type === 'EXPENSE' || (String(t.amount).startsWith('-')));

                // Add to Date Map
                const rawDate = t.date || t.timestamp || t.bookingDate || t.valueDate;
                if (rawDate) {
                     const d = normalizeDate(rawDate);
                     const key = d.toISOString().split('T')[0];
                     if (!dateMap.has(key)) dateMap.set(key, {income: 0, expense: 0});
                     const entry = dateMap.get(key);
                     
                     if (isCredit) entry.income += amount;
                     else if (isDebit) entry.expense += Math.abs(amount);
                }

                if (isCredit) {
                    income += amount;
                } else if (isDebit) {
                    const absAmount = Math.abs(amount);
                    spending += absAmount;

                    // Categorization Logic
                    let category = 'Others';
                    const narration = (t.narration || '').toLowerCase();
                    const mode = (t.mode || '').toLowerCase();

                    // Mode Aggregation for Graph
                    let cleanMode = 'Others';
                    if (mode.includes('upi')) cleanMode = 'UPI';
                    else if (mode.includes('card') || mode.includes('pos')) cleanMode = 'Card';
                    else if (mode.includes('neft') || mode.includes('imps') || mode.includes('rtgs')) cleanMode = 'Netbanking';
                    else if (mode.includes('atm')) cleanMode = 'Cash';
                    
                    if (cleanMode === 'Others' && narration.includes('upi')) cleanMode = 'UPI'; // Fallback check

                    paymentMethods[cleanMode] = (paymentMethods[cleanMode] || 0) + absAmount;


                    if (mode.includes('upi') || narration.includes('upi')) category = 'UPI Payments';
                    else if (mode.includes('imps') || mode.includes('neft') || mode.includes('rtgs')) category = 'Transfers';
                    else if (mode.includes('card') || narration.includes('pos') || narration.includes('visa') || narration.includes('mastercard')) category = 'Card Spend';
                    else if (mode.includes('atm') || narration.includes('atm') || narration.includes('withdraw')) category = 'Cash Withdrawal';
                    else if (narration.includes('interest')) category = 'Bank Charges/Interest';
                    else if (narration.includes('food') || narration.includes('zomato') || narration.includes('swiggy')) category = 'Food & Dining';
                    else if (narration.includes('uber') || narration.includes('ola') || narration.includes('fuel')) category = 'Transport';

                    spendingCategories[category] = (spendingCategories[category] || 0) + absAmount;
                }
            }
        });




        const netSavings = income - spending;
        const balance = netSavings; // In a real app, you'd add this to opening balance
        
        // Find top spending category
        let topCategory = "None";
        let maxSpend = 0;
        Object.entries(spendingCategories).forEach(([cat, amount]) => {
            if (amount > maxSpend) {
                maxSpend = amount;
                topCategory = cat;
            }
        });

        // --- Generate timeline for graph ---
        const dailyStats = [];
        let curr = new Date(rangeStart);
        while (curr <= rangeEnd) {
             const key = curr.toISOString().split('T')[0];
             const dayData = dateMap.get(key) || {income:0, expense:0};
             
             dailyStats.push({ 
                dateObj: new Date(curr),
                name: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                income: dayData.income, 
                expense: dayData.expense 
            });
            curr.setDate(curr.getDate() + 1);
        }

        // Use dailyStats for the graphData
        const spendingTrend = dailyStats; 

        // Get Top Expenses (Highest Debit Transactions from filtered list)
        const topExpenses = filteredTxList
            .filter(t => {
                 const type = String(t.type || t.transactionType || '').toUpperCase();
                 return type === 'DEBIT' || type === 'DR' || type === 'EXPENSE' || String(t.amount).startsWith('-');
            })
            .sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))
            .slice(0, 5);

        setDashboardStats({
            totalIncome: income,
            totalSpending: spending,
            netSavings: netSavings,
            balance: balance,
            transactionCount: count,
            topSpendingCategory: topCategory,
            loading: false,
            spendingTrend, 
            topExpenses,
            spendingCategories,
            paymentMethods // New Field

        });

      } catch (error) {
        console.error("Error calculating dashboard stats:", error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    calculateStats();
  }, [activeConsents, selectedConsentId, graphStartDate, graphEndDate]); // Re-run when selection or time range changes

  const fetchUserInfo = () => {
    setUserInfo(getUserInfoFromStorage());
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.user-profile')) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleConsentClick = async (id) => {
    setConsentId(id);
    setPage(1);
    await fetchTransactionsViaSession(id, 1, pageSize);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    paginate(newPage, pageSize);
  };

  const handleLogout = () => {
    // Clear all authentication and user data from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userConsentIds");
    localStorage.removeItem("setu_consents");
    localStorage.removeItem("setu_session_expiry");
    if (setAuthenticated) setAuthenticated(false);
  };

  const getCardStyle = (id, index = 0) => {
    // Ultimate Premium Gradients - Deep, Matte, and Sophisticated
    const gradients = [
      // 1. Phantom Black (Matte with subtle light)
      'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
      // 2. Midnight Titanium (Dark Blue Grey)
      'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      // 3. Royal Velvet (Deepest Purple)
      'linear-gradient(135deg, #2e1065 0%, #0f0720 100%)',
      // 4. Racing Green (British Racing Green)
      'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      // 5. Oxblood (Deep Red)
      'linear-gradient(135deg, #450a0a 0%, #250505 100%)'
    ];

    const bg = gradients[index % gradients.length];
    return { background: bg };
  };

  const [expandedIdx, setExpandedIdx] = useState(null);

  const parseAmount = (value) => {
    if (typeof value === "number") return value;
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const currencySymbol = useMemo(() => {
    const sample = allTransactions?.find((t) => t && (t.currency || t.currencySymbol));
    const raw = sample?.currencySymbol || sample?.currency;
    if (!raw) return "₹";
    const s = String(raw).trim();
    if (s.length === 1) return s;
    const upper = s.toUpperCase();
    if (upper === "INR") return "₹";
    if (upper === "USD") return "$";
    if (upper === "EUR") return "€";
    if (upper === "GBP") return "£";
    return "₹";
  }, [allTransactions]);

  const formatCurrency = (amount = 0, currencySymbol = "$") => {
    const numeric = Number(amount) || 0;
    return `${currencySymbol}${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportToCSV = () => {
      if (!allTransactions || allTransactions.length === 0) return;
      
      const headers = ["Date", "Description", "Type", "Category", "Amount", "Mode", "Reference"];
      const rows = allTransactions.map(tx => [
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
      saveAs(blob, 'all_transactions.csv');
  };

  const exportToExcel = () => {
      if (!allTransactions || allTransactions.length === 0) return;
      
      const worksheet = XLSX.utils.json_to_sheet(allTransactions.map(tx => ({
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
      XLSX.writeFile(workbook, "all_transactions.xlsx");
  };

  const exportToPDF = () => {
      if (!allTransactions || allTransactions.length === 0) return;
      
      const doc = new jsPDF();
      doc.text("Transaction Report", 14, 15);
      
      const tableColumn = ["Date", "Description", "Type", "Category", "Amount"];
      const tableRows = allTransactions.map(tx => [
          tx.date || tx.timestamp || '-',
          tx.narration || tx.description || '-',
          tx.type || '-',
          tx.category || tx.mode || '-',
          formatCurrency(tx.amount, currencySymbol)
      ]);
      
      autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 20,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
      });
      
      doc.save("all_transactions.pdf");
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(total / pageSize);
    if (!totalPages || totalPages <= 1) return null;

    const pages = [];
    const minPage = 1;
    const maxPage = totalPages;

    // Logic to show a window of pages around current page
    // Always include first, last, and window around current
    // e.g. 1 ... 4 5 6 ... 10

    if (maxPage <= 7) {
        // Show all if few
        for (let i = 1; i <= maxPage; i++) pages.push(i);
    } else {
        pages.push(1);
        
        let startWindow = Math.max(2, page - 1);
        let endWindow = Math.min(maxPage - 1, page + 1);

        // Adjust window if near start
        if (page <= 3) {
            endWindow = 4;
        }
        // Adjust window if near end
        if (page >= maxPage - 2) {
            startWindow = maxPage - 3;
        }

        if (startWindow > 2) {
            pages.push('...');
        }
        
        for (let i = startWindow; i <= endWindow; i++) {
            pages.push(i);
        }
        
        if (endWindow < maxPage - 1) {
            pages.push('...');
        }
        
        pages.push(maxPage);
    }

    return (
      <div className="pagination-container">
        <button 
          className="page-nav-btn"
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="page-numbers">
          {pages.map((p, i) => (
            <button
              key={i}
              className={`page-number ${p === page ? 'active' : ''} ${p === '...' ? 'dots' : ''}`}
              onClick={() => typeof p === 'number' && handlePageChange(p)}
              disabled={p === '...' || loading || p === page}
            >
              {p}
            </button>
          ))}
        </div>

        <button 
          className="page-nav-btn"
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // --- Graph Helpers ---
  const getSmoothPath = (points, height, width, maxValOverride = null) => {
    if (points.length < 2) return "";
    
    // Normalize points to chart dimensions
    const maxY = maxValOverride !== null ? maxValOverride : (Math.max(...points) || 1);
    const px = width / (points.length - 1);
    
    const cords = points.map((y, i) => ({
      x: i * px,
      y: height - (y / maxY) * height * 0.7 - (height * 0.15) // 15% padding bottom/top
    }));

    // Generate Path (Catmull-Rom-like smoothing via cubic bezier)
    let d = `M ${cords[0].x} ${cords[0].y}`;
    
    for (let i = 0; i < cords.length - 1; i++) {
        const p0 = cords[Math.max(i - 1, 0)];
        const p1 = cords[i];
        const p2 = cords[i + 1];
        const p3 = cords[Math.min(i + 2, cords.length - 1)];

        const cp1x = p1.x + (p2.x - p0.x) * 0.15; // Tension 0.15
        const cp1y = p1.y + (p2.y - p0.y) * 0.15;
        const cp2x = p2.x - (p3.x - p1.x) * 0.15;
        const cp2y = p2.y - (p3.y - p1.y) * 0.15;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return { d, cords };
  };

  const renderMiniChart = (color) => {
       // Mini Sparkline SVG
       const data = [10, 40, 30, 70, 50, 90, 80];
       const { d } = getSmoothPath(data, 40, 80);
       return (
           <div className="mini-chart" style={{width: '80px', height: '40px'}}>
             <svg width="100%" height="100%" overflow="visible">
                <path d={d} stroke={color} fill="none" strokeWidth="2" strokeLinecap="round" />
                <path d={`${d} L 80 40 L 0 40 Z`} fill={color} fillOpacity="0.15" stroke="none" />
             </svg>
           </div>
       );
  };

  const renderSpendingGraph = () => {
    const data = dashboardStats.spendingTrend; 
    
    // Fallback if empty (should not happen often due to init)
    if (!data || data.length === 0) return null;

    const startDate = data[0]?.name || "";
    const endDate = data[data.length - 1]?.name || "";

    // Determine Min/Max dates based on current consent
    let minDate, maxDate;
    if (selectedConsentId !== "ALL") {
        const c = activeConsents.find(i => i.id === selectedConsentId);
        if (c) {
             // Try to find typical consent date range fields
             // Assuming consentStart/consentExpiry or dateFrom/dateTo structure
             if (c.consentStart) minDate = new Date(c.consentStart).toISOString().split('T')[0];
             if (c.consentExpiry) maxDate = new Date(c.consentExpiry).toISOString().split('T')[0];
             // Fallbacks if properties differ in your Consent object schema
             if (!minDate && c.dateRange && c.dateRange.from) minDate = new Date(c.dateRange.from).toISOString().split('T')[0];
             if (!maxDate && c.dateRange && c.dateRange.to) maxDate = new Date(c.dateRange.to).toISOString().split('T')[0];
        }
    }

    return (
        <div className="widget-card" style={{gridColumn: '1 / -1', minHeight: '300px'}}>
            <div className="graph-header-row" style={{ marginBottom: '1rem' }}>
                <div>
                   <h3 className="widget-title" style={{marginBottom: '2px'}}>Money Flow</h3>
                   <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Income vs Expenses</div>
                </div>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                    {/* Native Date Picker Integration */}
                    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <input 
                            type="date"
                            className="modern-date-input"
                            min={minDate}
                            max={maxDate}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                outline: 'none',
                                colorScheme: 'dark'
                            }}
                            value={graphStartDate}
                            onChange={(e) => setGraphStartDate(e.target.value)}
                        />
                        <span style={{color: 'var(--text-secondary)', fontSize: '0.75rem'}}>-</span>
                        <input 
                            type="date"
                            className="modern-date-input"
                            min={minDate}
                            max={maxDate}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                outline: 'none',
                                colorScheme: 'dark'
                            }}
                            value={graphEndDate}
                            onChange={(e) => setGraphEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            <div style={{width: '100%', height: '280px', display: 'flex', justifyContent: 'center'}}>
                 <ResponsiveContainer width="100%" height="100%">
                 <AreaChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 12, fill: '#94a3b8'}}
                        dy={10}
                        minTickGap={30}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        width={60}
                        tick={{fontSize: 12, fill: '#94a3b8'}}
                        tickFormatter={(val) => `₹${val>=1000 ? val/1000 + 'k' : val}`}
                      />
                      <Tooltip 
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span style={{color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginLeft: '5px'}}>{value}</span>}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Income"
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                        activeDot={{r: 6, strokeWidth: 0}}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expense" 
                        name="Expenses"
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                        activeDot={{r: 6, strokeWidth: 0}}
                      />
                  </AreaChart>
                  </ResponsiveContainer>
            </div>
        </div>
    );
  };

  const renderStatisticsAndSavings = () => {
    // 1. Prepare Data
    const categories = dashboardStats.spendingCategories || {};
    const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    const hasData = pieData.length > 0;
    
    const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b', '#ec4899'];

    return (
      <div className="dashboard-row-split" style={{ gridTemplateColumns: '350px 1fr' }}>
        {/* Statistics Pie Chart Widget */}
        <div className="widget-card">
            <div className="widget-header">
                <span className="widget-title">Spend Analysis</span>
            </div>
            <div className="donut-container" style={{display:'flex', flexDirection:'column', height:'100%', minHeight: '220px', alignItems: 'center', justifyContent: 'center'}}>
                 {hasData ? (
                    <PieChart width={300} height={300}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={105}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value) => formatCurrency(value, "₹")}
                            contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center"
                            iconType="circle"
                            formatter={(val) => <span style={{color:'#94a3b8', fontSize:'12px'}}>{val}</span>}
                        />
                    </PieChart>
                 ) : (
                    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', color:'#666'}}>No spending data available</div>
                 )}
            </div>
        </div>

        {/* Highest Value Transactions Table - Moved Here for Layout */}
        <div className="invoices-section" style={{ height: '100%' }}>
            <div className="section-header">
                <h3>Highest Transactions</h3>
                <button className="new-invoice-btn" onClick={() => setActiveSection("Transactions")}>See All</button>
            </div>
            <div className="table-responsive">
            {dashboardStats.topExpenses.length > 0 ? (
                <table className="invoices-table">
                    <thead>
                        <tr>
                            <th>Transaction</th>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardStats.topExpenses.slice(0, 5).map((tx, idx) => {
                             const txDate = tx.timestamp || tx.date || tx.bookingDate || tx.valueDate;
                             const displayDate = txDate ? new Date(txDate).toLocaleDateString() : 'N/A';
                             return (
                                <tr key={idx}>
                                    <td>
                                        <div className="tx-name-wrap">
                                            <div className="tx-icon-box">🧾</div>
                                            <span style={{fontWeight:500, fontSize: '0.9rem'}}>{tx.id || tx.txnId || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>{displayDate}</td>
                                    <td>{tx.mode || 'Payment'}</td>
                                    <td style={{color: '#ef4444', fontWeight: '700'}}>{formatCurrency(tx.amount, "₹")}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="empty-chart-msg">No relevant transactions found.</div>
            )}
            </div>
        </div>
    </div>
  );
  };

  // --- New Render Functions for the Design UI ---

  const renderDashboardHome = () => {
    // Check if user has no consents
    if (activeConsents.length === 0) {
      return (
        <div className="dashboard-container-v2">
          <div className="empty-state" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px',
            padding: '2rem'
          }}>
            <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <div className="empty-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No User Consents Created
            </div>
            <div className="empty-subtitle" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Create a consent to start viewing your financial data and transactions.
            </div>
            <button 
              onClick={() => setActiveSection("Consent")}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Go to Consent Management
            </button>
          </div>
        </div>
      );
    }
    
    return (
    <div className="dashboard-container-v2">
        <div className="dashboard-content-grid">
            {/* Main Column */}
            <div className="main-content">
                {/* 3-Column Stats Grid Redesign */}
                <div className="stats-grid">
                    <div className="stat-card-premium">
                        <div className="stat-icon-wrapper income">
                            <ArrowDownLeft size={24} color="#22c55e" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Income</span>
                            <h3 className="stat-value">{dashboardStats.loading ? "..." : formatCurrency(dashboardStats.totalIncome, "₹")}</h3>
                        </div>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} />
                            <span>12%</span>
                        </div>
                        <div className="stat-bg-decoration income"></div>
                    </div>
                    
                    <div className="stat-card-premium">
                        <div className="stat-icon-wrapper expense">
                             <ArrowUpRight size={24} color="#ef4444" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Spending</span>
                            <h3 className="stat-value">{dashboardStats.loading ? "..." : formatCurrency(dashboardStats.totalSpending, "₹")}</h3>
                        </div>
                        <div className="stat-trend negative">
                             <TrendingUp size={14} /> {/* Always trending up in amount typically means more spending, but visually we might want red */}
                             <span>8%</span>
                        </div>
                        <div className="stat-bg-decoration expense"></div>
                    </div>

                    <div className="stat-card-premium">
                        <div className="stat-icon-wrapper category">
                             <Wallet size={24} color="#8b5cf6" />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Top Category</span>
                             <h3 className="stat-value" style={{fontSize: '1.2rem'}}>{dashboardStats.loading ? "..." : dashboardStats.topSpendingCategory}</h3>
                        </div>
                        <div className="stat-mini-chart">
                            {renderMiniChart('var(--accent-purple)')}
                        </div>
                    </div>
                </div>


                {/* Money Flow Graph */}
                {renderSpendingGraph()}


                {/* Savings & Stats Row (Combined with Top Transactions) */}
                {renderStatisticsAndSavings()}
            </div>

            {/* Sidebar Column */}
            <div className="sidebar-content">
                <div className="right-widget payment-widget">
                    <div className="widget-header-flex">
                        <h3>Linked Accounts</h3>
                        <span className="account-count-badge">{activeConsents.length}</span>
                    </div>
                    
                    {/* Animated Stacked Cards Wrapper */}
                    <div 
                         className="card-stack-container" 
                         style={{
                             height: isStackExpanded 
                                ? `${Math.max(220, activeConsents.length * 240 + 20)}px` // Expanded height
                                : '240px' // Collapsed height
                         }}
                         onClick={() => setIsStackExpanded(!isStackExpanded)}
                    >
                        {activeConsents.length === 0 ? (
                           <div className="no-card-msg">No Active Accounts Linked</div>
                        ) : activeConsents.map((consent, i) => {
                             const styleObj = getCardStyle(consent.id, i);
                             const cleanId = (consent.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                             const displayId = cleanId.padEnd(16, "0").slice(0, 16).match(/.{1,4}/g)?.join(" ") || "0000 0000 0000 0000";
                             
                             // Get user info from localStorage or VUA
                             const username = localStorage.getItem('username') || localStorage.getItem('firstName') || 'User';
                             const holderName = consent.vua ? consent.vua.split('@')[0].toUpperCase() : username.toUpperCase();
                             
                             // Calculate dynamic styles for stack/spread animation
                             const stackStyle = isStackExpanded 
                                ? { 
                                     top: `${i * 240}px`, 
                                     transform: 'scale(1)',
                                     zIndex: activeConsents.length - i,
                                     position: 'absolute'
                                  }
                                : {
                                     top: `${i * 10}px`,
                                     transform: `scale(${1 - (i * 0.05)}) translateY(${i * -5}px)`,
                                     zIndex: activeConsents.length - i,
                                     opacity: 1 - (i * 0.2),
                                     position: 'absolute'
                                  };

                             return (
                                <div 
                                    key={consent.id}
                                    className="card-stack-item"
                                    style={stackStyle}
                                >
                                    <div className="modern-consent-card" style={{ background: styleObj.background }}>
                                        {/* Card Effects */}
                                        <div className="card-noise" />
                                        <div className="card-shine" />
                                        
                                        {/* Status Badge */}
                                        <div className="card-status-badge">
                                            <span className="status-dot-pulse active"></span>
                                            <span>ACTIVE</span>
                                        </div>
                                        
                                        <div className="card-content">
                                            <div className="card-top-section">
                                                <div className="card-chip-modern">
                                                    <div className="chip-line"></div>
                                                    <div className="chip-line"></div>
                                                    <div className="chip-line"></div>
                                                </div>
                                                <div className="card-contactless-icon">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 10.9c-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1z" fill="rgba(255,255,255,0.8)" />
                                                        <path d="M14.8 13.7c1.4-1.4 1.4-3.7 0-5.1-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.7 0 7.9-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.7)" />
                                                        <path d="M17.6 16.5c2.9-2.9 2.9-7.7 0-10.6-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 3.7 3.7 3.7 9.6 0 13.4-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.5)" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="card-number-display">{displayId}</div>

                                            <div className="card-bottom-section">
                                                <div className="card-info-column">
                                                    <span className="card-label">HOLDER</span>
                                                    <span className="card-value">{holderName}</span>
                                                    <span className="card-provider">SETU CONSENT</span>
                                                </div>
                                                <div className="card-info-column" style={{textAlign: 'right'}}>
                                                    <span className="card-label">CREATED</span>
                                                    <span className="card-value">
                                                        {new Date(consent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Card Logo Circles */}
                                            <div className="card-logo-circles">
                                                <div className="circle red"></div>
                                                <div className="circle yellow"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                        {activeConsents.length > 1 && !isStackExpanded && (
                            <div className="card-stack-hint">
                                <ChevronDown size={14} /> Click to view all {activeConsents.length} accounts
                            </div>
                        )}
                    </div>

                    <button className="add-payment-btn" onClick={() => setActiveSection('Consent')}>
                        <Database size={16} />
                        Manage Consents
                    </button>
                    
                </div>

                {/* Right Column Analytics */}
                <div className="widget-card" style={{marginTop: '20px'}}>
                    <div className="widget-header">
                        <h3 className="widget-title">Payment Modes</h3>
                    </div>
                    <div style={{height: '180px'}}>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(dashboardStats.paymentMethods || {}).map(([name, value]) => ({name, value}))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{backgroundColor: '#1e293b', borderRadius: '8px', border: 'none'}}
                                    itemStyle={{color: '#fff'}}
                                    formatter={(val) => formatCurrency(val, '₹')}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32}>
                                    {
                                      Object.keys(dashboardStats.paymentMethods || {}).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#10b981'][index % 4]} />
                                      ))
                                    }
                                </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                    </div>
                </div>

                <div className="widget-card" style={{marginTop: '20px'}}>
                    <div className="widget-header" style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 className="widget-title">Recent Activity</h3>
                        <button className="view-all-link" onClick={() => setActiveSection("Transactions")}>View All</button>
                    </div>
                    <div className="mini-transactions-list">
                        {transactions.length === 0 ? (
                            <div className="empty-text-mini" style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem'}}>
                                No recent activity
                            </div>
                        ) : (
                            transactions.slice(0, 5).map((tx, i) => {
                                 // Safely handle amount parsing
                                 let amountVal = 0;
                                 let isDebit = false;
                                 try {
                                     const rawAmt = tx.amount || tx.value || 0;
                                     isDebit = (tx.type || '').toUpperCase() === 'DEBIT' || String(rawAmt).startsWith('-');
                                     amountVal = Math.abs(parseFloat(String(rawAmt).replace(/[^0-9.-]+/g,"")));
                                 } catch(e) {}

                                 return (
                                    <div key={i} className="mini-tx-item">
                                        <div className={`mini-tx-icon ${isDebit ? 'debit' : 'credit'}`}>
                                            {isDebit ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                        </div>
                                        <div className="mini-tx-details">
                                            <span className="mini-tx-title">
                                                {tx.narration || tx.description || 'Transaction'}
                                            </span>
                                            <span className="mini-tx-date">
                                                {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Today'}
                                            </span>
                                        </div>
                                        <div className={`mini-tx-amount ${isDebit ? 'debit' : 'credit'}`}>
                                            {isDebit ? '-' : '+'}{formatCurrency(amountVal, '₹')}
                                        </div>
                                    </div>
                                 );
                            })
                        )}
                    </div>
                </div>

                <div className="widget-card" style={{marginTop: '20px'}}>
                     <div className="widget-header">
                        <h3 className="widget-title">Consent Health</h3>
                    </div>
                    <div className="consent-timeline-list" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {activeConsents.slice(0, 3).map((c, i) => {
                            const daysLeft = c.consentExpiry ? Math.ceil((new Date(c.consentExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 30;
                            const isCritical = daysLeft < 7;
                            return (
                                <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '8px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%', 
                                            background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isCritical ? '#ef4444' : '#22c55e'
                                        }}>
                                            <Clock size={14} />
                                        </div>
                                        <div style={{overflow: 'hidden'}}>
                                            <div style={{fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '80px', overflow: 'hidden'}}>
                                                {c.vua ? c.vua.split('@')[0] : `ID: ${c.id.slice(-4)}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: isCritical ? '#ef4444' : (daysLeft < 15 ? '#f59e0b' : '#22c55e')
                                        }}>
                                            {daysLeft}d
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
  };

  const sectionInfo = {
    Dashboard: { title: "Dashboard", subtitle: "Overview of your financial activity" },
    Transactions: { title: "Transactions", subtitle: "Review your transaction history" },
    Consent: { title: "Consent Management", subtitle: "Manage your financial data consents securely" },
    Settings: { title: "Settings", subtitle: "Account configuration" },
    Appearances: { title: "Appearances", subtitle: "Customize your view" },
    Help: { title: "Help", subtitle: "Support and documentation" },
  };

  const currentInfo = sectionInfo[activeSection] || { title: activeSection, subtitle: "" };

  return (
    <div className={`dashboard-root ${theme === "light" ? "theme-light" : ""}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo" style={{justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '0' : '0 4px'}}>
          <div className="logo-icon-box" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{cursor: 'pointer'}}>
            {isSidebarCollapsed ? <ChevronRight size={20} color="white" /> : <Zap size={20} fill="currentColor" />}
          </div>
          {!isSidebarCollapsed && <span className="logo-text">VittaManthan</span>}
        </div>
        
        {!isSidebarCollapsed && <div className="nav-section-label">MENU</div>}
        <nav>
          <ul>
            <li className={activeSection === "Dashboard" ? "active" : ""} onClick={() => setActiveSection("Dashboard")}>
              <span className="icon"><LayoutDashboard size={20} /></span> {!isSidebarCollapsed && "Dashboard"}
            </li>
            <li className={activeSection === "Transactions" ? "active" : ""} onClick={() => setActiveSection("Transactions")}>
              <span className="icon"><ArrowRightLeft size={20} /></span> {!isSidebarCollapsed && "Transactions"}
            </li>
            <li className={activeSection === "Consent" ? "active" : ""} onClick={() => setActiveSection("Consent")}>
              <span className="icon"><FileCheck size={20} /></span> {!isSidebarCollapsed && "Consent"}
            </li>
            <li className={activeSection === "Chat" ? "active" : ""} onClick={() => setActiveSection("Chat")}>
              <span className="icon"><Bot size={20} /></span> {!isSidebarCollapsed && "AI Assistant"}
            </li>
          </ul>
        </nav>

        {!isSidebarCollapsed && <div className="nav-section-label">GENERAL</div>}
        <nav>
          <ul>
            <li className={activeSection === "Settings" ? "active" : ""} onClick={() => setActiveSection("Settings")}>
              <span className="icon"><Settings size={20} /></span> {!isSidebarCollapsed && "Settings"}
            </li>
            <li onClick={handleLogout} className="logout-item">
               <span className="icon"><LogOut size={20} /></span> {!isSidebarCollapsed && "Log Out"}
            </li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header" style={{gap: '20px'}}>
          <div className="header-left" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <div>
                <h2>{currentInfo.title}</h2>
                <p>{currentInfo.subtitle}</p>
            </div>
            
            {/* Shifted Filter Bar for Dashboard Context */}
            {activeSection === "Dashboard" && (
                <div className="dashboard-filter-inline" style={{display: 'flex', alignItems: 'center', gap: '10px', position: 'relative'}}>
                    <span className="filter-label" style={{fontSize: '0.85rem', color: 'var(--text-secondary)', display: window.innerWidth < 1200 ? 'none' : 'block'}}>For:</span>
                    <div className="custom-consent-dropdown" style={{position: 'relative', minWidth: '280px'}}>
                        <button
                            type="button"
                            className="consent-dropdown-trigger"
                            onClick={() => setIsConsentDropdownOpen(!isConsentDropdownOpen)}
                        >
                            <div className="trigger-content">
                                {selectedConsentId === "ALL" ? (
                                    <>
                                        <Wallet size={16} />
                                        <span>All Accounts (Consolidated)</span>
                                    </>
                                ) : (
                                    <>
                                        <Database size={16} />
                                        <span>
                                            {(() => {
                                                const c = activeConsents.find(consent => consent.id === selectedConsentId);
                                                if (!c) return 'Select Consent';
                                                return c.vua ? `${c.vua.split('@')[0]}` : `Consent ${c.id.slice(0,8)}...`;
                                            })()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown size={16} className={`dropdown-arrow ${isConsentDropdownOpen ? 'open' : ''}`} />
                        </button>
                        
                        {isConsentDropdownOpen && (
                            <div className="consent-dropdown-menu">
                                <div
                                    className={`consent-dropdown-item ${selectedConsentId === 'ALL' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedConsentId('ALL');
                                        setIsConsentDropdownOpen(false);
                                    }}
                                >
                                    <div className="item-icon">
                                        <Wallet size={18} />
                                    </div>
                                    <div className="item-content">
                                        <div className="item-title">All Accounts (Consolidated)</div>
                                        <div className="item-subtitle">{activeConsents.length} active consent{activeConsents.length !== 1 ? 's' : ''}</div>
                                    </div>
                                    {selectedConsentId === 'ALL' && <CheckCircle2 size={16} className="check-icon" />}
                                </div>
                                
                                {activeConsents.map((c, index) => (
                                    <div
                                        key={c.id}
                                        className={`consent-dropdown-item ${selectedConsentId === c.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedConsentId(c.id);
                                            setIsConsentDropdownOpen(false);
                                        }}
                                        style={{ animationDelay: `${index * 0.03}s` }}
                                    >
                                        <div className="item-icon">
                                            <Database size={18} />
                                        </div>
                                        <div className="item-content">
                                            <div className="item-title">
                                                {c.vua ? c.vua.split('@')[0] : `Consent ${c.id.slice(0,8)}...`}
                                            </div>
                                            <div className="item-subtitle">
                                                <span className="status-dot active"></span>
                                                Active • Created {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        {selectedConsentId === c.id && <CheckCircle2 size={16} className="check-icon" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
          <div className="header-right">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="user-profile" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              <div className="avatar">{userInfo.initials}</div>
              <div className="user-info">
                <span className="name">{userInfo.name}</span>
                {userInfo.email && <span className="email">{userInfo.email}</span>}
              </div>
              <span className="chevron">
                 <ChevronDown size={16} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </span>

              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu">
                  <div className="profile-dropdown-header">
                     <span className="dropdown-user-name">{userInfo.name}</span>
                     <span className="dropdown-user-email">{userInfo.email || "No email set"}</span>
                  </div>
                  <button className="profile-dropdown-item" onClick={(e) => {
                     e.stopPropagation();
                     setIsEditProfileModalOpen(true);
                     setIsProfileMenuOpen(false);
                  }}>
                    <Edit size={16} /> Edit Profile / Username
                  </button>
                  <button className="profile-dropdown-item danger" onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <EditProfileModal 
           isOpen={isEditProfileModalOpen}
           onClose={() => setIsEditProfileModalOpen(false)}
           userInfo={userInfo}
           onUpdate={fetchUserInfo}
        />

        <section className="dashboard-content-wrapper">
          {activeSection === "Transactions" ? (
            <div className="transactions-panel">
              {/* Active Consents Carousel - Always show if user has consent IDs */}
              {(() => {
                // Get consents from localStorage for display (independent of SETU session)
                const saved = localStorage.getItem('setu_consents');
                const userConsentIdsStr = localStorage.getItem('userConsentIds');
                
                let userConsentIds = [];
                try {
                  userConsentIds = userConsentIdsStr ? JSON.parse(userConsentIdsStr) : [];
                } catch (error) {
                  console.error("Error parsing userConsentIds:", error);
                }

                // If user has consent IDs, show the cards (even if SETU session expired)
                if (userConsentIds.length === 0) return null;

                let displayConsents = [];
                if (saved) {
                  try {
                    const parsed = JSON.parse(saved);
                    displayConsents = parsed.filter(c => userConsentIds.includes(c.id));
                  } catch (error) {
                    console.error("Error parsing setu_consents:", error);
                  }
                }

                // If no consent data in localStorage, create placeholder cards from IDs
                if (displayConsents.length === 0 && userConsentIds.length > 0) {
                  displayConsents = userConsentIds.map(id => ({
                    id,
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString(),
                    vua: 'User Consent'
                  }));
                }

                return displayConsents.length > 0 ? (
                <div className="active-consents-carousel">
                  <h3>Active Consents</h3>
                  <div className="carousel-track">
                    {displayConsents.map((consent, index) => {
                      const styleObj = getCardStyle(consent.id || `consent-${index}`);
                      const cleanId = (consent.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                      const displayId = cleanId.padEnd(16, "0").slice(0, 16).match(/.{1,4}/g)?.join(" ") || "0000 0000 0000 0000";

                      return (
                        <div 
                          key={consent.id} 
                          className={`consent-card-premium ${styleObj.pattern} ${consentId === consent.id ? 'selected' : ''}`}
                          onClick={() => handleConsentClick(consent.id)}
                          style={{ 
                              background: styleObj.background,
                              ...styleObj.vars,
                              minWidth: '420px',
                              height: '265px',
                              cursor: 'pointer',
                              border: consentId === consent.id ? '2px solid #fff' : 'none',
                              transform: consentId === consent.id ? 'scale(1.02)' : 'scale(1)',
                              padding: '2rem'
                          }}
                        >
                          <div className="card-shine"></div>
                          
                          {/* Top Row */}
                          <div className="card-top-row">
                              <div className="provider-logo" style={{ fontSize: '1.4rem' }}>SETU<span className="font-light">CONSENT</span></div>
                              <div className="status-badge-pill">
                                  <span className={`status-dot-pulse ${consent.status?.toLowerCase()}`}></span>
                                  <span className="status-label">{consent.status}</span>
                              </div>
                          </div>

                          {/* Chip Row - Contactless Only */}
                          <div className="card-chip-row">
                              <div className="contactless-symbol" style={{ marginLeft: 'auto' }}>
                                  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                                      <path d="M12 10.9c-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1z" fill="rgba(255,255,255,0.8)" />
                                      <path d="M14.8 13.7c1.4-1.4 1.4-3.7 0-5.1-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.7 0 7.9-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.6)" />
                                      <path d="M17.6 16.5c2.9-2.9 2.9-7.7 0-10.6-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 3.7 3.7 3.7 9.6 0 13.4-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.4)" />
                                  </svg>
                              </div>
                          </div>
                          
                          <div className="card-number-large" style={{ fontSize: '1.75rem', margin: 'auto 0', letterSpacing: '3px', fontWeight: 600 }}>{displayId}</div>

                          <div className="card-bottom-row" style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '2.5rem' }}>
                                <div className="card-info-col">
                                  <span className="card-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '6px', display: 'block', letterSpacing: '1px' }}>CONSENT HOLDER</span>
                                  <span className="card-value" style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{consent.vua ? consent.vua.split('@')[0].toUpperCase() : 'UNKNOWN'}</span>
                                </div>
                                <div className="card-info-col">
                                  <span className="card-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '6px', display: 'block', letterSpacing: '1px' }}>CREATED</span>
                                  <span className="card-value" style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{new Date(consent.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="card-logo-circles">
                                <div className="circle red" style={{ width: '42px', height: '42px' }}></div>
                                <div className="circle yellow" style={{ width: '42px', height: '42px' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                ) : null;
              })()}

               {/* Existing Transactions Logic */}
               {/* Stats removed as per request */}


              <div className="transactions-list">
                {notification && (
                  <div className={`notification-banner ${notification.type}`}>
                    {notification.message}
                  </div>
                )}
                <ProcessingModal isOpen={loading} message={loadingMessage || "Processing..."} />
                {!loading && error && <div className="error-banner">{error}</div>}
                {!loading && !error && transactions.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <div className="empty-title">No transactions yet</div>
                    <div className="empty-subtitle">Fetch with a consent ID to populate the feed.</div>
                    <details>
                      <summary>Show raw backend response</summary>
                      <pre className="raw-response">{JSON.stringify(rawResponse, null, 2)}</pre>
                    </details>
                  </div>
                )}
                {!loading && !error && transactions.length > 0 && (
                  <>
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '8px', paddingRight: '4px'}}>
                        <button onClick={exportToPDF} title="Export as PDF" style={{padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', boxShadow: 'var(--card-shadow, none)'}}>
                            <FileText size={16} color="#3b82f6" /> PDF
                        </button>
                        <button onClick={exportToExcel} title="Export as Excel" style={{padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', boxShadow: 'var(--card-shadow, none)'}}>
                            <FileSpreadsheet size={16} color="#22c55e" /> Excel
                        </button>
                        <button onClick={exportToCSV} title="Export as CSV" style={{padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', boxShadow: 'var(--card-shadow, none)'}}>
                            <Table size={16} color="#f59e0b" /> CSV
                        </button>
                    </div>
                    <div className="transactions-table-header">
                      <div className="th-item"><div className="custom-checkbox"></div></div>
                      <div className="th-item">TRANSACTION ID</div>
                      <div className="th-item">CUSTOMER</div>
                      <div className="th-item">TOTAL</div>
                      <div className="th-item">TYPE</div>
                      <div className="th-item">ORDER DATE</div>
                      <div className="th-item">PAYMENT</div>
                      <div className="th-item">PAYMENT METHOD</div>
                      <div className="th-item">TRACKING NUMBER</div>
                    </div>
                    {transactions.map((tx, idx) => {
                       // Use account number if available, otherwise fallback to ID or narration
                       const title = tx.accountNumber || tx.payerAccount || tx.payeeAccount || tx.vpa || tx.counterpartyVpa || tx.narration || 'Account ' + (tx.id ? tx.id.slice(-4) : 'Unknown');
                       const amountRaw = tx.amount || tx.value || tx.price || tx.total || 0;
                       const currency = (typeof tx.currency === 'string' && tx.currency.length === 1) ? tx.currency : currencySymbol;
                       const status = tx.status || tx.state || 'Success';
                       const type = (tx.type || tx.transactionType || '').toUpperCase();
                       const isDebit = type === 'DEBIT' || type === 'DR' || (String(amountRaw).startsWith('-'));
                       const signedAmount = parseAmount(amountRaw);
                       const amountVal = Math.abs(signedAmount);
                       const amountSign = isDebit ? '-' : '+';
                       const amountColor = isDebit ? '#ef4444' : '#22c55e';
                       const txDate = tx.timestamp || tx.date || tx.bookingDate || tx.valueDate;
                       
                       const Icon = isDebit ? ArrowUpRight : ArrowDownLeft;
                       const iconBg = isDebit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
                       const iconColor = isDebit ? '#ef4444' : '#22c55e';

                       return (
                        <div key={idx} className={`transaction-card ${expandedIdx === idx ? 'expanded' : ''}`}>
                          <div className="transaction-row" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)} style={{cursor: 'pointer'}}>
                            <div className="td-item"><div className="custom-checkbox"></div></div>
                            <div className="td-item monospace text-secondary">
                              <span className="truncate-text">{tx.id ? tx.id.slice(0, 8) : (tx.txnId ? tx.txnId.slice(0, 8) : `ORD-${idx + 1000}`)}</span>
                            </div>
                            <div className="td-item font-medium text-primary">
                              <span className="truncate-text">{String(title)}</span>
                            </div>
                            <div className="td-item font-semibold" style={{color: amountColor}}>
                              {amountSign}{formatCurrency(amountVal, currency)}
                            </div>
                            <div className="td-item" style={{color: isDebit ? '#ef4444' : '#22c55e', fontWeight: 600, textTransform: 'capitalize'}}>
                              {isDebit ? 'Debit' : 'Credit'}
                            </div>
                            <div className="td-item">{txDate ? new Date(txDate).toLocaleDateString() : 'Today'}</div>
                            <div className="td-item">
                              <span className={`status-badge ${status.toLowerCase() === 'success' ? 'success' : 'pending'}`}>
                                {status}
                              </span>
                            </div>
                            <div className="td-item">
                              <div className="payment-method">
                                <div className="payment-icon"><CreditCard size={10} /></div>
                                <span>{tx.mode || 'Card'}</span>
                              </div>
                            </div>
                            <div className="td-item">
                              <div className="tracking-number">
                                <span className="tracking-icon">📦</span>
                                {tx.reference ? tx.reference.slice(0, 12) : '1Z999AA...'}
                              </div>
                            </div>
                          </div>
                          {expandedIdx === idx && (
                            <div className="transaction-expanded">
                              <div className="details-grid">
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Transaction ID</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.id || tx.txnId || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Reference</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.reference || tx.refId || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mode</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.mode || tx.paymentMode || 'UPI'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Narration</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.narration || tx.description || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Counterparty VPA</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.vpa || tx.counterpartyVpa || '-'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Timestamp</span>
                                  <span className="value" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{tx.timestamp || tx.date || new Date().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                       );
                    })}
                  </>
                )}
              </div>
              {/* Pagination Controls */}
              {renderPagination()}
            </div>
          ) : activeSection === "Consent" ? (
            <SetuProvider>
              <ConsentManager />
            </SetuProvider>
          ) : activeSection === "Chat" ? (
            <AIChatPage activeConsents={activeConsents} />
          ) : (
            renderDashboardHome()
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
