import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import ChatDemo from './components/ChatDemo'
import Security from './components/Security'
import CTA from './components/CTA'
import Footer from './components/Footer'
import GlowCurvedLine from './components/GlowCurvedLine'

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Side Glow Effects */}
      <GlowCurvedLine className="fixed top-0 left-0 h-screen w-24 -translate-x-1/2 z-0" color="purple" />
      <GlowCurvedLine className="fixed top-0 right-0 h-screen w-24 translate-x-1/2 rotate-180 z-0" color="cyan" />
      
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <ChatDemo />
        <Security />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default App
