import "../styles/DashboardRedesign.css";
import React, { useMemo, useState, useEffect } from "react";
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
  Legend
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
  User,
  Edit,
  ChevronDown
} from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import "../index.css";
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
  const [graphTimeRange, setGraphTimeRange] = useState("Weekly"); // State for Graph Time Range
  const [isStackExpanded, setIsStackExpanded] = useState(false); // New State for Stack Animation
  const [consentId, setConsentId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const { transactions, allTransactions, loading, error, fetchTransactionsViaSession, total, paginate, rawResponse, notification, loadingMessage } = useTransactionsByConsentId();
  
  const [activeConsents] = useState(() => {
    const saved = localStorage.getItem('setu_consents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(c => c.status === 'ACTIVE');
      } catch (error) {
        console.error("Error parsing setu_consents:", error);
        return [];
      }
    }
    return [];
  });

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
        
        let income = 0;
        let spending = 0;
        let count = 0;
        const spendingCategories = {};
        let allTxList = [];

        results.forEach(data => {
            const txs = Array.isArray(data) ? data : (data?.transactions || []);
            count += txs.length;
            allTxList = [...allTxList, ...txs];
            txs.forEach(t => {
                const amount = Number(t.amount);
                if (!isNaN(amount)) {
                    if (t.type === 'CREDIT') {
                        income += amount;
                    } else if (t.type === 'DEBIT') {
                        spending += amount;

                        // Categorization Logic (Reuse existing logic)
                        let category = 'Others';
                        const narration = (t.narration || '').toLowerCase();
                        const mode = (t.mode || '').toLowerCase();

                        if (mode.includes('upi') || narration.includes('upi')) category = 'UPI Payments';
                        else if (mode.includes('imps') || mode.includes('neft') || mode.includes('rtgs')) category = 'Transfers';
                        else if (mode.includes('card') || narration.includes('pos') || narration.includes('visa') || narration.includes('mastercard')) category = 'Card Spend';
                        else if (mode.includes('atm') || narration.includes('atm') || narration.includes('withdraw')) category = 'Cash Withdrawal';
                        else if (narration.includes('interest')) category = 'Bank Charges/Interest';
                        else if (narration.includes('food') || narration.includes('zomato') || narration.includes('swiggy')) category = 'Food & Dining';
                        else if (narration.includes('uber') || narration.includes('ola') || narration.includes('fuel')) category = 'Transport';

                        spendingCategories[category] = (spendingCategories[category] || 0) + amount;
                    }
                }
            });
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

        // Calculate Money Flow based on Time Range
        const dailyStats = [];
        const daysToStats = graphTimeRange === "Monthly" ? 30 : 7;
        
        // Initialize buckets (Oldest -> Newest)
        const normalizeDate = (d) => {
           const n = new Date(d);
           n.setHours(0, 0, 0, 0);
           return n;
        };
        
        // 1. Determine Anchor Date (Latest Transaction Date vs Today)
        let anchorDate = new Date();
        if (allTxList.length > 0) {
            const timestamps = allTxList
                .map(t => t.date || t.timestamp || t.valueDate)
                .map(ts => new Date(ts).getTime())
                .filter(ts => !isNaN(ts));
                
            if (timestamps.length > 0) {
                const maxTs = Math.max(...timestamps);
                const latestTxDate = new Date(maxTs);
                
                // If the latest transaction is older than yesterday, use it as anchor
                // ignoring future dates for safety
                if (latestTxDate < new Date() && (new Date().getTime() - maxTs > 86400000 * 2)) {
                   anchorDate = latestTxDate;
                }
            }
        }
        
        const todayNormalized = normalizeDate(anchorDate);

        for (let i = daysToStats - 1; i >= 0; i--) {
            const d = new Date(todayNormalized);
            d.setDate(todayNormalized.getDate() - i);
            
            dailyStats.push({ 
                dateObj: d, // Keep the object for comparison debugging
                name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                income: 0, 
                expense: 0 
            });
        }

        allTxList.forEach(t => {
            // Robust Date Parsing
            let rawDate = t.date || t.timestamp || t.bookingDate || t.valueDate;
            if (!rawDate) return;

            let tDate = new Date(rawDate);
            if (isNaN(tDate.getTime())) return;

            const tDateNormalized = normalizeDate(tDate);
            
            // Calculate difference in milliseconds
            const diffMs = todayNormalized.getTime() - tDateNormalized.getTime();
            // Convert to Days (round primarily to handle DST shifts if any, but simplified)
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            // diffDays = 0 => Anchor Date (Today/Latest)
            // diffDays = 1 => Yesterday
            // We only care if 0 <= diffDays < daysToStats
            if (diffDays >= 0 && diffDays < daysToStats) {
                 // Map diffDays to array index.
                 // Array is sorted: [Oldest, ..., Yesterday, Today]
                 // Index of Today (diffDays=0) should be length-1.
                 // Index of Yesterday (diffDays=1) should be length-2.
                 const index = dailyStats.length - 1 - diffDays;
                 
                 if (index >= 0 && index < dailyStats.length) {
                    const amount = Number(t.amount || t.value || 0);
                    if (!isNaN(amount)) {
                         const type = String(t.type || t.transactionType || '').toUpperCase();
                         
                         // Check for Credit
                         if (type === 'CREDIT' || type === 'CR' || type === 'INCOME') {
                            dailyStats[index].income += amount;
                         } 
                         // Check for Debit
                         else if (type === 'DEBIT' || type === 'DR' || type === 'EXPENSE' || (String(t.amount).startsWith('-'))) {
                            dailyStats[index].expense += Math.abs(amount);
                         }
                    }
                 }
            }
        });

        // Use dailyStats for the graphData
        const spendingTrend = dailyStats; 

        // Get Top Expenses (Highest Debit Transactions)
        const topExpenses = allTxList
            .filter(t => t.type === 'DEBIT')
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .slice(0, 5);

        setDashboardStats({
            totalIncome: income,
            totalSpending: spending,
            netSavings: netSavings,
            balance: balance,
            transactionCount: count,
            topSpendingCategory: topCategory,
            loading: false,
            spendingTrend, // Now contains dailyStats array with income/expense
            topExpenses,
            spendingCategories
        });

      } catch (error) {
        console.error("Error calculating dashboard stats:", error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    calculateStats();
  }, [activeConsents, selectedConsentId, graphTimeRange]); // Re-run when selection or time range changes

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
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
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

  const renderPagination = () => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const pages = [];
    // Always show first page
    pages.push(1);

    if (page > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <div className="pagination-container">
        <button 
          className="page-nav-btn"
          onClick={() => handlePageChange(page - 1)}
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
              disabled={p === '...'}
            >
              {p}
            </button>
          ))}
        </div>

        <button 
          className="page-nav-btn"
          onClick={() => handlePageChange(page + 1)}
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

    return (
        <div className="widget-card" style={{gridColumn: '1 / -1', minHeight: '380px'}}>
            <div className="graph-header-row">
                <div>
                   <h3 className="widget-title">Money Flow</h3>
                   <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Income vs Expenses</div>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <div className="time-period-selector active" style={{minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {startDate} - {endDate}
                    </div>
                    <select 
                        className="modern-dropdown compact"
                        value={graphTimeRange}
                        onChange={(e) => setGraphTimeRange(e.target.value)}
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                    </select>
                </div>
            </div>
            
            <div style={{width: '100%', height: '300px', display: 'flex', justifyContent: 'center'}}>
                 {/* Fixed dimensions to prevent layout resize errors */}
                 <AreaChart
                    width={600}
                    height={300}
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
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
                        interval={graphTimeRange === 'Monthly' ? 4 : 0}
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
    <div className="dashboard-row-split">
        {/* Savings / Goals Widget */}
        <div className="widget-card">
            <div className="widget-header">
                <span className="widget-title">Saving Goals</span>
                <select style={{background:'transparent', border:'none', color:'#888', cursor:'pointer'}}><option>This Month</option></select>
            </div>
            <div className="savings-list">
                 <div className="saving-item">
                     <div className="saving-info">
                        <div className="saving-meta">
                            <div className="saving-icon">💰</div>
                            <span>Mutual Funds</span>
                        </div>
                        <span>$900.17</span>
                     </div>
                     <div className="progress-bg"><div className="progress-fill" style={{width: '65%', background: 'var(--accent-purple)'}}></div></div>
                 </div>

                 <div className="saving-item">
                     <div className="saving-info">
                        <div className="saving-meta">
                            <div className="saving-icon" style={{color:'#22c55e', background: 'rgba(34,197,94,0.1)'}}>📈</div>
                            <span>Investments</span>
                        </div>
                        <span>$745.78</span>
                     </div>
                     <div className="progress-bg"><div className="progress-fill" style={{width: '45%', background: '#22c55e'}}></div></div>
                 </div>

                 <div className="saving-item">
                     <div className="saving-info">
                        <div className="saving-meta">
                             <div className="saving-icon" style={{color:'#ef4444', background: 'rgba(239,68,68,0.1)'}}>✈️</div>
                             <span>Travel Goal</span>
                        </div>
                        <span>$2,500.00</span>
                     </div>
                     <div className="progress-bg"><div className="progress-fill" style={{width: '25%', background: '#ef4444'}}></div></div>
                 </div>
            </div>
        </div>

        {/* Statistics Pie Chart Widget */}
        <div className="widget-card">
            <div className="widget-header">
                <span className="widget-title">Spend Analysis</span>
            </div>
            <div className="donut-container" style={{display:'flex', flexDirection:'column', height:'100%', minHeight: '220px', alignItems: 'center', justifyContent: 'center'}}>
                 {hasData ? (
                    <PieChart width={250} height={250}>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
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
    </div>
  );
  };

  // --- New Render Functions for the Design UI ---

  const renderDashboardHome = () => (
    <div className="dashboard-container-v2">
        {/* Header / Filter Bar */}
        <div className="dashboard-filter-bar">
            <div className="filter-group">
                <span className="filter-label">Financial Overview For:</span>
                <select 
                    value={selectedConsentId}
                    onChange={(e) => setSelectedConsentId(e.target.value)}
                    className="modern-dropdown"
                >
                    <option value="ALL">All Accounts (Consolidated)</option>
                    {activeConsents.map(c => {
                         const label = c.start 
                            ? `Card ending in ...${c.id.slice(-4)}` 
                            : (c.vua ? `${c.vua.split('@')[0]} (${c.vua.split('@')[1] || 'VUA'})` : `Consent ID: ${c.id.slice(0,8)}...`);
                         return (
                            <option key={c.id} value={c.id}>{label}</option>
                         );
                    })}
                </select>
            </div>
            
            <div className="filter-actions">
                 <span style={{ fontSize: '0.85rem', color: '#888' }}>
                    {dashboardStats.loading ? 'Syncing...' : `Last updated: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                 </span>
            </div>
        </div>

        <div className="dashboard-content-grid">
            {/* Main Column */}
            <div className="main-content">
                {/* 3-Column Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Total Income</span>
                            <h3 className="stat-value">{dashboardStats.loading ? "..." : formatCurrency(dashboardStats.totalIncome, "₹")}</h3>
                            {renderMiniChart('white')}
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Total Spending</span>
                            <h3 className="stat-value">{dashboardStats.loading ? "..." : formatCurrency(dashboardStats.totalSpending, "₹")}</h3>
                            {renderMiniChart('rgba(255,255,255,0.5)')}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Top Category</span>
                             <h3 className="stat-value" style={{fontSize: '1.2rem'}}>{dashboardStats.loading ? "..." : dashboardStats.topSpendingCategory}</h3>
                             {renderMiniChart('var(--accent-purple)')}
                        </div>
                    </div>
                </div>

                {/* Money Flow Graph */}
                {renderSpendingGraph()}

                {/* Savings & Stats Row */}
                {renderStatisticsAndSavings()}

                {/* Highest Value Transactions Table */}
                <div className="invoices-section">
                    <div className="section-header">
                        <h3>Highest Value Transactions</h3>
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
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardStats.topExpenses.map((tx, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="tx-name-wrap">
                                                <div className="tx-icon-box">🧾</div>
                                                <span style={{fontWeight:500}}>{tx.narration || tx.id || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(tx.date || tx.timestamp).toLocaleDateString()}</td>
                                        <td>{tx.mode || 'Payment'}</td>
                                        <td style={{color: '#ef4444', fontWeight: '700'}}>{formatCurrency(tx.amount, "₹")}</td>
                                        <td><span className="status-badge complete">Completed</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-chart-msg">No relevant transactions found.</div>
                    )}
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="sidebar-content">
                <div className="right-widget payment-widget">
                    <h3>Linked Account</h3>
                    
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
                             const isTop = i === 0;
                             
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
                                    <div className="credit-card" style={{ background: styleObj.background, marginBottom: '0', cursor: 'pointer' }}>
                                        {/* Noise Texture & Shine Effect */}
                                        <div className="card-noise" />
                                        <div className="card-shine" />
                                        
                                        <div className="card-content">
                                            <div className="card-top">
                                                <div className="card-chip" />
                                                <div className="card-contactless" style={{opacity: 0.9}}>
                                                    {/* Contactless Wave Icon */}
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(45deg)'}}>
                                                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 4 3.5 6 6.5"/>
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="card-number">{displayId}</div>

                                            <div className="card-bottom">
                                                <div className="card-info-group">
                                                    <label>Holder</label>
                                                    <div>{consent.vua || 'Unknown User'}</div>
                                                    <div className="card-logo" style={{marginTop: '4px'}}>SETU</div>
                                                </div>
                                                <div className="card-info-group" style={{textAlign: 'right'}}>
                                                    <label>Created</label>
                                                    <div>{new Date(consent.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                        {activeConsents.length > 1 && !isStackExpanded && (
                            <div className="card-stack-hint">
                                Click to view {activeConsents.length} cards
                            </div>
                        )}
                    </div>

                    <button className="add-payment-btn" onClick={() => setActiveSection('Consent')}>Manage Accounts</button>
                    
                    <div className="widget-card" style={{marginTop: '24px', padding: '20px'}}>
                        <h4 style={{marginBottom: '16px'}}>Recent Activity</h4>
                        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#f0f9ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#2563eb'}}>S</div>
                                <div><div style={{fontSize:'0.9rem', fontWeight:600}}>Stripe</div><div style={{fontSize:'0.75rem', color:'#888'}}>Today, 7:18 AM</div></div>
                                <div style={{marginLeft:'auto', fontWeight:600, color:'#22c55e'}}>+$658.10</div>
                            </div>
                            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                                <div style={{width:'36px', height:'36px', borderRadius:'50%', background:'#fdf2f8', display:'flex', alignItems:'center', justifyContent:'center', color:'#db2777'}}>F</div>
                                <div><div style={{fontSize:'0.9rem', fontWeight:600}}>Facebook</div><div style={{fontSize:'0.75rem', color:'#888'}}>Yesterday</div></div>
                                <div style={{marginLeft:'auto', fontWeight:600, color:'#ef4444'}}>- $425.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const sectionInfo = {
    Dashboard: { title: "Dashboard", subtitle: "Overview of your financial activity" },
    Statistics: { title: "Statistics", subtitle: "Analyze your spending habits" },
    Savings: { title: "Savings", subtitle: "Track your savings goals" },
    Portfolio: { title: "Portfolio", subtitle: "Manage your investments" },
    Messages: { title: "Messages", subtitle: "Recent communications" },
    Transactions: { title: "Transactions", subtitle: "Review your transaction history" },
    Consent: { title: "Consent Management", subtitle: "Manage your financial data consents securely" },
    Settings: { title: "Settings", subtitle: "Account configuration" },
    Appearances: { title: "Appearances", subtitle: "Customize your view" },
    Help: { title: "Help", subtitle: "Support and documentation" },
  };

  const currentInfo = sectionInfo[activeSection] || { title: activeSection, subtitle: "" };

  return (
    <div className={`dashboard-root ${theme === "light" ? "theme-light" : ""}`}>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon-box"><Zap size={20} fill="currentColor" /></div>
          <span className="logo-text">VittaManthan</span>
        </div>
        
        <div className="nav-section-label">MENU</div>
        <nav>
          <ul>
            <li className={activeSection === "Dashboard" ? "active" : ""} onClick={() => setActiveSection("Dashboard")}>
              <span className="icon"><LayoutDashboard size={20} /></span> Dashboard
            </li>
            <li className={activeSection === "Statistics" ? "active" : ""} onClick={() => setActiveSection("Statistics")}>
              <span className="icon"><BarChart2 size={20} /></span> Statistics
            </li>
            <li className={activeSection === "Savings" ? "active" : ""} onClick={() => setActiveSection("Savings")}>
              <span className="icon"><PiggyBank size={20} /></span> Savings
            </li>
            <li className={activeSection === "Portfolio" ? "active" : ""} onClick={() => setActiveSection("Portfolio")}>
              <span className="icon"><Briefcase size={20} /></span> Portfolio
            </li>
            <li className={activeSection === "Messages" ? "active" : ""} onClick={() => setActiveSection("Messages")}>
              <span className="icon"><MessageSquare size={20} /></span> Messages <span className="badge">4</span>
            </li>
            <li className={activeSection === "Transactions" ? "active" : ""} onClick={() => setActiveSection("Transactions")}>
              <span className="icon"><ArrowRightLeft size={20} /></span> Transactions
            </li>
            <li className={activeSection === "Consent" ? "active" : ""} onClick={() => setActiveSection("Consent")}>
              <span className="icon"><FileCheck size={20} /></span> Consent
            </li>
          </ul>
        </nav>

        <div className="nav-section-label">GENERAL</div>
        <nav>
          <ul>
            <li className={activeSection === "Settings" ? "active" : ""} onClick={() => setActiveSection("Settings")}>
              <span className="icon"><Settings size={20} /></span> Settings
            </li>
            <li className={activeSection === "Appearances" ? "active" : ""} onClick={() => setActiveSection("Appearances")}>
              <span className="icon"><Palette size={20} /></span> Appearances
            </li>
            <li className={activeSection === "Help" ? "active" : ""} onClick={() => setActiveSection("Help")}>
              <span className="icon"><HelpCircle size={20} /></span> Help
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-link" onClick={handleLogout}>
            <span className="icon"><LogOut size={20} /></span> Log Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h2>{currentInfo.title}</h2>
            <p>{currentInfo.subtitle}</p>
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
              {/* Active Consents Carousel */}
              {activeConsents.length > 0 && (
                <div className="active-consents-carousel">
                  <h3>Active Consents</h3>
                  <div className="carousel-track">
                    {activeConsents.map((consent, index) => {
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
                              minWidth: '360px',
                              height: '230px',
                              cursor: 'pointer',
                              border: consentId === consent.id ? '2px solid #fff' : 'none',
                              transform: consentId === consent.id ? 'scale(1.02)' : 'scale(1)',
                              padding: '1.5rem'
                          }}
                        >
                          <div className="card-shine"></div>
                          
                          {/* Top Row */}
                          <div className="card-top-row">
                              <div className="provider-logo" style={{ fontSize: '1.2rem' }}>SETU<span className="font-light">CONSENT</span></div>
                              <div className="status-badge-pill">
                                  <span className={`status-dot-pulse ${consent.status?.toLowerCase()}`}></span>
                                  <span className="status-label">{consent.status}</span>
                              </div>
                          </div>

                          {/* Chip Row - Contactless Only */}
                          <div className="card-chip-row">
                              <div className="contactless-symbol" style={{ marginLeft: 'auto' }}>
                                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                                      <path d="M12 10.9c-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1z" fill="rgba(255,255,255,0.8)" />
                                      <path d="M14.8 13.7c1.4-1.4 1.4-3.7 0-5.1-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.7 0 7.9-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.6)" />
                                      <path d="M17.6 16.5c2.9-2.9 2.9-7.7 0-10.6-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 3.7 3.7 3.7 9.6 0 13.4-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.4)" />
                                  </svg>
                              </div>
                          </div>
                          
                          <div className="card-number-large" style={{ fontSize: '1.4rem', margin: 'auto 0', letterSpacing: '2px' }}>{displayId}</div>

                          <div className="card-bottom-row" style={{ marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div className="card-info-col">
                                  <span className="card-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', marginBottom: '4px', display: 'block', letterSpacing: '1px' }}>CONSENT HOLDER</span>
                                  <span className="card-value" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{consent.vua ? consent.vua.split('@')[0].toUpperCase() : 'UNKNOWN'}</span>
                                </div>
                                <div className="card-info-col">
                                  <span className="card-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', marginBottom: '4px', display: 'block', letterSpacing: '1px' }}>CREATED</span>
                                  <span className="card-value" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{new Date(consent.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="card-logo-circles">
                                <div className="circle red" style={{ width: '36px', height: '36px' }}></div>
                                <div className="circle yellow" style={{ width: '36px', height: '36px' }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
          ) : (
            renderDashboardHome()
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
