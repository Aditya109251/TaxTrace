import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { ShieldCheck, LogOut, Settings, Bell } from 'lucide-react';

export default function App() {
  const { user, profile, setUser, setProfile, logout } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !useAuthStore.getState().isDemo) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !useAuthStore.getState().isDemo) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!useAuthStore.getState().isDemo) {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) setProfile(data);
  };

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TaxTrace AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Settings size={20} />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{profile?.name || 'User'}</div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{profile?.role || 'Citizen'}</div>
                </div>
                <button 
                  onClick={() => supabase.auth.signOut().then(() => logout())}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Dashboard />
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 TaxTrace AI – National Civic Infrastructure Intelligence Platform
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-slate-400 hover:text-blue-600 text-xs transition-colors">Transparency Report</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 text-xs transition-colors">Audit Methodology</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 text-xs transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
