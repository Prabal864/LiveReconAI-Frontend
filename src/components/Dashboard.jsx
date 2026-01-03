import React, { useMemo, useState } from "react";
import { useTransactionsByConsentId } from "../hooks/useTransactionsByConsentId";
import "../index.css";
import "../styles/Transactions.css";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [theme, setTheme] = useState("dark");
  const [consentId, setConsentId] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { transactions, allTransactions, loading, error, fetchTransactions, total, paginate, rawResponse } = useTransactionsByConsentId();
  const [lastUpdated, setLastUpdated] = useState(null);

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

  // --- New Render Functions for the Design UI ---

  const renderDashboardHome = () => (
    <div className="dashboard-home-grid">
      {/* Left Column (Main) */}
      <div className="dashboard-main-col">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon sales">🛍️</div>
            <div className="stat-info">
              <span className="stat-label">Total Sales</span>
              <h3 className="stat-value">$987,454</h3>
            </div>
            <span className="stat-badge success">↑ 9.2%</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon experience">📦</div>
            <div className="stat-info">
              <span className="stat-label">Total Experience</span>
              <h3 className="stat-value">$546,654</h3>
            </div>
            <span className="stat-badge danger">↓ 5.9%</span>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">🎁</div>
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <h3 className="stat-value">$575,584</h3>
            </div>
            <span className="stat-badge success">↑ 7.4%</span>
          </div>
        </div>

        {/* Balance & Chart Row */}
        <div className="balance-chart-row">
          <div className="balance-section">
            <div className="balance-header">
              <span className="balance-label">My Balance</span>
              <h2 className="balance-amount">$154.54,85,00</h2>
              <span className="balance-sub">You Made An Extra $58,313.00 In This Years</span>
            </div>
            <div className="balance-actions">
              <button className="action-btn"><span className="icon">+</span> Add</button>
              <button className="action-btn"><span className="icon">↻</span> Convert</button>
              <button className="action-btn"><span className="icon">↗</span> Send</button>
              <button className="action-btn"><span className="icon">↙</span> Receive</button>
              <button className="action-btn"><span className="icon">•••</span> More</button>
            </div>
          </div>
          <div className="chart-section">
             {/* Simple CSS Bar Chart Placeholder */}
             <div className="simple-bar-chart">
                {[30, 50, 40, 70, 90, 60, 45].map((h, i) => (
                  <div key={i} className="chart-bar-wrapper">
                    <div className={`chart-bar ${i===4 ? 'active':''}`} style={{height: `${h}%`}}></div>
                    <span className="chart-label">Nov {12+i}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="invoices-section">
          <div className="section-header">
            <h3>Invoices</h3>
            <button className="new-invoice-btn">+ New Invoice</button>
          </div>
          <table className="invoices-table">
            <thead>
              <tr>
                <th>NUMBER</th>
                <th>DATE</th>
                <th>CLIENT NAME</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="icon">📄</span> WAL3241</td>
                <td>April 28, 2016</td>
                <td>Arlene McCoy</td>
                <td>$154.54,85,00</td>
                <td><span className="status-badge complete">Complete</span></td>
              </tr>
              <tr>
                <td><span className="icon">📄</span> WAL3241</td>
                <td>April 28, 2016</td>
                <td>Arlene McCoy</td>
                <td>$154.54,85,00</td>
                <td><span className="status-badge pending">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column (Sidebar Widgets) */}
      <div className="dashboard-right-col">
        {/* Payment Method */}
        <div className="right-widget payment-widget">
          <h3>Payment Method</h3>
          <div className="credit-card">
            <div className="card-top">
              <div className="card-chip"></div>
              <div className="card-contactless">)))</div>
            </div>
            <div className="card-number">4557 1475 1474 1447</div>
            <div className="card-bottom">
              <div className="card-balance">
                <span>Balance</span>
                <h4>$245,875</h4>
              </div>
              <div className="card-expiry">
                <span>Exp Date</span>
                <h4>02/24</h4>
              </div>
            </div>
            <div className="card-logo"></div>
          </div>
          <button className="add-payment-btn">+ Add Payment Method</button>
        </div>

        {/* Recent Transactions List */}
        <div className="right-widget recent-widget">
          <div className="widget-header">
            <h3>Recent</h3>
            <button className="more-btn">•••</button>
          </div>
          <div className="recent-list">
            {[
              {name: 'Esther Howard', date: 'September 5, 2013', amount: '↑ 10.2%', type: 'Transfer'},
              {name: 'Ralph Edwards', date: 'September 5, 2013', amount: '↑ 11.2%', type: 'Transfer'},
              {name: 'Dianne Russell', date: 'May 31, 2015', amount: '↓ 4.2%', type: 'Subscription', down: true},
              {name: 'Courtney Henry', date: 'April 28, 2016', amount: '↑ 58.6%', type: 'Transfer'},
              {name: 'Ronald Richards', date: 'October 25, 2019', amount: '↓ 7.5%', type: 'Transfer', down: true},
            ].map((item, i) => (
              <div key={i} className="recent-item">
                <div className="recent-avatar"></div>
                <div className="recent-info">
                  <h4>{item.name}</h4>
                  <span>{item.date}</span>
                </div>
                <div className={`recent-amount ${item.down ? 'down' : 'up'}`}>
                  <h4>{item.amount}</h4>
                  <span>{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`dashboard-root ${theme === "light" ? "theme-light" : ""}`}>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon-box">⚡</div>
          <span className="logo-text">FINPEAK</span>
        </div>
        
        <div className="nav-section-label">MENU</div>
        <nav>
          <ul>
            <li className={activeSection === "Dashboard" ? "active" : ""} onClick={() => setActiveSection("Dashboard")}>
              <span className="icon">::</span> Dashboard
            </li>
            <li className={activeSection === "Statistics" ? "active" : ""} onClick={() => setActiveSection("Statistics")}>
              <span className="icon">📊</span> Statistics
            </li>
            <li className={activeSection === "Savings" ? "active" : ""} onClick={() => setActiveSection("Savings")}>
              <span className="icon">💾</span> Savings
            </li>
            <li className={activeSection === "Portfolio" ? "active" : ""} onClick={() => setActiveSection("Portfolio")}>
              <span className="icon">💼</span> Portfolio
            </li>
            <li className={activeSection === "Messages" ? "active" : ""} onClick={() => setActiveSection("Messages")}>
              <span className="icon">✉️</span> Messages <span className="badge">4</span>
            </li>
            <li className={activeSection === "Transactions" ? "active" : ""} onClick={() => setActiveSection("Transactions")}>
              <span className="icon">💸</span> Transactions
            </li>
          </ul>
        </nav>

        <div className="nav-section-label">GENERAL</div>
        <nav>
          <ul>
            <li className={activeSection === "Settings" ? "active" : ""} onClick={() => setActiveSection("Settings")}>
              <span className="icon">⚙️</span> Settings
            </li>
            <li className={activeSection === "Appearances" ? "active" : ""} onClick={() => setActiveSection("Appearances")}>
              <span className="icon">🎨</span> Appearances
            </li>
            <li className={activeSection === "Help" ? "active" : ""} onClick={() => setActiveSection("Help")}>
              <span className="icon">❓</span> Help
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-link" onClick={() => alert('Logged out!')}>
            <span className="icon">🚪</span> Log Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h2>Good Morning, Ralph Edwards 👋</h2>
            <p>Here's What Happened In Your Wally Account Today</p>
          </div>
          <div className="header-right">
            <button className="icon-btn">🔍</button>
            <button className="icon-btn">🔔</button>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <div className="user-profile">
              <div className="avatar"></div>
              <div className="user-info">
                <span className="name">Ralph Edwards</span>
                <span className="email">ralph.edwards@gmail.com</span>
              </div>
              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content-wrapper">
          {activeSection === "Transactions" ? (
            <div className="transactions-panel">
               {/* Existing Transactions Logic */}
               <div className="transactions-header">
                <div className="transactions-title-wrap">
                  <span className="transactions-title">Transactions by Consent ID</span>
                  <span className="transactions-subtitle">Consent-scoped feed with inline insights</span>
                </div>
                <div className="header-actions">
                  {lastUpdated && (
                    <span className="last-updated">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
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
                {loading && <div className="loading-spinner">Loading...</div>}
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
                      <div className="th-item">Status</div>
                      <div className="th-item">Action</div>
                    </div>
                    {transactions.map((tx, idx) => {
                       const title = tx.merchant || tx.counterparty || tx.counterpartyName || tx.payee || tx.title || tx.narration || tx.type || tx.category || 'Transaction';
                       const amountRaw = tx.amount || tx.value || tx.price || tx.total || 0;
                       const currency = (typeof tx.currency === 'string' && tx.currency.length === 1) ? tx.currency : currencySymbol;
                       const status = tx.status || tx.state || 'Success';
                       const type = (tx.type || tx.transactionType || '').toUpperCase();
                       const isDebit = type === 'DEBIT' || type === 'DR' || (String(amountRaw).startsWith('-'));
                       const signedAmount = parseAmount(amountRaw);
                       const amountVal = Math.abs(signedAmount);
                       const amountSign = isDebit ? '-' : '+';
                       const amountColor = isDebit ? '#ff4d4d' : '#2ee59d';
                       
                       return (
                        <div key={idx} className={`transaction-card ${expandedIdx === idx ? 'expanded' : ''}`}>
                          <div className="transaction-row">
                            <div className="td-item td-transaction">
                              <div className="t-icon">💸</div>
                              <div className="t-copy">
                                <div className="t-head"><span className="t-title">{String(title)}</span></div>
                              </div>
                            </div>
                            <div className="td-item td-amount" style={{color: amountColor}}>
                              {amountSign}{formatCurrency(amountVal, currency)}
                            </div>
                            <div className="td-item td-date">Today</div>
                            <div className="td-item td-status">{status}</div>
                            <div className="td-item td-action">
                              <button className="details-btn" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                                {expandedIdx === idx ? 'Close' : 'Details'}
                              </button>
                            </div>
                          </div>
                          {expandedIdx === idx && (
                            <div className="transaction-expanded">
                              <pre>{JSON.stringify(tx, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                       );
                    })}
                  </>
                )}
              </div>
              {/* Pagination Controls */}
              <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="page-btn"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Prev
                </button>
                <span className="page-info" style={{ color: 'var(--text-secondary)' }}>Page {page}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * pageSize >= total || loading}
                  className="page-btn"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            renderDashboardHome()
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
