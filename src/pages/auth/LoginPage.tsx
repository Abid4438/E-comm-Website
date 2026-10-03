import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton';
import { User, ShieldCheck, ArrowRight, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ title: 'Error', message: 'Enter email and password to validate against account.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      showToast({
        title: 'Welcome Back',
        message: `Signed in as ${user.firstName || user.email}.`,
        type: 'success',
      });
      navigate(user.role === 'admin' ? '/admin' : redirect);
    } catch {
      showToast({
        title: 'Sign In Failed',
        message: 'Invalid credentials. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setIsLoading(true);
    try {
      const user = await login(demoEmail);
      showToast({
        title: 'Demo Sign In',
        message: `Signed in as ${user.firstName} (${user.role}).`,
        type: 'success',
      });
      navigate(user.role === 'admin' ? '/admin' : redirect);
    } catch (err: any) {
      console.error('[Demo Login Error]', err);
      showToast({ title: 'Demo Error', message: err.message || 'Quick demo sign-in failed.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
      <SEOHead title="Sign In | MOSS" description="Sign in to your MOSS customer account." />

      <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
            Member Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Sign In to MOSS
          </h1>
          <p className="text-xs text-charcoal-500 font-light">
            Access your order history, curated wishlists, and tailored recommendations.
          </p>
        </div>

        {/* Google Sign-In */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <GoogleSignInButton label="Sign in with Google" />
          </div>
          <div className="flex items-center gap-2 p-2 bg-moss-900/5 border border-moss-900/10 text-xs text-charcoal-700">
            <Shield className="w-3.5 h-3.5 text-moss-800" />
            <span>Secure sign-in with Google available.</span>
          </div>
        </div>

        {/* Demo Fast Logins */}
        <div className="mb-6 p-4 bg-sand-100 border border-sand-200 space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-600 block">
            Instant Demo Sign In:
          </span>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('elena.rostova@example.com')}
              className="flex-1 px-3 py-2 bg-sand-200 hover:bg-sand-300 text-charcoal-900 text-xs font-medium border border-sand-300 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-charcoal-600" /> Customer Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@moss.com')}
              className="flex-1 px-3 py-2 bg-moss-900 hover:bg-moss-800 text-sand-50 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> Admin Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena.rostova@example.com"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-charcoal-500 hover:text-charcoal-900 underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-sand-200 text-center text-xs text-charcoal-600">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="text-moss-900 font-semibold underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
