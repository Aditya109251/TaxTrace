import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent, Button } from './UI';
import { cn } from '../lib/utils';
import { MapView } from './MapView';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Map as MapIcon, 
  Plus,
  BarChart3,
  Users,
  ShieldCheck,
  FileText,
  MessageSquare,
  History,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Navigation,
  Search,
  Filter,
  Download,
  Eye,
  Camera,
  Award,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data for Demo ---
const MOCK_PROJECTS = [
  { 
    id: 'p1', 
    title: 'NH-24 Flyover Construction', 
    description: 'Six-lane flyover to decongest traffic at junction 4.',
    budget_allocated: 450000000, 
    funds_released: 120000000, 
    completion_percentage: 28, 
    risk_level: 'HIGH',
    risk_score: 0.85,
    risk_reason: 'Cement price 2.4x above regional average. Burn rate 180% higher than expected.',
    contractor: 'L&T Infrastructure',
    delay_days: 12,
    status: 'Active'
  },
  { 
    id: 'p2', 
    title: 'Smart Water Grid Phase 1', 
    description: 'Laying 20km of high-pressure water pipelines.',
    budget_allocated: 120000000, 
    funds_released: 85000000, 
    completion_percentage: 75, 
    risk_level: 'LOW',
    risk_score: 0.12,
    risk_reason: 'Normal price deviation. Steady progress.',
    contractor: 'Tata Projects',
    delay_days: 0,
    status: 'Active'
  },
  { 
    id: 'p3', 
    title: 'Govt School Renovation (12 units)', 
    description: 'Structural repairs and digital classroom setup.',
    budget_allocated: 35000000, 
    funds_released: 35000000, 
    completion_percentage: 100, 
    risk_level: 'MEDIUM',
    risk_score: 0.45,
    risk_reason: 'Quantity deviation in electrical fittings detected.',
    contractor: 'Local Builders Inc',
    delay_days: 45,
    status: 'Closed'
  }
];

const MOCK_BURN_RATE = [
  { month: 'Jan', released: 10, completion: 5 },
  { month: 'Feb', released: 25, completion: 12 },
  { month: 'Mar', released: 45, completion: 22 },
  { month: 'Apr', released: 60, completion: 35 },
  { month: 'May', released: 85, completion: 55 },
  { month: 'Jun', released: 120, completion: 75 },
];

const MOCK_COMPLAINTS = [
  { 
    id: 'c1', 
    project: 'NH-24 Flyover', 
    user: 'Rajesh M.', 
    text: 'Poor quality concrete being used at Pillar 4.', 
    status: 'INVESTIGATING', 
    date: '2026-02-20',
    category: 'Quality Control',
    resolution: null,
    updates: [
      { date: '2026-02-21', text: 'Site inspector assigned.' },
      { date: '2026-02-23', text: 'Material samples sent for lab testing.' }
    ]
  },
  { 
    id: 'c2', 
    project: 'Smart Water Grid', 
    user: 'Sita Devi', 
    text: 'Road not restored after pipe laying.', 
    status: 'RESOLVED', 
    date: '2026-02-15',
    category: 'Public Safety',
    resolution: 'Road restoration completed on 2026-02-18. Verified by local ward member.',
    updates: [
      { date: '2026-02-16', text: 'Contractor notified of pending restoration.' },
      { date: '2026-02-18', text: 'Work completed and verified.' }
    ]
  },
];

const MOCK_PAST_PROJECTS = [
  { id: 'pp1', title: 'District Hospital Wing', budget: 250000000, risk_score: 0.15, rating: 4.8, date: '2024-12-10' },
  { id: 'pp2', title: 'Public Library Block', budget: 45000000, risk_score: 0.08, rating: 4.9, date: '2025-01-20' },
  { id: 'pp3', title: 'Community Center', budget: 12000000, risk_score: 0.22, rating: 4.5, date: '2024-08-15' },
];

const MOCK_CONTRACTOR_HISTORY = [
  { year: '2021', projects: 8, avgRisk: 0.18 },
  { year: '2022', projects: 12, avgRisk: 0.14 },
  { year: '2023', projects: 15, avgRisk: 0.11 },
  { year: '2024', projects: 13, avgRisk: 0.12 },
];

