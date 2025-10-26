"use client";

import { useEffect, useState, memo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useRequireGuest } from "@/lib/hooks/useDjangoAuth";
import { useClientSide } from "@/lib/hooks/useClientSide";
import { ThemeProvider, useTheme } from "@/lib/theme/ThemeProvider";
import { useLoginForm } from "@/lib/hooks/useLoginForm";

// Optimized Components
import AnimatedBackground from "@/components/login/AnimatedBackground";
import ThemeToggle from "@/components/login/ThemeToggle";
import LogoSection from "@/components/login/LogoSection";
import LoginForm from "@/components/login/LoginForm";
import FeatureCards from "@/components/login/FeatureCards";
import VisualElements from "@/components/login/VisualElements";

// Loading Component
const LoginLoader = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
));

LoginLoader.displayName = 'LoginLoader';

// Main Login Component
const LoginPageContent = memo(() => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const {
    email,
    password,
    showPassword,
    isLoading,
    error,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    handleSubmit,
    isFormValid
  } = useLoginForm();

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleFormSubmit = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    // Trigger the form submission
    const syntheticEvent = new Event('submit', { bubbles: true, cancelable: true });
    handleSubmit(syntheticEvent as any);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-red-900' 
        : 'bg-gradient-to-br from-red-50 via-white to-red-50'
    }`}>
      {/* Animated Background */}
      <AnimatedBackground isDark={isDark} />

      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
          <div className={`w-full max-w-md transition-all duration-1000 ${
            isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Logo Section */}
            <LogoSection isDark={isDark} isAnimating={isAnimating} />

            {/* Login Form */}
            <LoginForm
              isDark={isDark}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              error={error}
            />

            {/* Feature Cards */}
            <FeatureCards isDark={isDark} />
          </div>
        </div>

        {/* Right Side - Visual Elements */}
        <VisualElements isDark={isDark} />
      </div>

      {/* Optimized CSS-in-JS */}
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
});

LoginPageContent.displayName = 'LoginPageContent';

// Main Login Page Component
const LoginPage = memo(() => {
  const { isAuthenticated, isLoading } = useRequireGuest();
  const isClient = useClientSide();

  // Show loader during hydration and authentication check
  if (!isClient || isLoading) {
    return (
      <ThemeProvider>
        <LoginLoader />
      </ThemeProvider>
    );
  }

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirection vers le dashboard...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Suspense fallback={<LoginLoader />}>
        <LoginPageContent />
      </Suspense>
    </ThemeProvider>
  );
});

LoginPage.displayName = 'LoginPage';

export default LoginPage;