import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { useToastStore } from '../../store/useToastStore';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { customerService } from '../../services/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const { showToast } = useToastStore();

  const [tokenExpiry] = useState('30 min');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const data = await customerService.forgotPassword(email);
      setIsSent(true);
      setResetUrl(data.resetUrl || null);
      setCanResend(false);
      setTimer(30);
      showToast({
        title: 'Reset Link Dispatched',
        message: `A secure password reset link (expires in ${tokenExpiry}) has been sent to ${email}.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Error',
        message: err.message || 'Failed to send reset link.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;
    try {
      const data = await customerService.resendReset(email);
      setResetUrl(data.resetUrl || null);
      setCanResend(false);
      setTimer(30);
      showToast({
        title: 'Reset Link Resent',
        message: `A new reset link has been sent to ${email}.`,
        type: 'success',
      });
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to resend.', type: 'error' });
    }
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
            <h1 className="font-serif text-2xl text-charcoal-900 font-normal">Check Your Inbox</h1>
            <p className="text-xs text-charcoal-600 font-light leading-relaxed">
              We have sent a secure reset link (expires in {tokenExpiry}) to <strong>{email}</strong>. Please check your spam folder if you do not see it.
            </p>
            {resetUrl && (
              <div className="p-3 bg-sand-100 border border-sand-200 text-[11px] text-charcoal-700 break-all font-mono">
                {resetUrl}
              </div>
            )}
            <div className="pt-2">
              <button
                onClick={handleResend}
                disabled={!canResend}
                className="inline-flex items-center gap-1.5 text-xs text-moss-900 hover:underline font-medium disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resend {timer > 0 ? `(${timer}s)` : ''}</span>
              </button>
            </div>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" size="md" className="w-full">Return to Sign In</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-3xl font-normal text-charcoal-900 mb-2">Reset Password</h1>
            <p className="text-xs text-charcoal-500 font-light mb-6">
              Enter your email address below and we will send you a secure link to reset your account password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900"
                />
              </div>
              <Button type="submit" variant="dark" size="lg" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
