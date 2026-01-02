import { useState, useRef, useEffect } from 'react';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('Analytics');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Finance Assistant. Ask me about your spending, budget, or investment advice.", sender: 'bot', time: 'Just now' }
  ]);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Automated Chat Demo Sequence
  useEffect(() => {
    if (activeTab === 'Chat') {
      const timeouts = [];

      // Clear existing messages to start the demo fresh
      // Wrapped in setTimeout to avoid synchronous state update warning
      timeouts.push(setTimeout(() => {
        setMessages([]);
      }, 0));
      
      const demoSequence = [
        { text: "Can you analyze my spending patterns for this month?", sender: 'user', delay: 800 },
        { text: "Certainly! I've crunched the numbers. You've spent ₹42,593 so far, which is 12.5% higher than last month.", sender: 'bot', delay: 2500 },
        { text: "Most of the increase comes from 'Food & Dining'. Would you like to see the detailed breakdown?", sender: 'bot', delay: 5000 },
        { text: "Yes, please show me the charts.", sender: 'user', delay: 7000 },
        { text: "Opening your Analytics dashboard now...", sender: 'bot', delay: 8500 },
      ];

      demoSequence.forEach(({ text, sender, delay }) => {
        const timeout = setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender, time: 'Just now' }]);
        }, delay);
        timeouts.push(timeout);
      });

      // Automatically switch to Analytics tab
      const switchTimeout = setTimeout(() => {
        setActiveTab('Analytics');
      }, 10500);
      timeouts.push(switchTimeout);

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [activeTab]);

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMsg = { id: Date.now(), text: chatInput, sender: 'user', time: 'Just now' };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        "I've analyzed your recent transactions. It looks like you're spending 15% more on dining out this month.",
        "Based on your current savings rate, you're on track to hit your goal by December.",
        "I found a subscription to 'Netflix' that you haven't used in 2 weeks. Should I cancel it?",
        "Your portfolio is up 2.4% today, driven mainly by the tech sector rally.",
        "That's a great question. According to your budget, you have ₹12,000 remaining for this category."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMsg = { id: Date.now() + 1, text: randomResponse, sender: 'bot', time: 'Just now' };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Good Morning, Alex</h2>
                <p className="text-gray-400 text-xs">Here's what's happening with your money today.</p>
              </div>
              <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                + Add Transaction
              </button>
            </div>

            {/* Net Worth Card */}
            <div className="bg-linear-to-r from-purple-900/40 to-blue-900/40 border border-white/10 rounded-lg p-5 mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="text-gray-400 text-xs mb-1">Total Net Worth</div>
                <div className="text-3xl font-bold text-white mb-3">₹24,52,000</div>
                <div className="flex gap-4">
                  <div className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +2.4% this month
                  </div>
                  <div className="text-gray-400 text-[10px] flex items-center">Last updated: Just now</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Income', val: '₹1,20,000', color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Expenses', val: '₹42,593', color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Savings', val: '₹77,407', color: 'text-blue-400', bg: 'bg-blue-500/10' }
              ].map((stat, i) => (
                <div key={i} className="bg-[#0a0a0f] border border-white/5 rounded-md p-3">
                  <div className="text-gray-400 text-[10px] mb-1">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { title: 'Received from Client', time: '2 hours ago', amount: '+₹45,000', type: 'income' },
                  { title: 'Apple Store', time: '5 hours ago', amount: '-₹12,400', type: 'expense' },
                  { title: 'Starbucks', time: 'Yesterday', amount: '-₹450', type: 'expense' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {item.type === 'income' 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                          }
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs">{item.title}</div>
                        <div className="text-gray-500 text-[10px]">{item.time}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-xs ${item.type === 'income' ? 'text-green-400' : 'text-white'}`}>{item.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Transactions':
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Transactions</h2>
              <div className="flex gap-2">
                <button className="bg-[#1c1c2e] text-white px-3 py-1 rounded-md text-[10px] border border-white/10">Export CSV</button>
                <button className="bg-[#1c1c2e] text-white px-3 py-1 rounded-md text-[10px] border border-white/10">Filter</button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-5">
              <input type="text" placeholder="Search..." className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg py-2 px-9 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" />
              <svg className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {[
                { name: 'Amazon India', cat: 'Shopping', date: 'Dec 02, 2025', amount: '-₹2,499', status: 'Completed', icon: 'A', color: 'bg-yellow-600' },
                { name: 'Netflix', cat: 'Entertainment', date: 'Dec 01, 2025', amount: '-₹649', status: 'Recurring', icon: 'N', color: 'bg-red-600' },
                { name: 'Salary Credit', cat: 'Income', date: 'Nov 30, 2025', amount: '+₹85,000', status: 'Completed', icon: 'S', color: 'bg-green-600' },
                { name: 'Uber', cat: 'Transport', date: 'Nov 29, 2025', amount: '-₹340', status: 'Completed', icon: 'U', color: 'bg-black' },
                { name: 'Zomato', cat: 'Food', date: 'Nov 28, 2025', amount: '-₹850', status: 'Completed', icon: 'Z', color: 'bg-red-500' },
                { name: 'Electricity Bill', cat: 'Utilities', date: 'Nov 25, 2025', amount: '-₹1,200', status: 'Completed', icon: 'E', color: 'bg-blue-500' },
                { name: 'SIP Investment', cat: 'Investment', date: 'Nov 20, 2025', amount: '-₹10,000', status: 'Auto-Debit', icon: 'I', color: 'bg-purple-500' },
              ].map((tx, i) => (
                <div key={i} className="bg-[#0a0a0f] border border-white/5 rounded-md p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${tx.color} flex items-center justify-center text-white font-bold text-[10px]`}>{tx.icon}</div>
                    <div>
                      <div className="text-white font-medium text-xs group-hover:text-purple-400 transition-colors">{tx.name}</div>
                      <div className="text-gray-500 text-[10px]">{tx.cat} • {tx.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-xs ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-white'}`}>{tx.amount}</div>
                    <div className="text-[10px] text-gray-500">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Budgeting':
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-5">Monthly Budget</h2>
            
            {/* Overview Cards */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              <div className="min-w-[180px] bg-linear-to-br from-purple-900/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-purple-300 text-xs mb-1">Total Budget</div>
                <div className="text-xl font-bold text-white">₹60,000</div>
              </div>
              <div className="min-w-[180px] bg-linear-to-br from-pink-900/20 to-pink-600/20 border border-pink-500/30 rounded-lg p-4">
                <div className="text-pink-300 text-xs mb-1">Spent So Far</div>
                <div className="text-xl font-bold text-white">₹42,593</div>
              </div>
              <div className="min-w-[180px] bg-linear-to-br from-green-900/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-green-300 text-xs mb-1">Remaining</div>
                <div className="text-xl font-bold text-white">₹17,407</div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              {[
                { name: 'Food & Dining', spent: 12400, limit: 15000, color: 'bg-orange-500' },
                { name: 'Transportation', spent: 8200, limit: 10000, color: 'bg-blue-500' },
                { name: 'Entertainment', spent: 4500, limit: 5000, color: 'bg-purple-500' },
                { name: 'Shopping', spent: 15000, limit: 20000, color: 'bg-pink-500' },
              ].map((cat, i) => {
                const pct = (cat.spent / cat.limit) * 100;
                return (
                  <div key={i} className="bg-[#0a0a0f] border border-white/5 rounded-md p-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-white font-medium text-sm mb-0.5">{cat.name}</div>
                        <div className="text-[10px] text-gray-400">₹{cat.spent} of ₹{cat.limit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-sm">{Math.round(pct)}%</div>
                        <div className="text-[10px] text-gray-500">used</div>
                      </div>
                    </div>
                    <div className="h-2 bg-[#1c1c2e] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'Investments':
        return (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">Portfolio</h2>
              <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded-full">+18.4% All Time</span>
            </div>

            {/* Portfolio Value */}
            <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5 mb-5">
              <div className="text-gray-400 text-xs mb-1">Current Value</div>
              <div className="text-3xl font-bold text-white mb-4">₹12,45,890</div>
              
              {/* Mock Line Chart Area */}
              <div className="h-32 w-full relative flex items-end gap-1">
                 {[20, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68, 75, 80, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-linear-to-t from-green-500/20 to-transparent rounded-t-sm relative group">
                       <div className="absolute bottom-0 w-full bg-green-500/50 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
                    </div>
                 ))}
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5">
                  <h3 className="text-white font-semibold text-sm mb-4">Asset Allocation</h3>
                  <div className="space-y-3">
                     {[
                        { name: 'Indian Stocks', pct: 45, val: '₹5.6L', color: 'bg-blue-500' },
                        { name: 'Mutual Funds', pct: 30, val: '₹3.7L', color: 'bg-purple-500' },
                        { name: 'Gold / SGB', pct: 15, val: '₹1.8L', color: 'bg-yellow-500' },
                        { name: 'Crypto', pct: 10, val: '₹1.2L', color: 'bg-pink-500' },
                     ].map((asset, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${asset.color}`}></div>
                              <span className="text-gray-300 text-xs">{asset.name}</span>
                           </div>
                           <div className="text-right">
                              <div className="text-white text-xs font-medium">{asset.pct}%</div>
                              <div className="text-gray-500 text-[10px]">{asset.val}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5">
                  <h3 className="text-white font-semibold text-sm mb-4">Top Performers</h3>
                  <div className="space-y-3">
                     {[
                        { name: 'Reliance Ind.', change: '+4.2%', price: '₹2,450' },
                        { name: 'HDFC Bank', change: '+1.8%', price: '₹1,640' },
                        { name: 'Tata Motors', change: '+3.5%', price: '₹680' },
                        { name: 'Bitcoin', change: '+5.1%', price: '$42,000' },
                     ].map((stock, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                           <span className="text-white text-xs font-medium">{stock.name}</span>
                           <div className="text-right">
                              <div className="text-green-400 text-xs font-bold">{stock.change}</div>
                              <div className="text-gray-500 text-[10px]">{stock.price}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        );

      case 'Analytics':
        return (
          <div className="animate-fade-in h-full flex flex-col">
               {/* Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold text-white">Financial Analytics</h2>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                     <div className="bg-[#13131f] border border-white/5 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-gray-400">
                        <span>This Month</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-pink-500 p-[1.5px]">
                            <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full rounded-full border-2 border-[#050507]" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Dashboard Grid */}
               <div className="grid grid-cols-12 gap-5 h-full">
                  
                  {/* Main Chart Card (Big Left) */}
                  <div className="col-span-12 lg:col-span-8 bg-[#0a0a0f] border border-white/5 rounded-xl p-5 relative overflow-hidden group min-h-[280px]">
                     {/* Ambient Glow */}
                     <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-purple-900/10 to-transparent pointer-events-none"></div>
                     
                     <div className="flex flex-col sm:flex-row justify-between items-start mb-6 relative z-10 gap-4">
                        <div>
                           <h3 className="text-gray-400 text-xs font-medium mb-1">Total Spend</h3>
                           <div className="text-3xl font-bold text-white mb-1">₹42,593</div>
                           <div className="flex items-center gap-2">
                              <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full">+12.5%</span>
                              <span className="text-gray-500 text-[10px]">vs last month</span>
                           </div>
                        </div>
                        <div className="flex gap-1">
                           {['Expenses', 'Income', 'Savings'].map(tab => (
                              <button key={tab} className={`px-3 py-1 rounded-md text-[10px] font-medium transition-colors ${tab === 'Expenses' ? 'bg-[#1c1c2e] text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                 {tab}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Bar Chart Visualization */}
                     <div className="h-40 sm:h-56 flex items-end justify-between gap-2 sm:gap-3 px-2 relative z-10">
                        {[35, 45, 30, 60, 40, 55, 45, 35, 50, 40, 65, 50].map((h, i) => (
                           <div key={i} className="w-full flex flex-col justify-end group/bar h-full relative">
                              {/* The Bar */}
                              <div 
                                 className={`w-full rounded-t-sm transition-all duration-500 relative ${i === 10 ? 'bg-linear-to-t from-purple-600 to-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]' : 'bg-[#1c1c2e] hover:bg-[#2a2a3d]'}`}
                                 style={{ height: `${h}%` }}
                              >
                                 {/* Tooltip */}
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1c1c2e] text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-20">
                                    ₹{h * 1000}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="flex justify-between mt-3 text-[10px] text-gray-500 px-2 overflow-x-auto">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                     </div>
                  </div>

                  {/* Right Column Stack */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
                     
                     {/* Spending Categories */}
                     <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-5 flex-1 min-h-[180px]">
                        <h3 className="text-white font-semibold text-sm mb-4">Top Categories</h3>
                        <div className="space-y-4">
                           {[
                              { name: 'Food & Dining', amount: '₹12,400', pct: 80, color: 'bg-purple-500' },
                              { name: 'Transportation', amount: '₹8,200', pct: 60, color: 'bg-cyan-500' },
                              { name: 'Entertainment', amount: '₹4,500', pct: 45, color: 'bg-pink-500' },
                           ].map((cat, i) => (
                              <div key={i}>
                                 <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-300">{cat.name}</span>
                                    <span className="text-gray-400">{cat.amount}</span>
                                 </div>
                                 <div className="h-1.5 bg-[#1c1c2e] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                           
                     {/* Budget Status (Donut) */}
                     <div className="bg-[#0a0a0f] border border-white/5 rounded-xl p-5 flex-1 flex items-center justify-between min-h-[140px]">
                        <div>
                           <h3 className="text-white font-semibold text-sm mb-1">Budget Status</h3>
                           <div className="text-xl font-bold text-white">72%</div>
                           <p className="text-[10px] text-gray-500">of monthly limit used</p>
                        </div>
                        <div className="relative w-20 h-20 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="32" stroke="#1c1c2e" strokeWidth="6" fill="none" />
                              <circle cx="40" cy="40" r="32" stroke="url(#gradient)" strokeWidth="6" fill="none" strokeDasharray="201" strokeDashoffset="56" strokeLinecap="round" />
                              <defs>
                                 <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                 </linearGradient>
                              </defs>
                           </svg>
                           <div className="absolute text-[10px] font-bold text-white">Safe</div>
                        </div>
                     </div>
                  </div>

                  {/* Bottom Row - Recent Transactions */}
                  <div className="col-span-12 lg:col-span-6 bg-[#0a0a0f] border border-white/5 rounded-xl p-5 min-h-[220px]">
                     <div className="flex justify-between items-center mb-5">
                        <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
                        <button className="text-[10px] text-purple-400 hover:text-purple-300">View All</button>
                     </div>
                     <div className="space-y-3">
                        {[
                           { name: 'Netflix Subscription', date: 'Today, 10:00 AM', amount: '-₹649', icon: 'N', color: 'bg-red-600' },
                           { name: 'Uber Ride', date: 'Yesterday, 6:30 PM', amount: '-₹450', icon: 'U', color: 'bg-black' },
                           { name: 'Salary Credit', date: 'Oct 30, 9:00 AM', amount: '+₹85,000', icon: 'S', color: 'bg-green-600' },
                        ].map((tx, i) => (
                           <div key={i} className="flex items-center justify-between group cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-full ${tx.color} flex items-center justify-center text-white font-bold text-[10px]`}>
                                    {tx.icon}
                                 </div>
                                 <div>
                                    <div className="text-xs text-white font-medium group-hover:text-purple-400 transition-colors">{tx.name}</div>
                                    <div className="text-[10px] text-gray-500">{tx.date}</div>
                                 </div>
                              </div>
                              <div className={`text-xs font-medium ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-white'}`}>
                                 {tx.amount}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Bottom Row - Recurring */}
                  <div className="col-span-12 lg:col-span-6 bg-[#0a0a0f] border border-white/5 rounded-xl p-5 min-h-[220px]">
                     <div className="flex justify-between items-center mb-5">
                        <h3 className="text-white font-semibold text-sm">Recurring Payments</h3>
                        <span className="text-[10px] text-gray-500">Next 7 Days</span>
                     </div>
                     <div className="space-y-4">
                        {[
                           { name: 'Spotify Premium', due: 'Due Tomorrow', amount: '₹119', progress: 90 },
                           { name: 'Internet Bill', due: 'Due in 3 days', amount: '₹999', progress: 60 },
                           { name: 'Gym Membership', due: 'Due in 5 days', amount: '₹2,500', progress: 30 },
                        ].map((item, i) => (
                           <div key={i}>
                              <div className="flex justify-between items-center mb-1.5">
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    <span className="text-xs text-gray-300">{item.name}</span>
                                 </div>
                                 <span className="text-xs text-white font-medium">{item.amount}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="flex-1 h-1 bg-[#1c1c2e] rounded-full overflow-hidden">
                                    <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                 </div>
                                 <span className="text-[10px] text-gray-500 w-16 text-right">{item.due}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
          </div>
        );

      case 'Anomalies':
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Anomaly Detection</h2>
                <p className="text-gray-400 text-xs">AI-powered fraud and irregularity monitoring</p>
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                <span className="text-red-400 text-[10px] font-medium uppercase tracking-wider">2 Alerts Detected</span>
              </div>
            </div>

            {/* Main Alert Card */}
            <div className="bg-linear-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-5 mb-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 flex items-start gap-4">
                  <div className="bg-red-500/20 p-2.5 rounded-lg border border-red-500/30">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Unusual Spending Pattern Detected</h3>
                    <p className="text-gray-300 text-xs mb-3">We noticed a transaction of <span className="text-white font-bold">₹24,999</span> at <span className="text-white font-bold">Electronics Store</span> that deviates from your typical spending behavior on weekdays.</p>
                    <div className="flex gap-3">
                      <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-lg shadow-red-900/20">Block Transaction</button>
                      <button className="bg-[#1c1c2e] hover:bg-[#2a2a3d] text-white border border-white/10 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">It was me</button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Recent Anomalies List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* List */}
              <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Recent Alerts</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Duplicate Charge', desc: 'Netflix Subscription charged twice', time: '2 hours ago', severity: 'medium', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { title: 'New Device Login', desc: 'Login attempt from Mumbai, IN', time: '5 hours ago', severity: 'low', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { title: 'Subscription Price Hike', desc: 'Adobe Creative Cloud increased by 15%', time: 'Yesterday', severity: 'low', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer">
                      <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white text-xs font-medium">{alert.title}</h4>
                          <span className="text-[10px] text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-0.5">{alert.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis / Radar Chart Placeholder */}
              <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-5 flex flex-col">
                 <h3 className="text-white font-semibold text-sm mb-3">Risk Analysis</h3>
                 <div className="flex-1 flex items-center justify-center relative">
                    {/* Mock Radar/Spider Chart Visual */}
                    <div className="relative w-40 h-40">
                       <div className="absolute inset-0 border border-white/10 rounded-full"></div>
                       <div className="absolute inset-8 border border-white/10 rounded-full"></div>
                       <div className="absolute inset-14 border border-white/10 rounded-full"></div>
                       {/* Lines */}
                       <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10"></div>
                       <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10"></div>
                       <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 rotate-45"></div>
                       <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 -rotate-45"></div>
                       
                       {/* The Shape */}
                       <svg className="absolute inset-0 w-full h-full overflow-visible">
                          <polygon points="80,10 140,50 130,120 76,150 20,110 30,40" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="1.5" />
                          <circle cx="80" cy="10" r="2" fill="#a855f7" />
                          <circle cx="140" cy="50" r="2" fill="#a855f7" />
                          <circle cx="130" cy="120" r="2" fill="#a855f7" />
                          <circle cx="76" cy="150" r="2" fill="#a855f7" />
                          <circle cx="20" cy="110" r="2" fill="#a855f7" />
                          <circle cx="30" cy="40" r="2" fill="#a855f7" />
                       </svg>
                    </div>
                 </div>
                 <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="text-[10px] text-gray-500">Spending<br/><span className="text-green-400">Low Risk</span></div>
                    <div className="text-[10px] text-gray-500">Identity<br/><span className="text-green-400">Safe</span></div>
                    <div className="text-[10px] text-gray-500">Cards<br/><span className="text-orange-400">Check</span></div>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'Chat':
        return (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                <p className="text-gray-400 text-xs">Ask questions about your finances</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-400 text-[10px] font-medium">Online</span>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 bg-[#0a0a0f] border border-white/5 rounded-xl p-5 mb-4 overflow-y-auto flex flex-col gap-5 relative scroll-smooth"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  {/* Bot Avatar */}
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  )}

                  <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-br-none' 
                      : 'bg-[#1c1c2e] text-gray-200 border border-white/10 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>{msg.time}</p>
                  </div>

                  {/* User Avatar */}
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border border-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleChatSend} className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..." 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-purple-500 transition-all shadow-inner" 
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        );

      default:
        return <div className="text-white p-10 text-center">Coming Soon</div>;
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Moving Beams Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Beam 1 - Purple */}
        <div className="absolute top-[15%] -left-[20%] w-[60%] h-1.5 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-70 blur-sm animate-beam-horizontal" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
        <div className="absolute top-[15%] -left-[20%] w-[30%] h-1 bg-linear-to-r from-transparent via-white to-transparent opacity-90 blur-md animate-beam-horizontal" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>

        {/* Beam 2 - Cyan */}
        <div className="absolute top-[45%] -left-[20%] w-[70%] h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-60 blur-sm animate-beam-horizontal" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        
        {/* Beam 3 - Mixed */}
        <div className="absolute top-[75%] -left-[20%] w-[60%] h-1 bg-linear-to-r from-transparent via-purple-400 to-transparent opacity-60 blur-sm animate-beam-horizontal" style={{ animationDuration: '15s', animationDelay: '5s' }}></div>
        
        {/* Beam 4 - Fast small one */}
        <div className="absolute top-[30%] -left-[10%] w-[20%] h-0.5 bg-linear-to-r from-transparent via-white to-transparent opacity-80 blur-[1px] animate-beam-horizontal" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <span className="inline-block px-5 py-2 bg-[#13131f] border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            Powered by Setu Account Aggregator + AI
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
          <span className="text-white">Meet your </span>
          <span className="bg-gradient-to-r from-[#a259ff] via-[#ff6bcb] to-[#00cfff] bg-clip-text text-transparent">
            finance copilot
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Turn raw financial data into clear, actionable insights. Consent-based access, 
          visualization-ready transactions, and natural-language Q&A—all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button className="bg-gradient-to-r from-[#a259ff] to-[#00cfff] text-white px-8 py-3.5 rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_20px_rgba(162,89,255,0.3)] transform hover:-translate-y-0.5">
            Get Started
          </button>
          <button className="bg-transparent border border-gray-700 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-white/5 hover:border-gray-500 transition-all backdrop-blur-sm">
            Watch Demo
          </button>
        </div>

        {/* Dashboard Preview - Expanded & Complex */}
        <div className="mt-20 relative mx-auto max-w-7xl perspective-1000">
          {/* Glow Effects behind dashboard */}
          <div className="absolute -inset-1 bg-linear-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-[32px] blur opacity-30 animate-pulse"></div>
          
          <div className="relative bg-[#050507] border border-white/10 rounded-xl overflow-hidden shadow-xl text-left transform transition-transform duration-700 hover:scale-[1.01] flex flex-col md:flex-row h-auto md:h-[800px]">
            
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 flex flex-col py-6 md:py-8 bg-[#0a0a0f]">
               {/* Logo Area */}
               <div className="px-6 md:px-8 mb-6 md:mb-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="text-xl font-bold text-white">LiveRecon</span>
               </div>

               {/* Nav Items */}
               <div className="flex md:flex-col gap-1 px-3 overflow-x-auto md:overflow-visible">
                  {[
                    { id: 'Home', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
                    { id: 'Transactions', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
                    { id: 'Budgeting', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /> },
                    { id: 'Investments', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
                    { id: 'Analytics', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
                    { id: 'Anomalies', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
                    { id: 'Chat', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> }
                  ].map((item) => (
                     <div 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                           activeTab === item.id 
                           ? 'bg-[#1c1c2e] text-white border border-white/10 shadow-sm' 
                           : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                     >
                        <svg className={`w-4 h-4 shrink-0 ${activeTab === item.id ? 'text-purple-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {item.icon}
                        </svg>
                        <span className="text-sm font-medium">{item.id}</span>
                     </div>
                  ))}
               </div>

               {/* Bottom Settings */}
               <div className="mt-auto px-4 hidden md:block">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     <span className="text-sm font-medium">Settings</span>
                  </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#050507] p-5 md:p-6 overflow-y-auto md:overflow-hidden flex flex-col">
               {renderContent()}
            </div>
          </div>
        </div>
        
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>
    </section>
  );
};

export default Hero;
