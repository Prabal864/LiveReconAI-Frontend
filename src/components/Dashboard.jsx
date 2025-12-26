import React from "react";
import "../index.css";

const Dashboard = () => {
  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="logo"> <span className="logo-icon">⚡</span> LiveRecon </div>
        <nav>
          <ul>
            <li>Home</li>
            <li>Transactions</li>
            <li>Budgeting</li>
            <li>Investments</li>
            <li className="active">Analytics</li>
            <li>Anomalies</li>
            <li>Chat</li>
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
          <div className="dashboard-row">
            <div className="dashboard-card dashboard-spend">
              <div>Total Spend</div>
              <div className="spend-amount">₹42,593</div>
              <div className="spend-change">+12.5% <span>vs last month</span></div>
              <div className="spend-tabs" style={{gap:'12px'}}>
                <button
                  className="dashboard-btn-gradient"
                  style={{
                    background: 'linear-gradient(90deg,#a259ff,#ff6bcb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 28px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 2px 16px #a259ff33',
                    transition: 'background 0.2s',
                    outline: 'none',
                  }}
                >
                  Expenses
                </button>
                <button
                  className="dashboard-btn-gradient"
                  style={{
                    background: 'linear-gradient(90deg,#00cfff,#a259ff)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 28px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 2px 16px #00cfff33',
                    transition: 'background 0.2s',
                    outline: 'none',
                  }}
                >
                  Income
                </button>
                <button
                  className="dashboard-btn-gradient"
                  style={{
                    background: 'linear-gradient(90deg,#ff6bcb,#a259ff)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 28px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 2px 16px #ff6bcb33',
                    transition: 'background 0.2s',
                    outline: 'none',
                  }}
                >
                  Savings
                </button>
              </div>
              <div className="spend-bar-chart">
                {/* Bar chart mockup */}
                <div className="bar-chart">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                    <div key={m} className={i===10?"bar bar-active":"bar"}></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="dashboard-card dashboard-categories">
              <div>Top Categories</div>
              <div className="category-row"><span>Food & Dining</span><span className="category-bar food"></span><span>₹12,400</span></div>
              <div className="category-row"><span>Transportation</span><span className="category-bar transport"></span><span>₹8,200</span></div>
              <div className="category-row"><span>Entertainment</span><span className="category-bar entertainment"></span><span>₹4,500</span></div>
            </div>
            <div className="dashboard-card dashboard-budget">
              <div>Budget Status</div>
              <div className="budget-circle">
                <span>72%</span>
                <span>Safe</span>
              </div>
              <div>of monthly limit used</div>
            </div>
          </div>
          <div className="dashboard-row">
            <div className="dashboard-card dashboard-transactions">
              <div>Recent Transactions <span className="view-all">View All</span></div>
              <div className="transaction-list">
                <div className="transaction netflix"><span className="icon">N</span>Netflix Subscription <span className="date">Today, 10:00 AM</span> <span className="amount">-₹649</span></div>
                <div className="transaction uber"><span className="icon">U</span>Uber Ride <span className="date">Yesterday, 6:30 PM</span> <span className="amount">-₹450</span></div>
                <div className="transaction salary"><span className="icon">S</span>Salary Credit <span className="date">Oct 30, 9:00 AM</span> <span className="amount credit">+₹85,000</span></div>
              </div>
            </div>
            <div className="dashboard-card dashboard-recurring">
              <div>Recurring Payments <span className="next-days">Next 7 Days</span></div>
              <div className="recurring-list">
                <div className="recurring spotify"><span className="dot"></span>Spotify Premium <span className="recurring-bar"></span> <span>₹119</span> <span className="due">Due Tomorrow</span></div>
                <div className="recurring internet"><span className="dot"></span>Internet Bill <span className="recurring-bar"></span> <span>₹999</span> <span className="due">Due in 3 days</span></div>
                <div className="recurring gym"><span className="dot"></span>Gym Membership <span className="recurring-bar"></span> <span>₹2,500</span> <span className="due">Due in 5 days</span></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
