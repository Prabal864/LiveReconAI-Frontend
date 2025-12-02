import GlowCurvedLine from './GlowCurvedLine';

const Security = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: "text-orange-400",
      gradient: "from-orange-500/20 to-red-500/20",
      spotlight: "bg-orange-500/20",
      border: "group-hover:border-orange-500/50",
      wave: "from-orange-500 via-red-500 to-orange-500",
      title: "End-to-End Encryption",
      description: "Your data is encrypted at rest and in transit",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-green-400",
      gradient: "from-green-500/20 to-emerald-500/20",
      spotlight: "bg-green-500/20",
      border: "group-hover:border-green-500/50",
      wave: "from-green-500 via-emerald-500 to-green-500",
      title: "Consent-Based Access",
      description: "You control what data is shared and for how long",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-indigo-500/20",
      spotlight: "bg-blue-500/20",
      border: "group-hover:border-blue-500/50",
      wave: "from-blue-500 via-indigo-500 to-blue-500",
      title: "RBI Approved",
      description: "Built on the official Account Aggregator framework",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      color: "text-red-400",
      gradient: "from-red-500/20 to-pink-500/20",
      spotlight: "bg-red-500/20",
      border: "group-hover:border-red-500/50",
      wave: "from-red-500 via-pink-500 to-red-500",
      title: "No Data Storage",
      description: "We never store your raw financial data",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden group">
      {/* Stronger Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-purple-900/10 to-[#0a0a0f] pointer-events-none"></div>

      {/* Large Glow Orbs */}
      <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Background Glow Line with Fluctuation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl opacity-40 pointer-events-none">
         <div className="absolute inset-0 animate-wave-pulse">
            <GlowCurvedLine className="absolute top-0 left-0 h-[120%] w-48 -translate-x-1/2 rotate-45 opacity-60" color="purple" />
            <GlowCurvedLine className="absolute top-0 right-0 h-[120%] w-48 translate-x-1/2 -rotate-45 opacity-60" color="cyan" />
         </div>
      </div>

      {/* Vertical Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-purple-500/50 to-transparent animate-beam-vertical" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-linear-to-b from-transparent via-cyan-500/50 to-transparent animate-beam-vertical" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-linear-to-b from-transparent via-purple-400/30 to-transparent animate-beam-vertical" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 hover:bg-purple-500/20 transition-colors cursor-default">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Bank-Grade Security
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Your Data, <span className="bg-linear-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">Your Control</span>
          </h2>
          
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Built on the RBI-approved Account Aggregator framework. All data access is 
            consent-based, time-bound, and fully encrypted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group/card relative p-px rounded-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95"
            >
              {/* Animated Gradient Border - The "Wave" */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-600 via-cyan-500 to-purple-600 opacity-0 group-hover/card:opacity-100 group-active/card:opacity-100 animate-border-wave transition-opacity duration-500"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover/card:opacity-100 group-active/card:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>

              <div className="relative h-full p-8 rounded-2xl bg-linear-to-br from-purple-900/20 via-[#0a0a0f]/80 to-red-900/20 backdrop-blur-sm border border-white/5 group-hover/card:border-transparent group-active/card:border-transparent transition-colors z-10 overflow-hidden">
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`mb-6 p-4 rounded-2xl border border-white/5 bg-white/5 group-hover/card:border-white/10 group-hover/card:bg-white/10 group-active/card:border-white/10 group-active/card:bg-white/10 transition-all duration-300 ${feature.color} shadow-lg shadow-black/50`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-linear-to-r group-hover/card:from-purple-400 group-hover/card:to-cyan-400 group-active/card:text-transparent group-active/card:bg-clip-text group-active/card:bg-linear-to-r group-active/card:from-purple-400 group-active/card:to-cyan-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover/card:text-gray-300 group-active/card:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
