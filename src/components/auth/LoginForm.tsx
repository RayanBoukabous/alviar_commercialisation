'use client';

import React, { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Button, Input } from '@/components/ui';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('emailInvalid');
    }

    if (!formData.password) {
      errors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      errors.password = t('passwordMinLength');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-600/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary-400/10 rounded-full blur-lg animate-pulse delay-500"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="relative theme-bg-elevated rounded-2xl shadow-2xl border theme-border-primary p-8 backdrop-blur-sm">
            {/* Header with Logo */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                  <img
                    src="/alviar_logo.jpg"
                    alt="ALVIAR"
                    width={56}
                    height={56}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                {/* Effet de brillance */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              </div>
              
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3 tracking-tight">
                ALVIAR
              </h1>
              <p className="text-base theme-text-secondary font-medium">
                {t('secureIdentityPlatform')}
              </p>
              <div className="mt-3 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-primary-300 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>


            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold theme-text-primary">
                    {t('email')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={cn(
                        'h-5 w-5 transition-colors',
                        formErrors.email 
                          ? 'text-red-500' 
                          : 'text-primary-500 group-focus-within:text-primary-600'
                      )} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        'block w-full pl-12 pr-4 py-4 border-2 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all duration-200',
                        formErrors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 focus:border-primary-500',
                        theme === 'dark' 
                          ? 'bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 backdrop-blur-sm' 
                          : 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 backdrop-blur-sm'
                      )}
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold theme-text-primary">
                    {t('password')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={cn(
                        'h-5 w-5 transition-colors',
                        formErrors.password 
                          ? 'text-red-500' 
                          : 'text-primary-500 group-focus-within:text-primary-600'
                      )} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn(
                        'block w-full pl-12 pr-14 py-4 border-2 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all duration-200',
                        formErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 focus:border-primary-500',
                        theme === 'dark' 
                          ? 'bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 backdrop-blur-sm' 
                          : 'bg-white/80 border-slate-200 text-slate-900 placeholder-slate-400 backdrop-blur-sm'
                      )}
                      placeholder={t('passwordPlaceholder')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-xl transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {formErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center group">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm theme-text-secondary group-hover:theme-text-primary transition-colors cursor-pointer">
                    {t('rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors hover:underline"
                  >
                    {t('forgotPassword')}
                  </a>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                        {t('loginError')}
                      </h3>
                      <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {t('signingIn')}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="w-5 h-5 mr-2" />
                      {t('signIn')}
                    </div>
                  )}
                </Button>
              </div>

              {/* Sign up link */}
              <div className="text-center pt-4">
                <p className="text-sm theme-text-secondary">
                  {t('noAccount')}{' '}
                  <a
                    href="#"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors hover:underline"
                  >
                    {t('createAccount')}
                  </a>
                </p>
              </div>
            </form>

            {/* Language Selector - Bottom Right */}
            <div className="absolute bottom-4 right-4">
              <div className="relative px-3 py-2 rounded-lg backdrop-blur-sm border border-emerald-200 dark:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-md bg-white/50 dark:bg-slate-700/50">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs theme-text-tertiary">
            {t('copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
