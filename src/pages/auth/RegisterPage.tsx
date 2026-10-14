import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { GoogleSignInButton } from '../../components/ui/GoogleSignInButton';
import { isGoogleAuthEnabled } from '../../config/auth';
import { ArrowRight, Shield } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerUser } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password) {
      showToast({ title: 'Error', message: 'Please fill all required fields including password.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      showToast({ title: 'Error', message: 'Passwords do not match.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({ email, firstName, lastName, phone, password });
      const { sendVerificationEmail } = await import('../../services/apiClient');
      await sendVerificationEmail(email);
      showToast({ title: 'Account Created', message: 'Confirm email, then login.', type: 'success' });
      navigate('/verify-email?email=' + encodeURIComponent(email));
    } catch {
      showToast({
        title: 'Registration Error',
        message: 'Could not create account.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
      <SEOHead title="Create Account | MOSS" description="Register for a MOSS customer account." />

      <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-moss-800 font-semibold block">
            Join MOSS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-charcoal-500 font-light">
            Enjoy simplified checkout, exclusive releases, and tailored design consultations.
          </p>
        </div>

        {/* Google Sign-Up */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <GoogleSignInButton label="Sign up with Google" />
          </div>
          <div className="flex items-center gap-2 p-2 bg-moss-900/5 border border-moss-900/10 text-xs text-charcoal-700">
            <Shield className="w-3.5 h-3.5 text-moss-800" />
            <span>
              {isGoogleAuthEnabled
                ? 'Fast, one-click registration with your Google account.'
                : 'Google OAuth not configured in this environment. Register with email below.'}
            </span>
          </div>
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-sand-300 w-full"></div>
            <span className="bg-[#FAF8F5] px-3 text-[11px] uppercase tracking-wider text-charcoal-400 font-medium absolute">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Elena"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rostova"
                className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@example.com"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-8901"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">
              Create Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900" />
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
              Register Account
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-sand-200 text-center text-xs text-charcoal-600">
          <span>Already have an account? </span>
          <Link to="/login" className="text-moss-900 font-semibold underline underline-offset-4">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
