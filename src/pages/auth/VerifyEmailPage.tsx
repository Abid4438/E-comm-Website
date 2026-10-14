import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { customerService } from '../../services/apiClient';
import { useToastStore } from '../../store/useToastStore';

export const VerifyEmailPage: React.FC = () => {
  const { showToast } = useToastStore();
  const [verified, setVerified] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [searchParams] = useSearchParams();
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const email = searchParams.get('email') || 'your email';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (timer <= 0) {
      if (!canResend) setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, canResend]);

  // Auto-verify if token provided in URL
  useEffect(() => {
    if (token && !verified) {
      // In real system, this would call backend to validate token
      // For demo/mock, show as verified quickly
      const timer = setTimeout(() => setVerified(true), 800);
      return () => clearTimeout(timer);
    }
  }, [token, verified]);

  const handleResend = async () => {
    try {
      const result = await customerService.resendVerification(email);
      setVerifyUrl(result.verifyUrl || null);
      setCanResend(false);
      setTimer(30);
      showToast({ title: 'Verification Link Resent', message: `A new link has been sent to ${email}.`, type: 'success' });
    } catch (e) {
      showToast({ title: 'Resend Failed', message: 'Could not resend verification link.', type: 'error' });
    }
  };

  const handleVerify = () => setVerified(true);

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <SEOHead title="Verify Email | MOSS" description="Verify your MOSS account email." />
      <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm text-center space-y-4">
        <h1 className="font-serif text-3xl text-charcoal-900">Verify Your Email</h1>
        <p className="text-xs text-charcoal-600">We sent a link to <strong>{email}</strong>.</p>

        {verified ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <p className="text-sm text-charcoal-900 font-medium">Email verified! You can now sign in.</p>
            <Link to="/login"><Button>Sign In</Button></Link>
          </>
        ) : (
          <>
            <p className="text-xs text-charcoal-500">Waiting for confirmation...</p>
            <Button onClick={handleVerify} variant="outline" size="sm">Verify manually</Button>
            {verifyUrl && (
              <div className="p-2 bg-sand-100 border border-sand-200 text-[10px] text-charcoal-700 font-mono break-all">{verifyUrl}</div>
            )}
          </>
        )}

        <div className="pt-4 border-t border-sand-200 flex gap-2 justify-center">
          <Button onClick={handleResend} disabled={!canResend} variant="outline" size="sm" leftIcon={<RotateCcw className="w-3 h-3" />}>Resend {timer > 0 ? `(${timer}s)` : ''}</Button>
        </div>
      </div>
    </div>
  );
};
