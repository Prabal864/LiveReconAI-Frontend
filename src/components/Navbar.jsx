const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              LiveReconAI
            </span>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">
                Demo
              </a>
              <a href="/login" className="text-gray-300 hover:text-white font-medium px-4 py-2 transition-colors">
                Login
              </a>
              <a href="/signup" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
                <span className="relative block bg-[#0a0a0f] text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                  Signup
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
