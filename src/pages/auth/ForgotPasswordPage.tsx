import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { useToastStore } from '../../store/useToastStore';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      showToast({
        title: 'Reset Link Dispatched',
        message: `A password reset link has been sent to ${email}.`,
        type: 'success',
      });
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <SEOHead title="Reset Password | MOSS" description="Reset your MOSS account password." />

      <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal-500 hover:text-charcoal-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {isSent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-moss-100 text-moss-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal-900 font-normal">
              Check Your Inbox
            </h1>
            <p className="text-xs text-charcoal-600 font-light leading-relaxed">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your spam folder if you do not see it within a few minutes.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-3xl font-normal text-charcoal-900 mb-2">
              Reset Password
            </h1>
            <p className="text-xs text-charcoal-500 font-light mb-6">
              Enter your email address below and we will send you a secure link to reset your account password.
            </p>

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
                  placeholder="elena@example.com"
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                />
              </div>

              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
