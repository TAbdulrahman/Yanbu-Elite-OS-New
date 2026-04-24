/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import './i18n';
import Layout from './components/Layout';
import ScannerModule from './components/ScannerModule';
import Login from './components/Login';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Users, AlertTriangle, TrendingUp, Clock, CheckCircle2, Search } from 'lucide-react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { StudentMovement, Asset, UserProfile } from './types';
import { audioService } from './services/audioService';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMovements, setActiveMovements] = useState<StudentMovement[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile/role
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setProfile(profile);
          // Role-based Direction
          if (profile.role === 'ceo') setActiveTab('dashboard');
          else if (profile.role === 'teacher') setActiveTab('scanner');
          else if (profile.role === 'counselor') setActiveTab('compliance');
        }
      } else {
        setProfile(null);
      }
      setIsInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    audioService.setMute(isMuted);
    if (!isMuted) {
      audioService.requestPermission();
    }
  }, [isMuted]);

  // Fetch active movements and subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchMovements = async () => {
      const { data, error } = await supabase
        .from('student_movement')
        .select('*')
        .eq('status', 'Active')
        .order('start_time', { ascending: false });
      
      if (data) setActiveMovements(data);
    };

    fetchMovements();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_movement',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as StudentMovement;
            if (newItem.status === 'Active') {
              setActiveMovements(prev => [newItem, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as StudentMovement;
            if (updatedItem.status === 'Completed') {
              setActiveMovements(prev => prev.filter(m => m.id !== updatedItem.id));
            } else {
              setActiveMovements(prev => prev.map(m => m.id === updatedItem.id ? updatedItem : m));
            }
          } else if (payload.eventType === 'DELETE') {
            setActiveMovements(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleResolveMovement = async (id: string) => {
    const { error } = await supabase
      .from('student_movement')
      .update({ status: 'Completed', end_time: new Date().toISOString() })
      .eq('id', id);
    
    if (!error) {
      audioService.playSuccess();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-matte-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-4" />
        <p className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold">Synchronizing Governance OS</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      isMuted={isMuted}
      onToggleMute={() => setIsMuted(!isMuted)}
      onLogout={handleLogout}
      profile={profile}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          activeMovements={activeMovements} 
          onResolveMovement={handleResolveMovement}
        />
      )}
      {activeTab === 'scanner' && (
        <ScannerModule />
      )}
      {activeTab === 'compliance' && (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white tracking-tight uppercase">Compliance Hub</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-ruby/60 text-[10px] uppercase tracking-[0.4em] font-bold">Active Disciplinary Oversight</p>
                <div className="h-px w-12 bg-ruby/20" />
                <span className="text-ruby text-[9px] font-bold animate-pulse">MONITORED SESSION</span>
              </div>
            </div>
            <button 
              onClick={() => {
                const csv = "Date,Student,Type,Severity,Status\n" + 
                  new Date().toLocaleDateString() + ",Governance Export,Noor-Sync,Internal,Consolidated";
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', `noor_sync_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-gold hover:text-black transition-all group"
            >
              <TrendingUp className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Run Noor-Sync Export
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-matte-black border border-white/5 p-6 rounded-sm glass">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold">Transaction History</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-ruby/10 text-ruby text-[8px] font-bold rounded-sm">CRITICAL: 12</span>
                  <span className="px-2 py-1 bg-gold/10 text-gold text-[8px] font-bold rounded-sm">PENDING: 45</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm hover:border-gold/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-sm bg-ruby/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-ruby" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Automated Time Breach Record</p>
                        <p className="text-[9px] text-gray-500 uppercase mt-0.5">Governance System • 2m ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-gold uppercase tracking-widest">Severity: Medium</p>
                        <p className="text-[8px] text-gray-600 uppercase font-mono">ID: LG-77291</p>
                      </div>
                      <button className="p-2 border border-white/10 rounded-sm hover:bg-gold/10 hover:text-gold transition-all">
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab !== 'dashboard' && activeTab !== 'scanner' && activeTab !== 'compliance' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-700">
          <p className="text-xl font-bold uppercase tracking-widest">{activeTab} module under development</p>
        </div>
      )}
    </Layout>
  );
}

function Dashboard({ activeMovements, onResolveMovement }: { activeMovements: StudentMovement[], onResolveMovement: (id: string) => void }) {
  const { t } = useTranslation();
  const [heatmapData, setHeatmapData] = useState<{room: string, count: number}[]>([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      const { data } = await supabase
        .from('student_movement')
        .select('source_room');
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(m => {
          if (m.source_room) {
            counts[m.source_room] = (counts[m.source_room] || 0) + 1;
          }
        });
        setHeatmapData(Object.entries(counts).map(([room, count]) => ({ room, count })));
      }
    };
    fetchHeatmap();
  }, [activeMovements]);

  const stats = [
    { label: 'Total Students', value: '1,280', icon: Users, color: 'text-gold' },
    { label: 'Active Alerts', value: activeMovements.filter(m => {
      const start = new Date(m.start_time).getTime();
      const elapsed = (Date.now() - start) / 1000;
      return elapsed > 300;
    }).length.toString(), icon: AlertTriangle, color: 'text-ruby' },
    { label: 'Arrival Rate', value: '94%', icon: TrendingUp, color: 'text-emerald' },
    { label: 'Active Movements', value: activeMovements.length.toString(), icon: Clock, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-bold text-white tracking-tight font-serif uppercase leading-none">{t('dashboard')}</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-2 font-bold">Architectural Governance System • Real-Time School Pulse</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/5 p-6 rounded-sm hover:border-gold/30 transition-all group cursor-pointer glass"
          >
            <div className="flex justify-between items-start">
              <div className={stat.color}>
                <stat.icon className="w-5 h-5 opacity-70" />
              </div>
              <div className="text-[9px] text-emerald font-bold px-2 py-1 bg-emerald/5 border border-emerald/20 rounded-sm tracking-widest">+12%</div>
            </div>
            <div className="mt-6">
              <h3 className="text-3xl font-bold text-white font-serif tracking-tighter leading-none">{stat.value}</h3>
              <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/5 rounded-sm p-8 h-[400px] flex flex-col glass relative overflow-hidden">
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-6 font-bold">Real-Time Movement Heatmap</h3>
            <div className="flex-1 flex gap-4 items-end justify-around border-b border-white/10 pb-4">
              {heatmapData.length > 0 ? heatmapData.slice(0, 5).map((data, i) => (
                <div key={data.room} className="flex flex-col items-center gap-4 w-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(data.count * 20, 200)}px` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-gold/40 to-gold rounded-t-sm relative group"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.count}
                    </div>
                  </motion.div>
                  <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold text-center">{data.room}</span>
                </div>
              )) : (
                <div className="text-[10px] uppercase tracking-widest text-gray-700 animate-pulse">Waiting for Movement Data...</div>
              )}
            </div>
            <div className="absolute top-0 right-0 p-4">
              <div className="px-2 py-1 bg-emerald/10 text-emerald text-[9px] font-bold rounded-sm tracking-widest">LIVE SYNC</div>
            </div>
          </div>
          <div className="bg-matte-black border border-white/5 rounded-sm p-6 glass">
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-6 font-bold">Movement Tracking Core</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {activeMovements.length > 0 ? (
                  activeMovements.map((movement) => (
                    <MovementTimer key={movement.id} movement={movement} onResolve={() => onResolveMovement(movement.id)} />
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center opacity-20 italic text-sm">
                    No active movements detected
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-matte-black border border-white/5 rounded-sm p-6 glass">
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-8 font-bold leading-none">{t('health_alerts')}</h3>
            <div className="space-y-5">
              <div className="p-4 bg-ruby/5 border-l-2 border-ruby rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-ruby/20 px-2 py-0.5 text-[8px] text-ruby font-bold uppercase tracking-widest">Critical</div>
                <p className="text-[10px] font-extrabold text-ruby uppercase tracking-widest">Severe Allergy Alert</p>
                <p className="text-sm font-serif font-bold mt-1 tracking-tight">Ahmed Khalid Al-Saud</p>
              </div>
              <div className="p-4 bg-gold/5 border-l-2 border-gold rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gold/20 px-2 py-0.5 text-[8px] text-gold font-bold uppercase tracking-widest">Arrears</div>
                <p className="text-[10px] font-extrabold text-gold uppercase tracking-widest">Tuition Compliance</p>
                <p className="text-sm font-serif font-bold mt-1 tracking-tight">Sara Al-Majid</p>
              </div>
            </div>
          </div>

          <div className="bg-matte-black border border-white/5 rounded-sm p-6 glass relative overflow-hidden">
            <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-6 font-bold leading-none uppercase">Resource Allocation</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-3">AI Substitute Recommendation</p>
                <div className="p-4 bg-white/5 border border-white/5 rounded-sm flex items-center gap-4 group hover:border-gold/30 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-gold opacity-80" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gold uppercase tracking-wider">Prof. Mohammed S.</p>
                    <p className="text-[9px] text-gray-400 uppercase font-mono mt-0.5 tracking-tighter">Available Now | RLS:4</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-matte-black/40 rounded-sm border border-white/5">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] uppercase opacity-40 tracking-widest font-bold">Total Arrears</span>
                  <span className="text-2xl font-serif text-gold font-bold tracking-tighter leading-none">SAR 124.5K</span>
                </div>
                <div className="mt-3 w-full h-[1px] bg-gold opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovementTimer({ movement, onResolve }: { movement: StudentMovement, onResolve: () => void, key?: any }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const LIMIT = 300; // 5 minutes
  
  const audioTriggeredRef = useRef<{ pre: boolean }>({ pre: false });
  const lastViolationToneRef = useRef<number>(0);
  const autoLogTriggeredRef = useRef<boolean>(movement.auto_logged || false);

  useEffect(() => {
    const handleAutoLog = async () => {
      try {
        // 1. Mark as auto-logged to prevent duplicate entries
        await supabase
          .from('student_movement')
          .update({ auto_logged: true })
          .eq('id', movement.id);

        // 2. Generate Compliance Entry
        await supabase
          .from('compliance_logs')
          .insert({
            student_id: movement.student_id,
            student_name: movement.student_name,
            incident_type: 'Time Breach',
            severity: 'Medium',
            description: `Student exceeded 10-minute movement limit during ${movement.location} break.`,
            tags: ['Time Breach', 'Movement Violation'],
            created_at: new Date().toISOString()
          });
          
        // 3. Financial/Administrative Trigger: If > 3 breaches, add fee & meeting
        const { count } = await supabase
          .from('compliance_logs')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', movement.student_id)
          .eq('incident_type', 'Time Breach');

        if (count && count >= 3) {
          // Add Admin Fee
          await supabase.from('financial_entries').insert({
            student_id: movement.student_id,
            amount: 50,
            description: 'Administrative Multi-Violation System Fee',
            status: 'pending',
            created_at: new Date().toISOString()
          });

          // Schedule Meeting
          await supabase.from('parent_meetings').insert({
            student_id: movement.student_id,
            student_name: movement.student_name,
            reason: 'Persistent Movement Governance Violation (3+ Breaches)',
            status: 'pending',
            created_at: new Date().toISOString()
          });
          
          audioService.sendNotification("Escalated Governance", `Parent meeting & fee triggered for ${movement.student_name}`);
        }

        console.log(`Auto-logged time breach for ${movement.student_name}`);
      } catch (error) {
        console.error('Failed to auto-log breach:', error);
      }
    };

    const calculate = () => {
      const start = new Date(movement.start_time).getTime();
      const now = Date.now();
      const elapsed = (now - start) / 1000;
      const remaining = LIMIT - elapsed;
      
      const newTimeLeft = Math.abs(Math.floor(remaining));
      const newIsOverdue = remaining < 0;
      
      setTimeLeft(newTimeLeft);
      setIsOverdue(newIsOverdue);

      // Audio Logic
      if (!newIsOverdue && newTimeLeft <= 60 && !audioTriggeredRef.current.pre) {
        audioService.playPreAlert();
        audioTriggeredRef.current.pre = true;
      }

      if (newIsOverdue) {
        // Auto-Log Feature: If violation > 5 minutes (total 10 mins outside)
        if (newTimeLeft >= 300 && !autoLogTriggeredRef.current) {
          autoLogTriggeredRef.current = true;
          handleAutoLog();
        }

        if (now - lastViolationToneRef.current >= 10000) {
          audioService.playViolation();
          audioService.sendNotification(
            "Territory Violation", 
            `${movement.student_name} has exceeded the time limit for ${movement.location}`
          );
          lastViolationToneRef.current = now;
        }
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [movement]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${isOverdue ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = !isOverdue && timeLeft <= 60;
  const [showAssetInvestigation, setShowAssetInvestigation] = useState(false);
  const [localAssets, setLocalAssets] = useState<Asset[]>([]);

  const handleInvestigateAssets = async () => {
    setShowAssetInvestigation(true);
    // Fetch assets in the same source_room
    if (movement.source_room) {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('location', movement.source_room);
      
      if (data && data.length > 0) {
        setLocalAssets(data);
      } else {
        // Mocking some assets if DB is empty
        setLocalAssets([
          { id: 'ASSET-01', name: 'Microscope Elite', location: movement.source_room, status: 'functional' },
          { id: 'ASSET-02', name: 'Workstation 12', location: movement.source_room, status: 'functional' },
        ]);
      }
    }
  };

  const reportDamage = async (assetId: string) => {
    // Link student to asset damage
    await supabase.from('compliance_logs').insert({
      student_id: movement.student_id,
      student_name: movement.student_name,
      incident_type: 'Property Risk',
      severity: 'High',
      description: `Potential damage reported for ${assetId} during movement breach of ${movement.student_name}.`,
      tags: ['Asset Inspection', 'Property Risk'],
      created_at: new Date().toISOString()
    });
    
    audioService.playViolation();
    setShowAssetInvestigation(false);
    audioService.sendNotification("Asset Linked", `Damage report generated for ${assetId}`);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}

      animate={{ 
        opacity: 1, 
        scale: 1,
        borderColor: isWarning 
          ? ['rgba(197, 160, 89, 0.2)', 'rgba(197, 160, 89, 0.8)', 'rgba(197, 160, 89, 0.2)'] 
          : (isOverdue ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.05)')
      }}
      transition={{ 
        borderColor: isWarning ? { duration: 2, repeat: Infinity } : { duration: 0.5 },
        default: { duration: 0.5 }
      }}
      exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      className={cn(
        "flex items-center gap-4 py-4 border-b border-l-4 last:border-0 group px-5 rounded-sm transition-all duration-500 relative overflow-hidden glass",
        isOverdue ? "bg-gradient-to-r from-ruby/20 to-transparent border-l-ruby" : "hover:bg-white/5 border-l-gold"
      )}
    >
      {isWarning && (
        <motion.div 
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-gold pointer-events-none"
        />
      )}

      <div className={cn(
        "w-12 h-12 rounded-sm border-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden",
        isOverdue ? "border-ruby shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-gold/30 shadow-[0_0_10px_rgba(197,160,89,0.1)]"
      )}>
        <img 
          src={movement.photo_url} 
          alt="" 
          className={cn("w-full h-full object-cover")}
          referrerPolicy="no-referrer"
        />
        {isOverdue && (
          <div className="absolute inset-0 flex items-center justify-center bg-ruby/40 backdrop-blur-[1px]">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-white/90">{movement.student_name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-[0.2em] border",
                isOverdue ? "bg-ruby/20 text-ruby border-ruby/30" : "bg-gold/10 text-gold border-gold/20"
              )}>
                {movement.location}
              </span>
              <span className={cn(
                "text-[7px] font-bold uppercase tracking-widest",
                isOverdue ? "text-ruby animate-pulse" : (isWarning ? "text-gold" : "text-white/30")
              )}>
                {isOverdue ? 'TERRITORY VIOLATION' : (isWarning ? 'NEARING LIMIT' : 'ACTIVE STATUS')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "font-mono text-xl font-bold tracking-tighter leading-none transition-colors",
              isOverdue ? "text-ruby" : (isWarning ? "text-gold" : "text-white")
            )}>
              {formatTime(timeLeft)}
            </p>
            {isOverdue && <p className="text-[7px] text-ruby font-bold uppercase mt-1 tracking-tighter">Exceeded Limit</p>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        {isOverdue && (
          <button 
            onClick={handleInvestigateAssets}
            className="p-2 rounded-sm border border-gold/30 text-gold hover:bg-gold hover:text-black transition-all"
            title="Investigate Local Assets"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={onResolve}
          className={cn(
            "p-2 rounded-sm border transition-all hover:scale-105 active:scale-95",
            isOverdue ? "border-ruby/30 text-ruby hover:bg-ruby hover:text-white" : "border-white/10 text-white/40 hover:border-emerald hover:text-emerald hover:bg-emerald/10"
          )}
          title={t('resolve', 'Resolve')}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>

      {/* Asset Investigation Overlay */}
      <AnimatePresence>
        {showAssetInvestigation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-matte-black/90 backdrop-blur-md"
          >
            <div className="bg-surface border border-gold/30 p-8 rounded-sm max-w-md w-full glass">
              <h3 className="text-xl font-serif font-bold text-gold uppercase tracking-tight mb-2">Asset Inspection</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Investigating assets in {movement.source_room}</p>
              
              <div className="space-y-4">
                {localAssets.map(asset => (
                  <div key={asset.id} className="p-4 bg-white/5 border border-white/10 rounded-sm flex justify-between items-center group hover:border-gold/30">
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{asset.name}</p>
                      <p className="text-[9px] text-gray-500 font-mono">{asset.id}</p>
                    </div>
                    <button 
                      onClick={() => reportDamage(asset.id)}
                      className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-ruby/30 text-ruby hover:bg-ruby hover:text-white transition-all"
                    >
                      Report Damage
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowAssetInvestigation(false)}
                className="w-full mt-8 py-3 bg-white/5 text-gray-400 font-bold uppercase tracking-widest text-[9px] border border-white/10 rounded-sm hover:text-white transition-all"
              >
                Cancel Investigation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

