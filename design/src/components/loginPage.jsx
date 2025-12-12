import React, { useState } from 'react';
import { 
  CloudRain, AlertTriangle, 
  User, Lock, Mail, Phone, ArrowRight 
} from 'lucide-react';
import { GlassCard } from './GlassCard';

export const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.password) {
      setError('Name and Password are required');
      return;
    }
    
    if (isRegistering) {
        if (!formData.phone || !formData.email) {
            setError('All fields are required for registration');
            return;
        }
    }
    
    setIsLoading(true);
    
    // Simulate auth delay
    setTimeout(() => {
        onLogin(formData.name);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
       <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/20">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
             <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 mb-4 animate-in zoom-in duration-500">
                <CloudRain className="w-10 h-10 text-white" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white">StormEye<span className="text-cyan-400">AI</span></h1>
             <p className="text-blue-200 text-sm font-medium tracking-wide mt-2">Cloudburst Early Warning System</p>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-white/50 text-sm">
                {isRegistering ? 'Join the network to monitor severe weather.' : 'Enter your credentials to access the dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                <AlertTriangle size={16} />
                {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
             {/* Name Input */}
             <div className="space-y-1">
                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Name</label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all"
                        placeholder="Enter your name"
                        disabled={isLoading}
                    />
                </div>
             </div>

             {/* Registration Fields */}
             {isRegistering && (
                 <>
                    <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
                        <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all"
                                placeholder="+91 98765 43210"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                        <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all"
                                placeholder="name@example.com"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                 </>
             )}

             {/* Password Input */}
             <div className="space-y-1">
                <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all"
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
             </div>

             <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {isRegistering ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={18} />
                  </>
                )}
             </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-white/60">
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                disabled={isLoading}
                className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition-colors disabled:opacity-50"
            >
                {isRegistering ? 'Login' : 'Register'}
            </button>
          </div>
       </GlassCard>
    </div>
  )
}