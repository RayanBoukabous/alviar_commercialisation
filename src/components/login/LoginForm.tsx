'use client';

import { memo, useCallback, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  isDark: boolean;
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  error?: string;
}

const LoginForm = memo(({ isDark, onSubmit, isLoading, error }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit(email, password);
    }
  }, [email, password, onSubmit, isLoading]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className={`backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${
      isDark 
        ? 'bg-slate-800/95 border-slate-600' 
        : 'bg-white/95 border-red-200'
    }`}>
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
          Welcome Back
        </h2>
        <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className={`mb-6 p-4 border rounded-xl backdrop-blur-sm animate-shake ${
          isDark 
            ? 'bg-red-900/50 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
          >
            Email ou Nom d'utilisateur
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all duration-300 shadow-sm ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
                placeholder="admin@admin.com ou admin_test_backend"
                required
                autoComplete="username"
                aria-describedby="email-error"
              />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label 
            htmlFor="password" 
            className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
          >
            Mot de passe
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all duration-300 shadow-sm ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
                placeholder="Entrez votre mot de passe"
                required
                autoComplete="current-password"
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full relative group overflow-hidden rounded-xl py-4 px-6 font-semibold text-white transition-all duration-300 ${
            isLoading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 hover:shadow-lg hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
          aria-describedby="login-status"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </div>
        </button>
      </form>

      {/* Forgot Password */}
      <div className="mt-6 text-center">
        <a 
          href="/forgot-password" 
          className={`transition-colors duration-200 text-sm font-medium ${
            isDark 
              ? 'text-slate-400 hover:text-red-400' 
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;
