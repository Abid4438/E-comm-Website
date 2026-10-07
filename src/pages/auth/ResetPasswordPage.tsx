import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { useToastStore } from '../../store/useToastStore';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { customerService } from '../../services/apiClient';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return showToast({ title: 'Error', message: 'Invalid or missing reset token.', type: 'error' });
    if (!email || !newPassword || !confirmPassword) return showToast({ title: 'Error', message: 'Fill all fields.', type: 'error' });
    if (newPassword.length < 6) return showToast({ title: 'Error', message: 'Password must be at least 6 characters.', type: 'error' });
    if (newPassword !== confirmPassword) return showToast({ title: 'Error', message: 'Passwords do not match.', type: 'error' });

    setIsLoading(true);
    try {
      const data = await customerService.resetPassword(token, email, newPassword);
      setSuccess(true);
      showToast({ title: 'Password Reset', message: data.message, type: 'success' });
    } catch (err: any) {
      showToast({ title: 'Reset Failed', message: err.message || 'Could not reset password.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <SEOHead title="Reset Password | MOSS" description="Set a new password for your MOSS account." />
      <div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal-500 hover:text-charcoal-900 mb-6 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-moss-100 text-moss-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal-900 font-normal">Password Updated</h1>
            <p className="text-xs text-charcoal-600 font-light">Your new password has been saved. You can now sign in.</p>
            <Link to="/login"><Button variant="dark" size="md" className="w-full">Continue to Sign In</Button></Link>
          </div>
        ) : (
          <div>
            <h1 className="font-serif text-3xl font-normal text-charcoal-900 mb-2">Set New Password</h1>
            <p className="text-xs text-charcoal-500 font-light mb-6">Enter your new password below. The link expires in 30 minutes.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="elena@example.com" className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-charcoal-700 mb-1">Confirm New Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs text-charcoal-900 focus:outline-none focus:border-moss-900" />
              </div>
              <Button type="submit" variant="dark" size="lg" className="w-full" isLoading={isLoading}>Update Password</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
