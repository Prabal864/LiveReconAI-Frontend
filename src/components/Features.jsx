import GlowCurvedLine from './GlowCurvedLine';

const Features = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Consent-based Access",
      description: "Your data, your control. All financial data is accessed only with your explicit consent through Setu's secure AA framework.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Natural Language Q&A",
      description: "Ask questions like \"Where did I spend the most last month?\" and get instant, AI-powered insights in plain English.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Visualization-Ready Data",
      description: "Beautiful charts and graphs that make understanding your finances a breeze. See spending patterns at a glance.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: "Spot Anomalies",
      description: "AI-powered detection of unusual spending patterns, duplicate charges, and potential fraud before they impact you.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] max-w-6xl opacity-20 pointer-events-none">
         <GlowCurvedLine className="absolute top-0 left-1/4 h-full w-48 -translate-x-1/2 rotate-45" color="purple" />
      </div>

      
      <div className="absolute top-0 left-0 w-full h-full bg-[var(--bg-root)] -z-20"></div>
      
      
      <div className="absolute inset-0 bg-linear-to-b from-[var(--bg-root)] via-purple-900/5 to-[var(--bg-root)] pointer-events-none"></div>

      
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            Everything you need for{" "}
            <span className="bg-linear-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 hover:drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]">
              financial clarity
            </span>
          </h2>
          <p className="text-[var(--text-secondary)] text-xl max-w-3xl mx-auto leading-relaxed">
            Powerful features that transform how you understand and manage your money.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-px rounded-3xl transition-all duration-500 hover:-translate-y-2 active:scale-95 ${
                index === 0 || index === 3 ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              
              <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-purple-600 via-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 group-active:opacity-100 animate-border-wave transition-opacity duration-500"></div>
              
              
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 group-active:opacity-100 blur-2xl transition-opacity duration-500 -z-10"></div>
              
              
              <div className="relative h-full bg-[#050507] rounded-3xl p-8 md:p-10 border border-transparent group-hover:border-transparent transition-colors z-10 overflow-hidden">
                
           
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                
                <div className="absolute -right-10 -bottom-10 w-64 h-64 text-[var(--text-primary)]/5 group-hover:text-[var(--text-primary)]/10 transition-colors duration-500 rotate-12 pointer-events-none">
                    {feature.icon}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--text-primary)]/5 flex items-center justify-center mb-8 border border-[var(--border-color)] group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/20">
                      <div className="text-purple-400 group-hover:text-cyan-400 transition-colors duration-300 scale-125">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-primary)] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-[var(--text-secondary)] text-lg leading-relaxed group-hover:text-[var(--text-primary)] transition-colors max-w-md">
                      {feature.description}
                    </p>

                    
                    <div className="mt-auto pt-8 flex items-center gap-2 text-sm font-medium text-purple-400 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <span>Explore Feature</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
