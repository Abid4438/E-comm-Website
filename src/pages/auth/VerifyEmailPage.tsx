import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { customerService } from '../../services/apiClient';
import { useToastStore } from '../../store/useToastStore';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { showToast } = useToastStore();
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/confirm-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Verification failed.');
      setVerified(true);
      showToast({ title: 'Email Verified', message: data.message || 'You can now sign in.', type: 'success' });
    } catch (error: any) {
      showToast({ title: 'Verification Failed', message: error.message || 'Invalid or expired PIN.', type: 'error' });
    } finally { setLoading(false); }
  };
  const resend = async () => {
    if (!email || cooldown > 0) return;
    try {
      await customerService.resendVerification(email);
      setCooldown(30);
      showToast({ title: 'Code Requested', message: 'If verification is needed, a new PIN has been emailed.', type: 'success' });
    } catch (error: any) {
      showToast({ title: 'Resend Failed', message: error.message || 'Please try again.', type: 'error' });
    }
  };
  return <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
    <SEOHead title="Verify Email | MOSS" description="Verify your MOSS account email." />
    <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm text-center space-y-4">
      <h1 className="font-serif text-3xl text-charcoal-900">Verify Your Email</h1>
      <p className="text-xs text-charcoal-600">Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>.</p>
      {verified ? <><CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" /><p className="text-sm">Email verified. You can now sign in.</p><Link to="/login"><Button>Go to Sign In</Button></Link></> :
      <><form onSubmit={verify} className="space-y-4 text-left">
        <label className="block text-xs uppercase tracking-wider font-medium">Verification PIN</label>
        <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="6-digit PIN" className="w-full bg-white border border-sand-300 p-3 text-center text-xl tracking-[0.4em]" />
        <Button type="submit" variant="dark" size="lg" className="w-full" isLoading={loading}>Verify Email</Button>
      </form><div className="pt-4 border-t border-sand-200"><Button onClick={resend} disabled={!email || cooldown>0} variant="outline" size="sm" leftIcon={<RotateCcw className="w-3 h-3" />}>{cooldown>0 ? 'Resend ('+cooldown+'s)' : 'Resend Code'}</Button></div></>}
    </div>
  </div>;
};
