import React, { useMemo, useState } from "react";
import { useTransactionsByConsentId } from "../hooks/useTransactionsByConsentId";
import "../index.css";
import "../styles/Transactions.css";

const Dashboard = () => {
  const navItems = [
    { label: "Home", icon: "🏠" },
    { label: "Transactions", icon: "💸" },
    { label: "Budgeting", icon: "📊" },
    { label: "Investments", icon: "📈" },
    { label: "Analytics", icon: "📊" },
    { label: "Anomalies", icon: "⚠️" },
    { label: "Chat", icon: "💬" },
  ];
  const [activeSection, setActiveSection] = useState("Analytics");
  const [consentId, setConsentId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { transactions, allTransactions, loading, error, fetchTransactions, total, paginate, rawResponse } = useTransactionsByConsentId();
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleSidebarClick = (itemLabel) => {
    setActiveSection(itemLabel);
  };

  const handleFetch = async () => {
    setPage(1);
    if (!consentId) {
      setLastUpdated(null);
      fetchTransactions(consentId, 1, pageSize);
      return;
    }
    await fetchTransactions(consentId, 1, pageSize);
    setLastUpdated(new Date());
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    paginate(newPage, pageSize);
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

  const renderAnalyticsOverview = () => (
    <>
      <div className="dashboard-row">
        <div className="dashboard-card dashboard-spend">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <h3 style={{color:'#94a3b8', fontSize:'0.9rem', fontWeight:'500'}}>Total Spend</h3>
            <div className="spend-amount">₹42,593</div>
            <div className="spend-change">+12.5% <span style={{color:'#94a3b8', fontWeight:'400'}}>vs last month</span></div>
          </div>
          <div className="spend-tabs">
            <button className="active">Expenses</button>
            <button>Income</button>
            <button>Savings</button>
          </div>
        </div>
        <div className="bar-chart">
          {[40, 60, 35, 80, 55, 90, 45, 70, 30, 50, 85, 60].map((h, i) => (
            <div key={i} className={`bar ${i === 5 ? 'bar-active' : ''}`} style={{height: `${h}%`}}></div>
          ))}
        </div>
        </div>

        <div className="dashboard-aside">
          <div className="dashboard-card dashboard-categories">
          <h3 style={{marginBottom:'24px'}}>Top Categories</h3>
          <div className="category-row">
            <span style={{width:'120px', fontSize:'0.9rem'}}>Food & Dining</span>
            <div className="category-bar food"><div className="category-bar-fill" style={{width:'75%'}}></div></div>
            <span style={{fontWeight:'600'}}>₹12,400</span>
          </div>
          <div className="category-row">
            <span style={{width:'120px', fontSize:'0.9rem'}}>Transportation</span>
            <div className="category-bar transport"><div className="category-bar-fill" style={{width:'45%'}}></div></div>
            <span style={{fontWeight:'600'}}>₹8,200</span>
          </div>
          <div className="category-row">
            <span style={{width:'120px', fontSize:'0.9rem'}}>Entertainment</span>
            <div className="category-bar entertainment"><div className="category-bar-fill" style={{width:'30%'}}></div></div>
            <span style={{fontWeight:'600'}}>₹4,500</span>
          </div>
          </div>

          <div className="dashboard-card dashboard-budget">
            <h3 style={{alignSelf:'flex-start', marginBottom:'16px'}}>Budget Status</h3>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
              <div>
                <div style={{fontSize:'1.4rem', fontWeight:800}}>72%</div>
                <div style={{color:'#94a3b8', fontSize:'0.9rem'}}>of monthly limit used</div>
              </div>
              <div className="budget-circle" style={{marginBottom: 0}}>
                <span style={{fontSize:'1.2rem'}}>72%</span>
                <span>Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card dashboard-transactions">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <h3 style={{margin: 0}}>Recent Transactions</h3>
            <span className="view-all" onClick={() => setActiveSection('Transactions')}>View All</span>
          </div>
          <div className="transaction-list">
            <div className="transaction netflix">
              <div className="icon">N</div>
              <div>
                <div style={{fontWeight: 700}}>Netflix Subscription</div>
                <div className="date">Today, 10:00 AM</div>
              </div>
              <div className="amount">-₹649</div>
            </div>
            <div className="transaction uber">
              <div className="icon">U</div>
              <div>
                <div style={{fontWeight: 700}}>Uber Ride</div>
                <div className="date">Yesterday, 6:30 PM</div>
              </div>
              <div className="amount">-₹450</div>
            </div>
            <div className="transaction salary">
              <div className="icon">S</div>
              <div>
                <div style={{fontWeight: 700}}>Salary Credit</div>
                <div className="date">Oct 30, 9:00 AM</div>
              </div>
              <div className="amount credit">+₹85,000</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card dashboard-recurring">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <h3 style={{margin: 0}}>Recurring Payments</h3>
            <span className="next-days">Next 7 Days</span>
          </div>
          <div className="recurring-list">
            <div className="recurring">
              <div className="dot" />
              <div style={{minWidth: 140}}>Spotify Premium</div>
              <div className="recurring-bar"><div className="recurring-bar-fill" style={{width:'70%'}} /></div>
              <div>
                <div style={{fontWeight: 700}}>₹119</div>
                <div className="due">Due tomorrow</div>
              </div>
            </div>
            <div className="recurring">
              <div className="dot" />
              <div style={{minWidth: 140}}>Internet Bill</div>
              <div className="recurring-bar"><div className="recurring-bar-fill" style={{width:'50%'}} /></div>
              <div>
                <div style={{fontWeight: 700}}>₹999</div>
                <div className="due">Due in 3 days</div>
              </div>
            </div>
            <div className="recurring">
              <div className="dot" />
              <div style={{minWidth: 140}}>Gym Membership</div>
              <div className="recurring-bar"><div className="recurring-bar-fill" style={{width:'35%'}} /></div>
              <div>
                <div style={{fontWeight: 700}}>₹2,500</div>
                <div className="due">Due in 5 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderBudgeting = () => (
    <div className="section-grid">
      {[{name:'Essentials', used:62, cap:'₹50k'}, {name:'Lifestyle', used:38, cap:'₹25k'}, {name:'Savings', used:48, cap:'₹30k'}].map((b) => (
        <div key={b.name} className="section-card">
          <div className="section-card-head">
            <span className="section-title">{b.name}</span>
            <span className="pill subtle">Cap {b.cap}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{width:`${b.used}%`}}></div>
          </div>
          <div className="progress-meta">
            <span>{b.used}% used</span>
            <span className="muted">{100-b.used}% left</span>
          </div>
        </div>
      ))}
      <div className="section-card stretch">
        <div className="section-card-head">
          <span className="section-title">Alerts & Recommendations</span>
          <span className="pill warn">Action needed</span>
        </div>
        <ul className="bullet-list">
          <li>Dining spend is 18% over trend; cap at ₹3k this week.</li>
          <li>Set an auto-transfer of ₹5k to savings on the 5th.</li>
          <li>Fuel cashback card could save ~₹800/month.</li>
        </ul>
      </div>
    </div>
  );

  const renderInvestments = () => (
    <div className="section-grid">
      <div className="section-card">
        <div className="section-card-head">
          <span className="section-title">Portfolio</span>
          <span className="pill success">+8.2% YTD</span>
        </div>
        <div className="stacked-list">
          {[{name:'Nifty 50 ETF', value:'₹2,40,000', change:'+1.2%'}, {name:'US Tech ETF', value:'₹1,10,500', change:'-0.4%'}, {name:'Midcap Fund', value:'₹90,200', change:'+0.9%'}].map((h) => (
            <div key={h.name} className="stacked-row">
              <span>{h.name}</span>
              <span>{h.value}</span>
              <span className={h.change.startsWith('-') ? 'text-danger' : 'text-success'}>{h.change}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="section-card">
        <div className="section-card-head">
          <span className="section-title">Allocation</span>
          <span className="pill subtle">Balanced</span>
        </div>
        <ul className="bullet-list">
          <li>Equity: 62% (tilt to large-cap)</li>
          <li>Debt: 28% (laddered)</li>
          <li>Cash: 10% (buffer)</li>
        </ul>
      </div>
    </div>
  );

  const renderAnomalies = () => (
    <div className="section-grid">
      <div className="section-card stretch">
        <div className="section-card-head">
          <span className="section-title">Recent Alerts</span>
          <span className="pill warn">Review</span>
        </div>
        <ul className="bullet-list">
          <li>Unusual spend spike: ₹12,400 on Food vs ₹5,800 avg.</li>
          <li>International transaction flagged: ₹18,900 at 2:10 AM.</li>
          <li>Subscription drift: 3 new recurring charges this month.</li>
        </ul>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="section-grid">
      <div className="section-card stretch">
        <div className="section-card-head">
          <span className="section-title">Chat</span>
          <span className="pill subtle">AI Assist</span>
        </div>
        <p className="muted">Ask anything about your spend, budgets, or investments. (Hook your chat component here.)</p>
        <button className="fetch-btn" style={{width:'fit-content', marginTop:'12px'}}>Open Chat</button>
      </div>
    </div>
  );

  const transactionSummary = useMemo(() => {
    if (!allTransactions || allTransactions.length === 0) {
      return { totalVolume: 0, avgTicket: 0, successRate: 0, totalCount: 0 };
    }

    const amounts = allTransactions.map((tx) => parseAmount(tx.amount || tx.value || tx.price || tx.total || 0)).filter((n) => Number.isFinite(n));
    const totalVolume = amounts.reduce((sum, val) => sum + Math.abs(val), 0);
    const totalCount = allTransactions.length;

    const successCount = allTransactions.filter((tx) => {
      const status = String(tx.status || tx.state || "").toLowerCase();
      return status.includes("success") || status.includes("confirm") || status.includes("complete") || status.includes("posted") || status === "ok";
    }).length;

    const avgTicket = totalCount ? totalVolume / totalCount : 0;
    const successRate = totalCount ? Math.round((successCount / totalCount) * 100) : 0;

    return { totalVolume, avgTicket, successRate, totalCount };
  }, [allTransactions]);

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="logo"> <span className="logo-icon">⚡</span> LiveRecon </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li
                key={item.label}
                className={activeSection === item.label ? "active" : ""}
                onClick={() => handleSidebarClick(item.label)}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="settings">Settings</div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Financial Analytics</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="dashboard-user">
              <select>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
              <div className="user-avatar"></div>
            </div>
            <button
              className="logout-btn"
              style={{
                background: 'linear-gradient(90deg,#a259ff,#ff6bcb)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #a259ff33',
                marginLeft: '12px',
                transition: 'background 0.2s',
              }}
              onClick={() => alert('Logged out!')}
            >
              Logout
            </button>
          </div>
        </header>
        <section className="dashboard-content">
          {activeSection === "Transactions" ? (
            <div className="transactions-panel">
              <div className="transactions-header">
                <div className="transactions-title-wrap">
                  <span className="transactions-title">Transactions by Consent ID</span>
                  <span className="transactions-subtitle">Consent-scoped feed with inline insights</span>
                </div>
                <div className="header-actions">
                  {lastUpdated && (
                    <span className="last-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  <button onClick={() => setActiveSection("Analytics")} className="close-btn">Back</button>
                </div>
              </div>

              <div className="transactions-meta">
                <div className="meta-left">
                  <span className="pill live-pill">Live feed</span>
                  <span className="muted">Securely scoped to your consent ID</span>
                </div>
                <div className="meta-chips">
                  <div className="meta-chip">
                    <span className="meta-label">Transactions</span>
                    <span className="meta-value">{transactionSummary.totalCount}</span>
                  </div>
                  <div className="meta-chip">
                    <span className="meta-label">Volume</span>
                    <span className="meta-value">{formatCurrency(transactionSummary.totalVolume, currencySymbol)}</span>
                  </div>
                  <div className="meta-chip">
                    <span className="meta-label">Success Rate</span>
                    <span className="meta-value">{transactionSummary.successRate}%</span>
                  </div>
                  <div className="meta-chip subdued">
                    <span className="meta-label">Avg Ticket</span>
                    <span className="meta-value">{formatCurrency(transactionSummary.avgTicket, currencySymbol)}</span>
                  </div>
                </div>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Enter Consent ID"
                  value={consentId}
                  onChange={e => setConsentId(e.target.value)}
                  className="consent-input"
                />
                <button
                  onClick={handleFetch}
                  className="fetch-btn"
                >
                  Fetch
                </button>
              </div>
              <div className="transactions-list">
                {loading && (
                  <div className="skeleton-list">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="skeleton-row">
                        <div className="skeleton-block w-20"></div>
                        <div className="skeleton-block w-15"></div>
                        <div className="skeleton-block w-25"></div>
                        <div className="skeleton-block w-15"></div>
                        <div className="skeleton-block w-10"></div>
                        <div className="skeleton-block w-10"></div>
                      </div>
                    ))}
                  </div>
                )}
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
                      <div className="th-item">Transaction</div>
                      <div className="th-item">Amount</div>
                      <div className="th-item">Date</div>
                      <div className="th-item">Payment Method</div>
                      <div className="th-item">Status</div>
                      <div className="th-item">Action</div>
                    </div>
                    {transactions.map((tx, idx) => {
                      // Filter out pk, sk, and any gsi fields
                      const filtered = Object.entries(tx).filter(([key]) => {
                        const k = key.toLowerCase();
                        return k !== 'pk' && k !== 'sk' && !k.startsWith('pk_gsi') && !k.startsWith('sk_gsi');
                      });
                      // Extract main fields for layout
                      const title = tx.merchant || tx.counterparty || tx.counterpartyName || tx.payee || tx.title || tx.narration || tx.type || tx.category || 'Transaction';
                      const amountRaw = tx.amount || tx.value || tx.price || tx.total || 0;
                      const currency = (typeof tx.currency === 'string' && tx.currency.length === 1) ? tx.currency : currencySymbol;
                      const status = tx.status || tx.state || 'Success';
                      const description = tx.description || tx.details || tx.note || tx.message || tx.narration || '';
                      const transactionId = tx.transactionId || tx.id || tx.txId || tx.txnId || '';
                      
                      // Enhanced Date Mapping
                      const date = tx.date || tx.timestamp || tx.time || tx.datetime || tx.bookingDate || tx.valueDate || tx.transactionTimestamp || tx.created_at || '';
                      
                      // Enhanced Payment Method Mapping
                      const paymentMethod = tx.mode || tx.paymentMode || tx.instrument || tx.method || tx.channel || 'N/A';

                      const iconType = (title || '').toLowerCase().includes('cashback') ? '🛒' : ((title || '').toLowerCase().includes('transfer') ? '💳' : '🏦');
                      
                      // Determine Credit/Debit
                      const type = (tx.type || tx.transactionType || '').toUpperCase();
                      const isDebit = type === 'DEBIT' || type === 'DR' || (String(amountRaw).startsWith('-'));
                      
                      const signedAmount = parseAmount(amountRaw);
                      const amountVal = Math.abs(signedAmount);
                      const amountSign = isDebit ? '-' : '+';
                      const amountColor = isDebit ? '#ff4d4d' : '#2ee59d'; // Red for debit, Green for credit
                      const statusKey = String(status).toLowerCase();
                      const statusTone = statusKey.includes('fail') || statusKey.includes('cancel') ? 'danger' : (statusKey.includes('pending') || statusKey.includes('processing')) ? 'warn' : 'success';

                      // Format date/time
                      let dateStr = '';
                      if (date) {
                        try {
                          const d = new Date(date);
                          dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch { dateStr = String(date); }
                      }
                      // Status color
                      return (
                        <div key={transactionId || idx} 
                          className={`transaction-card ${expandedIdx === idx ? 'expanded' : ''}`}
                        >
                          <div className="transaction-row">
                            <div className="td-item td-transaction">
                              <div className="t-icon">{iconType}</div>
                              <div className="t-copy">
                                <div className="t-head">
                                  <span className="t-title" title={String(title)}>{String(title)}</span>
                                  <span className={`direction-pill ${isDebit ? 'debit' : 'credit'}`}>{isDebit ? 'Debit' : 'Credit'}</span>
                                </div>
                                <span className="t-subtitle" title={transactionId ? String(transactionId) : undefined}>{transactionId || '—'}</span>
                                {description && <span className="t-description" title={description}>{description}</span>}
                              </div>
                            </div>
                            <div className={`td-item td-amount ${isDebit ? 'debit' : 'credit'}`} style={{color: amountColor}}>
                              <span className="amount-sign">{amountSign}</span>
                              <span className="amount-value">{formatCurrency(amountVal, currency)}</span>
                            </div>
                            <div className="td-item td-date">{dateStr || 'N/A'}</div>
                            <div className="td-item td-method">
                              <span className="method-pill">{paymentMethod}</span>
                            </div>
                            <div className="td-item td-status">
                              <span className={`status-pill ${statusTone}`}>{status}</span>
                            </div>
                            <div className="td-item td-action">
                              <button 
                                className="details-btn" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setExpandedIdx(expandedIdx === idx ? null : idx); 
                                }}
                              >
                                {expandedIdx === idx ? 'Close' : 'Details'}
                              </button>
                            </div>
                          </div>
                          {expandedIdx === idx && (
                            <div className="transaction-expanded">
                              <div className="expanded-title">Full Transaction Info</div>
                              <div className="expanded-grid">
                                {filtered.map(([key, value]) => (
                                  <div key={key} className="info-item">
                                    <span className="info-label">{key.replace(/_/g, ' ')}:</span>
                                    <span className="info-value">{typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}</span>
                                  </div>
                                ))}
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
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="page-btn"
                >
                  Prev
                </button>
                <span className="page-info">Page {page}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * pageSize >= total || loading}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          ) : activeSection === "Budgeting" ? (
            renderBudgeting()
          ) : activeSection === "Investments" ? (
            renderInvestments()
          ) : activeSection === "Anomalies" ? (
            renderAnomalies()
          ) : activeSection === "Chat" ? (
            renderChat()
          ) : (
            renderAnalyticsOverview()
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
