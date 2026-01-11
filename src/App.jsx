import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import ChatDemo from "./components/ChatDemo";
import Security from "./components/Security";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import GlowCurvedLine from "./components/GlowCurvedLine";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const LandingPage = () => {
    const params = new URLSearchParams(window.location.search);
    if (isAuthenticated && params.get("success") === "true") {
      return <Navigate to={`/dashboard${window.location.search}`} replace />;
    }
    
    return (
      <>
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
      </>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
        {/* Side Glow Effects */}
        <GlowCurvedLine className="fixed top-0 left-0 h-screen w-24 -translate-x-1/2 z-0" color="purple" />
        <GlowCurvedLine className="fixed top-0 right-0 h-screen w-24 translate-x-1/2 rotate-180 z-0" color="cyan" />
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard setAuthenticated={setAuthenticated} />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route path="/signup" element={<Signup setAuthenticated={setAuthenticated} />} />
          <Route
            path="/"
            element={<LandingPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