export const Dashboard = () => {
  const { profile, isDemo } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [view, setView] = useState<'overview' | 'map' | 'analytics' | 'complaints' | 'audit'>('overview');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<string>('Detecting...');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ project_id: '', category: 'Quality', description: '' });

  useEffect(() => {
    if (isDemo) {
      setProjects(MOCK_PROJECTS);
      setLocation('New Delhi (Constituency #1)');
    } else {
      fetchData();
    }
  }, [isDemo]);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just show alert
    alert(`Complaint submitted for ${complaintForm.category}: ${complaintForm.description}`);
    setShowComplaintModal(false);
    setComplaintForm({ project_id: '', category: 'Quality', description: '' });
  };

  const fetchData = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const detectLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setLocation('New Delhi (Constituency #1)');
    }, 1500);
  };

  const renderRoleSpecificActions = () => {
    switch (profile?.role) {
      case 'government':
        return (
          <div className="flex gap-2">
            <Button className="flex items-center gap-2 bg-blue-600">
              <Plus size={18} /> Create Project
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download size={18} /> Export Reports
            </Button>
          </div>
        );
      case 'contractor':
        return (
          <div className="flex gap-2">
            <Button className="flex items-center gap-2 bg-emerald-600">
              <Camera size={18} /> Upload Progress
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <FileText size={18} /> Request Funds
            </Button>
          </div>
        );
      case 'citizen':
        return (
          <div className="flex gap-2">
            <Button 
              className="flex items-center gap-2 bg-amber-600"
              onClick={() => setShowComplaintModal(true)}
            >
              <MessageSquare size={18} /> File Complaint
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Award size={18} /> My Civic Score
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#E8D5B0]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F4E4BC] border-r-4 border-royal-gold flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b-2 border-royal-gold/30">
          <div className="flex items-center gap-2 text-royal-crimson text-xs font-black uppercase tracking-widest mb-4 font-display">
            <Navigation size={14} /> The Realm
          </div>
          <div className="bg-[#E8D5B0] rounded-sm p-3 border-2 border-royal-gold/50 shadow-inner">
            <div className="text-sm font-bold text-ink font-display">{location}</div>
            <button 
              onClick={detectLocation}
              className="text-[10px] text-royal-crimson font-black mt-1 hover:underline flex items-center gap-1 uppercase tracking-tighter"
            >
              {isLocating ? 'Seeking...' : 'Refresh Astrolabe'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem active={view === 'overview'} icon={<Activity size={18} />} label="Overview" onClick={() => setView('overview')} />
          <SidebarItem active={view === 'map'} icon={<MapIcon size={18} />} label="Live Map" onClick={() => setView('map')} />
          <SidebarItem active={view === 'analytics'} icon={<BarChart3 size={18} />} label="Analytics" onClick={() => setView('analytics')} />
          <SidebarItem active={view === 'complaints'} icon={<MessageSquare size={18} />} label="Complaints" onClick={() => setView('complaints')} />
          {profile?.role === 'government' && (
            <SidebarItem active={view === 'audit'} icon={<History size={18} />} label="Audit Logs" onClick={() => setView('audit')} />
          )}
        </nav>

        <div className="p-6 border-t-2 border-royal-gold/30">
          <div className="bg-royal-crimson rounded-sm p-4 shadow-lg border border-royal-gold">
            <div className="text-[10px] font-bold text-royal-gold uppercase mb-1 tracking-widest font-display">Royal Trust Score</div>
            <div className="text-3xl font-black text-royal-gold font-display">84%</div>
            <div className="w-full h-1.5 bg-royal-gold/20 rounded-full mt-2">
              <div className="w-[84%] h-full bg-royal-gold rounded-full shadow-[0_0_8px_#D4AF37]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 scroll-bg mughal-border m-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex justify-between items-end border-b-2 border-royal-gold/20 pb-6">
            <div>
              <h1 className="text-4xl royal-heading">
                {view === 'overview' && 'Constituency Intelligence'}
                {view === 'map' && 'Geospatial Monitoring'}
                {view === 'analytics' && 'Financial Performance'}
                {view === 'complaints' && 'Citizen Feedback'}
                {view === 'audit' && 'System Audit Trail'}
              </h1>
              <p className="text-ink/60 font-medium italic">By Royal Decree: Monitoring the National Infrastructure</p>
            </div>
            {renderRoleSpecificActions()}
          </header>

          {view === 'overview' && (
            <>
              {profile?.role === 'contractor' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <StatCard title="Avg. Risk Score" value="12%" icon={<ShieldCheck />} trend="Top 5%" color="text-emerald-600" />
                  <StatCard title="Projects Completed" value="48" icon={<CheckCircle2 />} trend="+4 this year" />
                  <StatCard title="Avg. Rating" value="4.7/5" icon={<Star />} trend="Verified" color="text-amber-600" />
                  <StatCard title="Total Value" value="₹840 Cr" icon={<TrendingUp />} trend="Grade-A" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Budget" value="₹1,240 Cr" icon={<TrendingUp />} trend="+₹45Cr" />
                <StatCard title="Funds Released" value="₹480 Cr" icon={<FileText />} trend="38% Utilized" />
                <StatCard title="High Risk Projects" value="4" icon={<AlertTriangle />} color="text-red-600" trend="2 Critical" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex justify-between items-center">
                    <h3 className="font-bold">Active Infrastructure Projects</h3>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs" placeholder="Search projects..." />
                      </div>
                      <Button variant="secondary" className="p-1.5"><Filter size={14} /></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map(p => (
                        <ProjectRow key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader><h3 className="font-bold">AI Risk Summary</h3></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Avg. Risk Probability</span>
                          <span className="text-sm font-bold text-amber-600">42%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-[42%] h-full bg-amber-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          AI detected 3 price anomalies and 1 burn-rate deviation in the last 24 hours.
                        </p>
                        <Button variant="secondary" className="w-full text-xs">View Detailed AI Audit</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><h3 className="font-bold">Recent Complaints</h3></CardHeader>
                    <CardContent className="space-y-4">
                      {MOCK_COMPLAINTS.map(c => (
                        <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{c.project}</span>
                            <span className="text-[10px] font-bold text-amber-600">{c.status}</span>
                          </div>
                          <p className="text-xs text-slate-700 line-clamp-2">{c.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {profile?.role === 'contractor' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Performance History & Ratings</h3>
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                        <Star className="text-emerald-600 fill-emerald-600" size={14} />
                        <span className="text-xs font-bold text-emerald-700">4.7 Avg Rating</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MOCK_PAST_PROJECTS.map(pp => (
                          <div key={pp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-sm text-slate-900">{pp.title}</h4>
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-bold">{pp.rating}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Budget</span>
                                <span className="font-bold text-slate-700">₹{(pp.budget / 10000000).toFixed(1)} Cr</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Risk Score</span>
                                <span className="font-bold text-emerald-600">{(pp.risk_score * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-500">Completed</span>
                                <span className="text-slate-400">{pp.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><h3 className="font-bold">Risk Score Trend</h3></CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_CONTRACTOR_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip />
                          <Line type="monotone" dataKey="avgRisk" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-slate-400 text-center mt-4">Average risk score has decreased by 38% since 2021.</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              {profile?.role === 'citizen' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">My Submitted Complaints</h3>
                      <Button variant="ghost" className="text-xs text-blue-600">View All</Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {MOCK_COMPLAINTS.map(c => (
                          <div key={c.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-100 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.category}</span>
                                <h4 className="font-bold text-sm text-slate-900">{c.project}</h4>
                              </div>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                c.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-3">{c.text}</p>
                            
                            {c.status === 'RESOLVED' && c.resolution && (
                              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-3">
                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-[10px] mb-1">
                                  <CheckCircle2 size={12} /> RESOLUTION
                                </div>
                                <p className="text-[11px] text-emerald-800">{c.resolution}</p>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-400">Filed on {c.date}</span>
                              <button className="text-blue-600 font-bold hover:underline">Track Timeline</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-slate-800">Civic Impact & Rewards</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Watchdog Level</div>
                            <div className="text-2xl font-black">Silver Guardian</div>
                          </div>
                          <Award size={32} className="text-blue-200" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span>Civic Score</span>
                            <span>850 / 1000</span>
                          </div>
                          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-white" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Achievements</h4>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-500 shadow-sm">
                            <Star size={20} fill="currentColor" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">First Resolution</div>
                            <div className="text-[10px] text-slate-500">Your complaint led to a project fix!</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm">
                            <Eye size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">Vigilant Eye</div>
                            <div className="text-[10px] text-slate-500">Submitted 5 site-verified photos.</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {view === 'map' && (
            <div key="map-view-wrapper" className="h-[600px]">
              <MapView projects={projects} onMarkerClick={setSelectedProject} />
            </div>
          )}

          {view === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><h3 className="font-bold">Burn Rate vs. Completion</h3></CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_BURN_RATE}>
                      <defs>
                        <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="released" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReleased)" />
                      <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><h3 className="font-bold">Contractor Performance Ranking</h3></CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'L&T', score: 92 },
                      { name: 'Tata', score: 88 },
                      { name: 'Reliance', score: 75 },
                      { name: 'Local Inc', score: 45 },
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#7B1113" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 'complaints' && (
            <div className="space-y-6">
              <Card className="card-ancient">
                <CardHeader><h3 className="font-bold text-xl">Active Citizen Grievances</h3></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_COMPLAINTS.map(c => (
                      <div key={c.id} className="p-6 bg-white/50 border-2 border-royal-gold/20 rounded-sm shadow-sm hover:border-royal-gold transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-black text-royal-crimson uppercase tracking-widest">{c.category}</span>
                          <span className={cn(
                            "px-2 py-1 rounded-sm text-[10px] font-bold uppercase",
                            c.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-700" : "bg-royal-crimson text-white"
                          )}>
                            {c.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">{c.project}</h4>
                        <p className="text-sm text-ink/80 mb-4 italic">"{c.text}"</p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-ink/40">
                          <span>Filed by {c.user}</span>
                          <span>{c.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 'audit' && (
            <div className="space-y-6">
              <Card className="card-ancient">
                <CardHeader><h3 className="font-bold text-xl">Royal Audit Ledger</h3></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AuditItem action="Funds Released" user="DM Office" date="2026-02-15" value="+₹2.5 Cr" />
                    <AuditItem action="Material Added" user="Contractor" date="2026-02-12" value="Cement (5000 bags)" />
                    <AuditItem action="Progress Update" user="Contractor" date="2026-02-10" value="25% -> 28%" />
                    <AuditItem action="System Access" user="Govt Admin" date="2026-02-09" value="Login Verified" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                      selectedProject.status === 'Active' ? "bg-blue-100 text-blue-700" : 
                      selectedProject.status === 'Delayed' ? "bg-amber-100 text-amber-700" : 
                      "bg-slate-100 text-slate-700"
                    )}>
                      {selectedProject.status}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                      selectedProject.risk_level === 'HIGH' ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {selectedProject.risk_level} RISK
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedProject.id}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedProject.title}</h2>
                  <p className="text-slate-500 text-sm">{selectedProject.description}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedProject(null)}>Close</Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Budget</div>
                      <div className="text-lg font-bold text-slate-900">₹{(selectedProject.budget_allocated / 10000000).toFixed(1)} Cr</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Released</div>
                      <div className="text-lg font-bold text-slate-900">₹{(selectedProject.funds_released / 10000000).toFixed(1)} Cr</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Completion</div>
                      <div className="text-lg font-bold text-blue-600">{selectedProject.completion_percentage}%</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader><h3 className="font-bold">AI Intelligence Explanation</h3></CardHeader>
                    <CardContent className="bg-amber-50/50">
                      <div className="flex gap-4">
                        <div className="p-3 bg-amber-100 rounded-xl h-fit">
                          <AlertTriangle className="text-amber-600" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-900 mb-1">Anomaly Detected</div>
                          <p className="text-sm text-amber-800 leading-relaxed">{selectedProject.risk_reason}</p>
                          <div className="mt-4 flex gap-2">
                            <Button className="text-xs py-1.5 bg-amber-600">Flag for Audit</Button>
                            <Button variant="secondary" className="text-xs py-1.5 border-amber-200">Request Explanation</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><h3 className="font-bold">Financial Audit Trail</h3></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <AuditItem action="Funds Released" user="DM Office" date="2026-02-15" value="+₹2.5 Cr" />
                        <AuditItem action="Material Added" user="Contractor" date="2026-02-12" value="Cement (5000 bags)" />
                        <AuditItem action="Progress Update" user="Contractor" date="2026-02-10" value="25% -> 28%" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader><h3 className="font-bold">Contractor Details</h3></CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">LT</div>
                        <div>
                          <div className="text-sm font-bold">{selectedProject.contractor}</div>
                          <div className="text-[10px] text-slate-400 uppercase">Verified Grade-A</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Performance Score</span>
                          <span className="font-bold text-emerald-600">92/100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Active Projects</span>
                          <span className="font-bold">12</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 text-white border-none">
                    <CardHeader><h3 className="font-bold">Quick Actions</h3></CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 text-xs">Download Full Dossier</Button>
                      <Button variant="ghost" className="w-full text-white hover:bg-white/10 text-xs">Generate RTI Draft</Button>
                      <Button variant="ghost" className="w-full text-red-400 hover:bg-red-400/10 text-xs">Suspend Project</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complaint Submission Modal */}
      <AnimatePresence>
        {showComplaintModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xl font-black text-slate-900">File a Civic Complaint</h2>
                <p className="text-slate-500 text-xs">Your report helps improve constituency transparency.</p>
              </div>
              <form onSubmit={handleComplaintSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Project</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={complaintForm.project_id}
                    onChange={(e) => setComplaintForm({...complaintForm, project_id: e.target.value})}
                    required
                  >
                    <option value="">Select a project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                    required
                  >
                    <option value="Quality">Quality Control</option>
                    <option value="Delay">Project Delay</option>
                    <option value="Pricing">Pricing Anomaly</option>
                    <option value="Safety">Public Safety</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Describe the issue in detail..."
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowComplaintModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-blue-600">Submit Report</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-bold transition-all font-display uppercase tracking-widest",
      active 
        ? "bg-royal-crimson text-royal-gold shadow-xl border-2 border-royal-gold" 
        : "text-ink/60 hover:bg-royal-gold/10 hover:text-royal-crimson"
    )}
  >
    {icon}
    {label}
  </button>
);

const StatCard = ({ title, value, icon, trend, color = "text-ink" }: any) => (
  <Card className="p-6 card-ancient border-royal-gold/40">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-royal-gold/10 rounded-sm text-royal-crimson border border-royal-gold/20">
        {icon}
      </div>
      {trend && (
        <span className={cn(
          "text-[10px] font-black px-2 py-1 rounded-sm border",
          trend.includes('+') || trend.includes('%') ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-royal-crimson/10 text-royal-crimson border-royal-crimson/20"
        )}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-ink/40 text-[10px] font-black uppercase tracking-[0.2em] font-display">{title}</div>
    <div className={cn("text-3xl font-black mt-1 font-display", color)}>{value}</div>
  </Card>
);

const ProjectRow = ({ project, onClick }: any) => (
  <div 
    onClick={onClick}
    className="group p-6 bg-parchment/50 border-2 border-royal-gold/20 rounded-sm hover:border-royal-gold hover:shadow-xl transition-all cursor-pointer flex items-center gap-6"
  >
    <div className={cn(
      "w-14 h-14 rounded-sm flex items-center justify-center shrink-0 border-2",
      project.risk_level === 'HIGH' ? "bg-royal-crimson/10 text-royal-crimson border-royal-crimson/30" : "bg-emerald-50 text-emerald-600 border-emerald-200"
    )}>
      {project.risk_level === 'HIGH' ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1">
        <h4 className="font-bold text-xl text-ink font-display truncate">{project.title}</h4>
        <span className={cn(
          "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
          project.status === 'Active' ? "bg-blue-50 text-blue-700 border-blue-200" : 
          project.status === 'Delayed' ? "bg-amber-50 text-amber-700 border-amber-200" : 
          "bg-slate-100 text-slate-700 border-slate-300"
        )}>
          {project.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-ink/40 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><Users size={12} /> {project.contractor}</span>
        <span className="flex items-center gap-1.5"><Clock size={12} /> {project.delay_days}d Delay</span>
      </div>
    </div>
    <div className="text-right">
      <div className="text-lg font-black text-royal-crimson font-display">₹{(project.budget_allocated / 10000000).toFixed(1)} Cr</div>
      <div className="w-32 h-2 bg-royal-gold/20 rounded-full mt-2 overflow-hidden border border-royal-gold/10">
        <div className="h-full bg-royal-crimson shadow-[0_0_8px_#7B1113]" style={{ width: `${project.completion_percentage}%` }} />
      </div>
    </div>
    <ArrowUpRight className="text-royal-gold group-hover:text-royal-crimson transition-colors" size={24} />
  </div>
);

const AuditItem = ({ action, user, date, value }: any) => (
  <div className="flex justify-between items-center p-4 bg-parchment/30 rounded-sm border-2 border-royal-gold/10 hover:border-royal-gold/40 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/50 rounded-sm border border-royal-gold/20 flex items-center justify-center text-royal-crimson">
        <Activity size={18} />
      </div>
      <div>
        <div className="text-sm font-black text-ink font-display uppercase tracking-widest">{action}</div>
        <div className="text-[10px] text-ink/40 font-bold">{user} • {date}</div>
      </div>
    </div>
    <div className="text-sm font-black text-royal-crimson font-display">{value}</div>
  </div>
);
