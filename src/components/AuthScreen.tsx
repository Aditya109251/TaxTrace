import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Card, Button } from './UI';
import { LogIn, UserPlus, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        setProfile(profile);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { name: name }
          }
        });
        if (error) throw error;
        alert(data.session ? 'Account created and logged in!' : 'Check your email for confirmation!');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TaxTrace AI</h1>
          <p className="text-slate-500 text-sm">Civic Infrastructure Intelligence</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">Try Demo Dashboards</p>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="secondary" 
              className="w-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-2"
              onClick={() => {
                setProfile({ id: 'demo-gov', name: 'District Magistrate (DM)', role: 'government', constituency_id: 1 });
                useAuthStore.getState().setUser({ id: 'demo-gov', email: 'dm@taxtrace.ai' });
                useAuthStore.getState().setDemo(true);
              }}
            >
              <ShieldCheck size={16} /> Government Admin
            </Button>
            <Button 
              variant="secondary" 
              className="w-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 flex items-center justify-center gap-2"
              onClick={() => {
                setProfile({ id: 'demo-con', name: 'L&T Infrastructure Ltd', role: 'contractor', constituency_id: 1 });
                useAuthStore.getState().setUser({ id: 'demo-con', email: 'contractor@taxtrace.ai' });
                useAuthStore.getState().setDemo(true);
              }}
            >
              <TrendingUp size={16} /> Contractor Portal
            </Button>
            <Button 
              variant="secondary" 
              className="w-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 flex items-center justify-center gap-2"
              onClick={() => {
                setProfile({ id: 'demo-cit', name: 'Aditya Kumar', role: 'citizen', constituency_id: 1, civic_score: 850 });
                useAuthStore.getState().setUser({ id: 'demo-cit', email: 'citizen@taxtrace.ai' });
                useAuthStore.getState().setDemo(true);
              }}
            >
              <Users size={16} /> Citizen Watchdog
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </Card>
    </div>
  );
};
