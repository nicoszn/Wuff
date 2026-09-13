import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { t } = useTranslation();
  const { login, signup, currentUser } = useStore();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Auto-redirect if logged in
  if (currentUser) {
    navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const success = login(form.email, form.password);
      if (success) {
        toast.success(t('auth.loginSuccess'));
        const user = useStore.getState().currentUser;
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        toast.error(t('auth.loginError'));
      }
    } else {
      if (form.password !== form.confirmPassword) {
        toast.error(t('auth.passwordMismatch'));
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      const success = signup(form.firstName, form.lastName, form.email, form.password);
      if (success) {
        toast.success(t('auth.signupSuccess'));
        navigate('/dashboard');
      } else {
        toast.error('Email already exists');
      }
    }
  };

  const quickLogin = (email: string, password: string) => {
    setForm({ ...form, email, password });
    const success = login(email, password);
    if (success) {
      toast.success(t('auth.loginSuccess'));
      const user = useStore.getState().currentUser;
      navigate(user?.role === 'admin' ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-blue-50 to-primary-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('app.name')}</h1>
              <p className="text-primary-200 text-sm">{t('app.tagline')}</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Grow Your Wealth
            <br />
            <span className="text-accent-300">with Smart Investing</span>
          </h2>

          <p className="text-primary-200 text-lg leading-relaxed max-w-md mb-10">
            Join thousands of investors who trust PortBuff to manage their portfolio. 
            High returns, transparent operations, and expert support.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">$12M+</p>
              <p className="text-primary-200 text-xs mt-1">Total Invested</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">5,400+</p>
              <p className="text-primary-200 text-xs mt-1">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-primary-200 text-xs mt-1">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-surface-900">{t('app.name')}</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-surface-900 mb-2">
              {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h2>
            <p className="text-surface-500 mb-8">
              {isLogin ? t('auth.welcomeMessage') : t('auth.signupMessage')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        {t('auth.firstName')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          className="input-field pl-10"
                          placeholder="John"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        {t('auth.lastName')}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          className="input-field pl-10"
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="email"
                    className="input-field pl-10"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {t('auth.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pl-10"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLogin ? t('auth.login') : t('auth.signup')}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-surface-500 hover:text-primary-600 transition-colors"
              >
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <span className="font-semibold text-primary-600">
                  {isLogin ? t('auth.signup') : t('auth.login')}
                </span>
              </button>
            </div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-surface-50 rounded-xl border border-surface-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold text-surface-700">{t('auth.demoCredentials')}</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => quickLogin('admin@portbuff.com', 'admin123')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border border-surface-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-sm"
                >
                  <span className="font-medium text-surface-900">Admin:</span>{' '}
                  <span className="text-surface-500">admin@portbuff.com / admin123</span>
                </button>
                <button
                  onClick={() => quickLogin('john@example.com', 'user123')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border border-surface-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-sm"
                >
                  <span className="font-medium text-surface-900">User:</span>{' '}
                  <span className="text-surface-500">john@example.com / user123</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
