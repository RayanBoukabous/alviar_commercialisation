"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, Zap, Sun, Moon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJWTLogin, useRequireJWTAuth } from "@/lib/hooks/useJWTAuth";
import { useClientSide } from "@/lib/hooks/useClientSide";
import { ThemeProvider, useTheme } from "@/lib/theme/ThemeProvider";
import AlviarLogo from "@/components/ui/AlviarLogo";

function JWTLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const loginMutation = useJWTLogin();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const isDark = theme === 'dark';

    useEffect(() => {
        setIsAnimating(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Éviter les soumissions multiples
        if (loginMutation.isPending) {
            return;
        }

        // JWT accepte l'email comme identifiant de connexion
        const username = email;
        
        loginMutation.mutate({
            username,
            password,
        });
    };

    return (
        <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
            isDark 
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-red-900' 
                : 'bg-gradient-to-br from-red-50 via-white to-red-50'
        }`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 animate-pulse">
                <div className={`w-20 h-20 rounded-full opacity-20 ${
                    isDark ? 'bg-red-400' : 'bg-red-600'
                }`}></div>
            </div>
            <div className="absolute top-40 right-20 animate-pulse delay-1000">
                <div className={`w-16 h-16 rounded-full opacity-15 ${
                    isDark ? 'bg-blue-400' : 'bg-blue-600'
                }`}></div>
            </div>
            <div className="absolute bottom-40 left-20 animate-pulse delay-2000">
                <div className={`w-12 h-12 rounded-full opacity-10 ${
                    isDark ? 'bg-green-400' : 'bg-green-600'
                }`}></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className={`w-full max-w-md transform transition-all duration-700 ${
                    isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <AlviarLogo />
                        </div>
                        <h1 className={`text-3xl font-bold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Connexion JWT
                        </h1>
                        <p className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            Système d'authentification sécurisé avec tokens JWT
                        </p>
                        <div className="flex items-center justify-center mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>Tokens expirent en 3 minutes</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className={`rounded-2xl shadow-2xl p-8 backdrop-blur-sm border ${
                        isDark 
                            ? 'bg-slate-800/50 border-slate-700' 
                            : 'bg-white/80 border-white/20'
                    }`}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                            isDark 
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-red-400' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-400'
                                        }`}
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                            isDark 
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-red-400' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-400'
                                        }`}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {(error || loginMutation.error) && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error || loginMutation.error?.message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                    loginMutation.isPending
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Connexion en cours...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        Se connecter avec JWT
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Features */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div className="flex items-center text-green-600 dark:text-green-400">
                                    <Shield className="w-4 h-4 mr-2" />
                                    <span>Authentification JWT sécurisée</span>
                                </div>
                                <div className="flex items-center text-blue-600 dark:text-blue-400">
                                    <Zap className="w-4 h-4 mr-2" />
                                    <span>Refresh automatique des tokens</span>
                                </div>
                                <div className="flex items-center text-purple-600 dark:text-purple-400">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>Expiration en 3 minutes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={toggleTheme}
                            className={`p-3 rounded-full transition-all duration-200 ${
                                isDark 
                                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                                    : 'bg-white hover:bg-gray-50 text-gray-600 shadow-lg'
                            }`}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JWTLoginPage() {
    const isClient = useClientSide();
    const router = useRouter();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isClient) {
            const isAuthenticated = localStorage.getItem('jwt_access_token');
            if (isAuthenticated) {
                router.push('/dashboard');
            }
        }
    }, [isClient, router]);

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <JWTLoginForm />
        </ThemeProvider>
    );
}
