import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { fetchUserConsents } from '../services/authService';

// Simple SVG Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = ({ visible, onClick }) => (
  <button type="button" onClick={onClick} className="focus:outline-none">
    {visible ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
         <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
         <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    )}
  </button>
);

const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://api.prabalsingh.dev/api/auth/login", { username, password }, {
        headers: { "Content-Type": "application/json" }
      });
      
      const data = res.data;
        
      // Save tokens if provided, else just set auth
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      if (data.userId) localStorage.setItem("userId", data.userId);
      if (data.username) localStorage.setItem("username", data.username);
      
      if (data.email) {
        localStorage.setItem("email", data.email);
      } else if (username.includes('@')) {
          // Fallback: If user logged in with email, save it as email
          localStorage.setItem("email", username);
      }

      if (data.firstName) localStorage.setItem("firstName", data.firstName);
      if (data.lastName) localStorage.setItem("lastName", data.lastName);
      
      // Fallback for demo mock if backend doesn't return exactly this
      localStorage.setItem("isAuthenticated", "true"); 
      
      // Fetch user-specific consent IDs
      if (data.userId) {
        try {
          const userConsentsData = await fetchUserConsents(data.userId);
          if (userConsentsData && userConsentsData.consentIds) {
            // Store user consent IDs in localStorage
            localStorage.setItem("userConsentIds", JSON.stringify(userConsentsData.consentIds));
          } else {
            // No consents for this user
            localStorage.setItem("userConsentIds", JSON.stringify([]));
          }
        } catch (consentError) {
          console.error("Error fetching user consents:", consentError);
          // Set empty array if fetch fails
          localStorage.setItem("userConsentIds", JSON.stringify([]));
        }
      }
      
      setAuthenticated(true);
      navigate("/dashboard");

    } catch (err) {
      if (err.response) {
         setError("Invalid username or password");
      } else {
         setError("Network error. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-gray-900 font-sans">
      {/* Left Column: Visual/Promo - Hidden on mobile, visible on lg screens */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center w-full max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome Back!</h1>
          <p className="text-gray-500 text-lg mb-12">Manage your finance seamlessly and securely.</p>
          
          {/* Mock Phone UI */}
          <div className="relative w-[320px] h-[640px] bg-white border-[8px] border-gray-900 rounded-[3rem] shadow-2xl mx-auto overflow-hidden flex flex-col font-sans select-none">
             {/* Dynamic Island / Notch */}
             <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30 flex justify-center items-center">
                <div className="w-20 h-4 rounded-full bg-gray-800/50"></div>
             </div>

             {/* Screen Content */}
             <div className="w-full h-full bg-gray-50 pt-14 px-6 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                   <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-gray-500 mb-1">9:41</span>
                      <span className="text-lg font-bold text-gray-900 leading-tight">Good Morning!</span>
                   </div>
                   <div className="flex gap-3 text-gray-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                   </div>
                </div>

                {/* Credit Card - Floating Effect */}
                <div className="relative w-[115%] -ml-[7.5%] mb-8 z-20 group perspective">
                    <div className="w-full bg-black text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden transform transition-transform duration-500 hover:scale-105">
                         {/* Card Background Elements */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                         
                         <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col gap-1">
                               {/* Chip */}
                               <div className="w-10 h-7 border border-gray-600 rounded-md flex items-center justify-center bg-gray-800/50">
                                   <div className="w-8 h-[1px] bg-gray-600 rounded-full"></div>
                               </div>
                               <svg className="w-5 h-5 text-gray-500 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="text-white/80">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                            </div>
                         </div>

                         <div className="mt-8">
                             <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Cardholder Name</div>
                             <div className="flex justify-between items-center">
                                 <div className="text-lg font-bold tracking-wide">Steve Harrington</div>
                                 <div className="flex -space-x-2">
                                     <div className="w-8 h-8 rounded-full bg-red-500/90 z-10"></div>
                                     <div className="w-8 h-8 rounded-full bg-yellow-400/90"></div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Assets List */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <span className="font-bold text-gray-900">All Assets</span>
                        <div className="flex items-center text-xs font-semibold text-gray-500 bg-gray-200/50 px-2 py-1 rounded-lg gap-1">
                            Tradable <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Bitcoin Item */}
                        <div className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 font-bold text-lg">₿</div>
                                <div>
                                   <div className="font-bold text-sm text-gray-900">Bitcoin <span className="text-gray-400 font-normal">BTC</span></div>
                                   <div className="text-xs text-gray-500">0.0739 - $42,158.85</div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="text-green-500 text-xs font-bold">+2.48%</div>
                                <div className="font-bold text-sm text-gray-900">+$128.73</div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Sign In</h2>
             <p className="text-gray-500">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                  />
               </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon />
                 </div>
                 <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400"
                 />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                 </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center h-5">
                    <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 bg-white"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">Remember me</label>
                </div>
                <button type="button" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                    Forgot password?
                </button>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg shadow-purple-900/10 text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all transform active:scale-[0.98]"
            >
              Sign In
            </button>
            
            {/* Error Message */}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {/* Sign Up Link */}
            <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="font-medium text-gray-900 hover:text-black hover:underline">Sign up</Link>
                </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
