import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';
import { useToastStore } from '../../store/useToastStore';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { customerService } from '../../services/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const [email,setEmail]=useState(''); const [sent,setSent]=useState(false); const [done,setDone]=useState(false);
  const [code,setCode]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('');
  const [loading,setLoading]=useState(false); const [cooldown,setCooldown]=useState(0); const {showToast}=useToastStore();
  useEffect(()=>{if(cooldown<=0)return;const timer=window.setTimeout(()=>setCooldown(n=>n-1),1000);return()=>window.clearTimeout(timer)},[cooldown]);
  const send=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);try{await customerService.forgotPassword(email);setSent(true);setCooldown(30);showToast({title:'Check Your Email',message:'If an account exists, a reset PIN has been sent.',type:'success'})}catch(err:any){showToast({title:'Could Not Send PIN',message:err.message||'Please try again.',type:'error'})}finally{setLoading(false)}};
  const resend=async()=>{if(cooldown>0||loading)return;setLoading(true);try{await customerService.resendReset(email);setCooldown(30);showToast({title:'PIN Requested',message:'If an account exists, a new reset PIN has been emailed.',type:'success'})}catch(err:any){showToast({title:'Resend Failed',message:err.message||'Please try again.',type:'error'})}finally{setLoading(false)}};
  const reset=async(e:React.FormEvent)=>{e.preventDefault();if(!/^\d{6}$/.test(code))return showToast({title:'Invalid PIN',message:'Enter the 6-digit code from your email.',type:'error'});if(password.length<8)return showToast({title:'Weak Password',message:'Password must be at least 8 characters.',type:'error'});if(password!==confirm)return showToast({title:'Password Mismatch',message:'Passwords do not match.',type:'error'});setLoading(true);try{const result=await customerService.resetPassword(code,email,password);setDone(true);showToast({title:'Password Updated',message:result.message,type:'success'})}catch(err:any){showToast({title:'Reset Failed',message:err.message||'PIN may be invalid or expired.',type:'error'})}finally{setLoading(false)}};
  return <div className="max-w-md mx-auto px-4 py-16 sm:py-24"><SEOHead title="Reset Password | MOSS" description="Reset your MOSS account password."/><div className="bg-[#FAF8F5] border border-sand-300 p-8 sm:p-10 shadow-sm">
    <Link to="/login" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal-500 mb-6"><ArrowLeft className="w-3.5 h-3.5"/>Back to Sign In</Link>
    {done?<div className="text-center space-y-4"><CheckCircle2 className="w-12 h-12 text-green-600 mx-auto"/><h1 className="font-serif text-2xl">Password Updated</h1><p className="text-xs">Your password has been changed. You can now sign in.</p><Link to="/login"><Button variant="dark" size="lg" className="w-full">Return to Sign In</Button></Link></div>:
    !sent?<><h1 className="font-serif text-3xl mb-2">Forgot Password?</h1><p className="text-xs mb-6">Enter your email. We will send a one-time PIN that expires in 10 minutes.</p><form onSubmit={send} className="space-y-4"><label className="block text-xs uppercase tracking-wider">Email Address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs"/><Button type="submit" variant="dark" size="lg" className="w-full" isLoading={loading}>Send Reset PIN</Button></form></>:
    <><h1 className="font-serif text-3xl mb-2">Enter Reset PIN</h1><p className="text-xs mb-6">If an account exists for <strong>{email}</strong>, a 6-digit PIN has been sent. It expires in 10 minutes.</p><form onSubmit={reset} className="space-y-4">
      <label className="block text-xs uppercase tracking-wider">Email PIN</label><input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="w-full bg-white border border-sand-300 p-3 text-center text-xl tracking-[0.4em]"/>
      <label className="block text-xs uppercase tracking-wider">New Password</label><input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs"/>
      <label className="block text-xs uppercase tracking-wider">Confirm New Password</label><input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full bg-[#FAF8F5] border border-sand-300 p-3 text-xs"/>
      <Button type="submit" variant="dark" size="lg" className="w-full" isLoading={loading}>Reset Password</Button></form>
      <div className="pt-4 text-center"><button type="button" onClick={resend} disabled={cooldown>0||loading} className="inline-flex items-center gap-1.5 text-xs text-moss-900 disabled:opacity-40"><RotateCcw className="w-3.5 h-3.5"/>{cooldown>0?'Resend ('+cooldown+'s)':'Resend PIN'}</button></div></>}
  </div></div>;
};
