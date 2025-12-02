import { useState, useEffect, useRef } from 'react';

const conversation = [
  { role: 'user', text: 'Analyze my spending trends for October.' },
  { role: 'ai', text: 'In October, your spending increased by 12% compared to September. The largest spike was in "Travel & Leisure" (₹15,000).' },
  { role: 'user', text: 'How much am I spending on subscriptions?' },
  { role: 'ai', text: 'You have 5 active subscriptions totaling ₹2,450/month. Netflix (₹649) and Spotify (₹119) are your most frequent recurring charges.' },
  { role: 'user', text: 'Can I afford a vacation in December?' },
  { role: 'ai', text: 'Based on your current savings rate of ₹25,000/month, you will have ₹50,000 saved by December. This fits your "Goa Trip" budget.' },
];

const ChatDemo = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef(null);
  
  const [step, setStep] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Extract just the user questions for the left sidebar
  const userQuestions = conversation.filter(msg => msg.role === 'user');
  // Calculate which user question is currently active or completed based on the step
  // step 0,1 -> Question 0 active/done
  // step 2,3 -> Question 1 active/done
  const activeQuestionIndex = Math.floor(step / 2);

  useEffect(() => {
    const currentMsg = conversation[step % conversation.length];
    let timeout;

    // Reset conversation when looping back to start
    if (step > 0 && step % conversation.length === 0 && charIndex === 0 && inputValue === '' && !isAiTyping) {
       setTimeout(() => setMessages([]), 0);
    }

    if (currentMsg.role === 'user') {
      if (charIndex < currentMsg.text.length) {
        // Typing effect
        timeout = setTimeout(() => {
          setInputValue(prev => prev + currentMsg.text[charIndex]);
          setCharIndex(prev => prev + 1);
        }, 40); // Slightly faster typing
      } else {
        // Finished typing, wait then send
        timeout = setTimeout(() => {
          setMessages(prev => [...prev, { type: 'user', text: currentMsg.text }]);
          setInputValue('');
          setCharIndex(0);
          setStep(prev => prev + 1);
        }, 800);
      }
    } else {
      // AI Turn
      if (!isAiTyping) {
        // Start thinking phase
        timeout = setTimeout(() => setIsAiTyping(true), 400);
      } else {
        // Finish thinking phase
        timeout = setTimeout(() => {
          setIsAiTyping(false);
          setMessages(prev => [...prev, { type: 'ai', text: currentMsg.text }]);
          setStep(prev => prev + 1);
        }, 1500);
      }
    }

    return () => clearTimeout(timeout);
  }, [step, charIndex, isAiTyping, inputValue]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  return (
    <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden group bg-[#050507]">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] pointer-events-none"></div>

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Command Stack (4 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                LIVE DEMO ACTIVE
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Your Financial <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-500 to-cyan-400">
                  Command Center
                </span>
              </h2>
              <p className="text-gray-400 text-lg">
                Experience the power of natural language processing. Ask complex financial questions and get instant, data-driven answers—just like chatting with a pro.
              </p>
            </div>
            
            {/* The "Task Queue" Visual */}
            <div className="relative space-y-4">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-transparent -z-10"></div>

              {userQuestions.map((q, index) => {
                const isActive = index === activeQuestionIndex % userQuestions.length;
                const isPast = index < activeQuestionIndex % userQuestions.length || (Math.floor(step / 2) >= userQuestions.length && index < userQuestions.length);
                
                return (
                  <div 
                    key={index} 
                    className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isActive 
                        ? 'bg-linear-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] translate-x-2' 
                        : isPast
                          ? 'bg-white/5 border-white/5 opacity-50 grayscale'
                          : 'bg-transparent border-transparent opacity-40'
                    }`}
                  >
                    {/* Status Indicator Dot */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      isActive 
                        ? 'bg-[#0a0a0f] border-cyan-400 text-cyan-400 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                        : isPast
                          ? 'bg-purple-900/20 border-purple-500/30 text-purple-400'
                          : 'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                      {isActive ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : isPast ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-mono">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className={`text-xs font-mono mb-1 uppercase tracking-wider ${
                        isActive ? 'text-cyan-400' : 'text-gray-500'
                      }`}>
                        {isActive ? 'Processing...' : isPast ? 'Completed' : 'Pending'}
                      </div>
                      <span className={`font-medium transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}>
                        {q.text}
                      </span>
                    </div>
                    
                    {/* Active Beam Effect */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-l-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Holographic Terminal (7 cols) */}
          <div className="lg:col-span-7 relative mt-8 lg:mt-0">
            {/* Terminal Container */}
            <div className="relative rounded-2xl bg-[#0a0a0f]/90 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50 group-hover:shadow-purple-900/20 transition-shadow duration-500">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-4 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-gray-400">
                    BASH - v2.4.0
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAiTyping ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'}`}></span>
                    AI_CORE
                  </span>
                  <span>|</span>
                  <span>LATENCY: 12ms</span>
                </div>
              </div>

              {/* Chat Area */}
              <div ref={chatContainerRef} className="h-[500px] p-6 overflow-y-auto scroll-smooth font-sans relative">
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%] z-0 opacity-20"></div>

                <div className="relative z-10 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                          message.type === 'user'
                            ? 'bg-linear-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 rounded-tr-sm'
                            : 'bg-gray-800/50 text-gray-200 border border-white/5 rounded-tl-sm'
                        }`}
                      >
                        {message.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <span className="text-xs text-cyan-400 font-bold tracking-wide">AI ASSISTANT</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* AI Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex justify-start animate-fade-in-up">
                      <div className="bg-gray-800/50 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-4 bg-[#050507] border-t border-white/5">
                <div className="relative flex items-center bg-white/5 rounded-xl border border-white/10 px-4 py-3 focus-within:border-cyan-500/50 focus-within:bg-white/10 transition-all duration-300">
                  <div className="mr-3 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    readOnly
                    placeholder="Waiting for input..."
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 font-mono text-sm"
                  />
                  <div className={`w-2 h-4 bg-cyan-400 ml-1 ${inputValue ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                </div>
              </div>

            </div>
            
            {/* Decorative Elements behind terminal */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br from-purple-500/20 to-transparent blur-2xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-linear-to-tr from-cyan-500/20 to-transparent blur-2xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
