"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireGuest } from "@/lib/hooks/useAuth";
import { ThemeProvider, useTheme } from "@/lib/theme/ThemeProvider";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    useEffect(() => {
        setIsAnimating(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login({ email, password });
            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Invalid credentials");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
            isDark 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900' 
                : 'bg-gradient-to-br from-emerald-50 via-white to-green-50'
        }`}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
                    isDark ? 'bg-emerald-600' : 'bg-emerald-200'
                }`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
                    isDark ? 'bg-green-600' : 'bg-green-200'
                }`}></div>
                <div className={`absolute top-40 left-40 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse ${
                    isDark ? 'bg-teal-600' : 'bg-teal-200'
                }`}></div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => {
                    // Utiliser des valeurs fixes pour éviter les erreurs d'hydratation
                    const positions = [
                        { left: 7.68, top: 40.54, delay: 0.97, duration: 3.26 },
                        { left: 58.75, top: 14.69, delay: 0.26, duration: 2.14 },
                        { left: 55.53, top: 35.12, delay: 0.33, duration: 4.87 },
                        { left: 35.62, top: 97.52, delay: 0.89, duration: 2.63 },
                        { left: 68.17, top: 81.42, delay: 1.76, duration: 2.44 },
                        { left: 47.88, top: 3.59, delay: 0.70, duration: 2.89 },
                        { left: 69.31, top: 95.61, delay: 2.59, duration: 2.30 },
                        { left: 86.86, top: 55.65, delay: 0.71, duration: 2.10 },
                        { left: 15.52, top: 58.61, delay: 0.40, duration: 4.48 },
                        { left: 27.46, top: 85.87, delay: 0.57, duration: 2.95 },
                        { left: 27.34, top: 8.78, delay: 0.67, duration: 3.80 },
                        { left: 22.06, top: 32.28, delay: 2.05, duration: 3.18 },
                        { left: 49.42, top: 13.91, delay: 2.74, duration: 3.33 },
                        { left: 27.19, top: 25.01, delay: 1.65, duration: 3.56 },
                        { left: 4.59, top: 31.77, delay: 2.21, duration: 2.32 }
                    ];
                    const pos = positions[i] || { left: 50, top: 50, delay: 1, duration: 3 };
                    
                    return (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 rounded-full opacity-30 animate-pulse ${
                                isDark ? 'bg-emerald-400' : 'bg-emerald-400'
                            }`}
                            style={{
                                left: `${pos.left}%`,
                                top: `${pos.top}%`,
                                animationDelay: `${pos.delay}s`,
                                animationDuration: `${pos.duration}s`
                            }}
                        ></div>
                    );
                })}
            </div>

            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-20">
                <div className="relative group">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        isDark ? 'bg-emerald-500/30' : 'bg-emerald-400/30'
                    }`}></div>
                    
                    {/* Main button */}
                    <button
                        onClick={toggleTheme}
                        className={`relative px-4 py-3 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                            isDark 
                                ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-slate-500/50 text-emerald-400 hover:border-emerald-400/70 hover:shadow-emerald-500/20' 
                                : 'bg-gradient-to-br from-white/90 to-emerald-50/90 border-emerald-300/50 text-emerald-600 hover:border-emerald-500/70 hover:shadow-emerald-400/20'
                        }`}
                        aria-label="Toggle theme"
                    >
                        <div className="flex items-center space-x-2">
                            {/* Icon with animation */}
                            <div className="relative">
                                <div className={`absolute inset-0 rounded-full animate-pulse ${
                                    isDark ? 'bg-emerald-400/20' : 'bg-emerald-500/20'
                                }`}></div>
                                {isDark ? (
                                    <Sun size={20} className="relative animate-spin-slow" />
                                ) : (
                                    <Moon size={20} className="relative" />
                                )}
                            </div>
                            
                            {/* Text label */}
                            <span className={`text-sm font-medium transition-all duration-300 ${
                                isDark ? 'text-slate-200' : 'text-gray-700'
                            }`}>
                                {isDark ? 'Light' : 'Dark'}
                            </span>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                            isDark 
                                ? 'bg-gradient-to-r from-emerald-500/10 to-transparent' 
                                : 'bg-gradient-to-r from-emerald-400/10 to-transparent'
                        }`}></div>
                    </button>
                </div>
            </div>


            <div className="relative z-10 flex min-h-screen">
                {/* Left Side - Login Form */}
                <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
                    <div className={`w-full max-w-md transition-all duration-1000 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {/* Logo Section */}
                        <div className="text-center mb-12">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
                                <div className={`relative backdrop-blur-sm rounded-full p-4 border shadow-lg ${
                                    isDark 
                                        ? 'bg-slate-800/90 border-slate-600' 
                                        : 'bg-white/90 border-emerald-200'
                                }`}>
                                    <Image
                                        src={isDark ? "/MainLogoDark.png" : "/MainLogo.png"}
                                        alt="AIKAMELEON Logo"
                                        width={80}
                                        height={40}
                                        className="mx-auto"
                                    />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                AIKAMELEON
                            </h1>
                            <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>KYC Dashboard</p>
                            <div className="flex justify-center items-center mt-4 space-x-2">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Secure Authentication</span>
                                <Zap className="w-5 h-5 text-green-500" />
                            </div>
                        </div>

                        {/* Login Form */}
                        <div className={`backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${
                            isDark 
                                ? 'bg-slate-800/95 border-slate-600' 
                                : 'bg-white/95 border-emerald-200'
                        }`}>
                            <div className="text-center mb-8">
                                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>Welcome Back</h2>
                                <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Sign in to your account to continue</p>
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative">
                                            <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 shadow-sm ${
                                                    isDark 
                                                        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                                                        : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                                                }`}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative">
                                            <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 shadow-sm ${
                                                    isDark 
                                                        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                                                        : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                                                }`}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                                                    isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full relative group overflow-hidden rounded-xl py-4 px-6 font-semibold text-white transition-all duration-300 ${
                                        loading 
                                            ? 'bg-gray-300 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative flex items-center justify-center">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
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
                                            ? 'text-slate-400 hover:text-emerald-400' 
                                            : 'text-gray-600 hover:text-emerald-600'
                                    }`}
                                >
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                            <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm ${
                                isDark 
                                    ? 'bg-slate-800/80 border-slate-600' 
                                    : 'bg-white/80 border-emerald-200'
                            }`}>
                                <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Secure</p>
                            </div>
                            <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm ${
                                isDark 
                                    ? 'bg-slate-800/80 border-slate-600' 
                                    : 'bg-white/80 border-green-200'
                            }`}>
                                <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Fast</p>
                            </div>
                            <div className={`backdrop-blur-sm rounded-xl p-4 border shadow-sm ${
                                isDark 
                                    ? 'bg-slate-800/80 border-slate-600' 
                                    : 'bg-white/80 border-teal-200'
                            }`}>
                                <Sparkles className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Modern</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Visual Elements */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Main Visual Element */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Outer Ring */}
                                <div className={`w-96 h-96 border rounded-full animate-spin-slow ${
                                    isDark ? 'border-emerald-600/30' : 'border-emerald-200/30'
                                }`}>
                                    <div className={`w-full h-full border rounded-full animate-pulse ${
                                        isDark ? 'border-emerald-400/40' : 'border-emerald-400/40'
                                    }`}></div>
                                </div>
                                
                                {/* Middle Ring */}
                                <div className={`absolute inset-8 border rounded-full animate-spin-reverse ${
                                    isDark ? 'border-green-600/40' : 'border-green-200/40'
                                }`}>
                                    <div className={`w-full h-full border rounded-full animate-pulse ${
                                        isDark ? 'border-green-400/40' : 'border-green-400/40'
                                    }`}></div>
                                </div>
                                
                                {/* Inner Ring */}
                                <div className={`absolute inset-16 border rounded-full animate-spin-slow ${
                                    isDark ? 'border-teal-600/50' : 'border-teal-200/50'
                                }`}>
                                    <div className={`w-full h-full border rounded-full animate-pulse ${
                                        isDark ? 'border-teal-400/40' : 'border-teal-400/40'
                                    }`}></div>
                                </div>
                                
                                {/* Center Logo */}
                                <div className={`absolute inset-24 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg ${
                                    isDark 
                                        ? 'bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-slate-600/50' 
                                        : 'bg-gradient-to-br from-emerald-100/80 to-green-100/80 border-emerald-200/50'
                                }`}>
                                    <Image
                                        src={isDark ? "/MainLogoDark.png" : "/MainLogo.png"}
                                        alt="AIKAMELEON"
                                        width={120}
                                        height={60}
                                        className="opacity-90"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-400 rounded-full animate-bounce shadow-lg"></div>
                        <div className="absolute top-40 right-32 w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.5s'}}></div>
                        <div className="absolute bottom-32 left-32 w-5 h-5 bg-teal-400 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-300 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1.5s'}}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .animate-spin-reverse {
                    animation: spin-reverse 15s linear infinite;
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}

export default function Login() {
    const { isAuthenticated } = useRequireGuest();

    // Afficher un loader pendant la vérification de l'authentification
    if (isAuthenticated === undefined) {
        return (
            <ThemeProvider>
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <LoginForm />
        </ThemeProvider>
    );
}
