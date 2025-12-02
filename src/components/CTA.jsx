const CTA = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background - Moving Beams & Fluctuating Lines */}
      <div className="absolute inset-0 bg-linear-to-b from-[#050507] via-[#13131f] to-[#050507] overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"></div>
        
        {/* Horizontal Beams - Bigger and Brighter */}
        <div className="absolute top-[15%] -left-[10%] w-[120%] h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-80 blur-[2px] animate-beam-horizontal shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ animationDuration: '7s' }}></div>
        <div className="absolute top-[45%] -left-[10%] w-[120%] h-1.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-90 blur-[3px] animate-beam-horizontal shadow-[0_0_15px_rgba(34,211,238,0.6)]" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-[75%] -left-[10%] w-[120%] h-1 bg-linear-to-r from-transparent via-pink-500 to-transparent opacity-70 blur-[2px] animate-beam-horizontal shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>

        {/* Vertical Beams - Bigger and Brighter */}
        <div className="absolute -top-[10%] left-[15%] w-1 h-[120%] bg-linear-to-b from-transparent via-purple-400 to-transparent opacity-60 blur-[1px] animate-beam-vertical" style={{ animationDuration: '8s', animationDelay: '0s' }}></div>
        <div className="absolute -top-[10%] left-[85%] w-1.5 h-[120%] bg-linear-to-b from-transparent via-cyan-400 to-transparent opacity-70 blur-[2px] animate-beam-vertical" style={{ animationDuration: '12s', animationDelay: '3s' }}></div>
        <div className="absolute -top-[10%] left-[50%] w-0.5 h-[120%] bg-linear-to-b from-transparent via-indigo-500 to-transparent opacity-50 blur-[1px] animate-beam-vertical" style={{ animationDuration: '10s', animationDelay: '5s' }}></div>
        
        {/* Ambient Glows - Enhanced */}
        <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Holographic HUD Interface */}
        <div className="relative py-24 px-6 md:px-12">
            
            {/* Corner Accents - HUD Style */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-purple-500/30 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-purple-500/30 rounded-br-3xl"></div>

            {/* Central Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_70%)] blur-3xl -z-10"></div>

            {/* Floating Icons/Elements */}
            <div className="absolute top-10 left-10 animate-bounce delay-100 opacity-20 hidden md:block">
               <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="absolute bottom-10 right-10 animate-bounce delay-300 opacity-20 hidden md:block">
               <svg className="w-12 h-12 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>

            <div className="text-center relative z-10">
                <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                  Ready to <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-cyan-400">Master Your Money?</span>
                </h2>
                
                <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
                  Join thousands of users who are already making smarter financial decisions with LiveReconAI. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-xl overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-purple-200 via-cyan-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <button className="px-10 py-5 rounded-full font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-lg">
                    Schedule a Demo
                  </button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
