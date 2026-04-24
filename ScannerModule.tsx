import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldAlert, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  History, 
  Timer,
  Camera,
  Search,
  QrCode
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface Student {
  id: string;
  name: string;
  photo_url: string;
  health_alerts: string[];
  financial_status: 'clear' | 'arrears' | 'critical';
  last_scan?: string;
}

export default function ScannerModule() {
  const { t } = useTranslation();
  const [lastScanned, setLastScanned] = useState<Student | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [currentRoom, setCurrentRoom] = useState('Room 402');

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    // 1. Fetch student info (Mocked for now, normally use Supabase)
    const student: Student = {
      id: decodedText,
      name: "Khalid Ibrahim",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid",
      health_alerts: ["Peanut Allergy", "Asthma"],
      financial_status: "arrears",
      last_scan: new Date().toLocaleTimeString()
    };

    // 2. Check if student has an active movement
    const { data: activeMovements } = await supabase
      .from('student_movement')
      .select('*')
      .eq('student_id', decodedText)
      .eq('status', 'Active');

    if (activeMovements && activeMovements.length > 0) {
      // RETURN SCAN: Resolve the movement
      await supabase
        .from('student_movement')
        .update({ status: 'Completed', end_time: new Date().toISOString() })
        .eq('id', activeMovements[0].id);
      
      setLastScanned(student);
      setLogs(prev => [{ ...student, type: 'Return', timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    } else if (['Restroom', 'Clinic', 'Admin'].includes(scanType)) {
      // START SCAN: Create new movement
      await supabase
        .from('student_movement')
        .insert({
          student_id: student.id,
          student_name: student.name,
          photo_url: student.photo_url,
          location: scanType,
          source_room: currentRoom,
          start_time: new Date().toISOString(),
          status: 'Active'
        });
      
      setLastScanned(student);
      setLogs(prev => [{ ...student, type: scanType, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    } else {
      // REGULAR SCAN: Just attendance
      setLastScanned(student);
      setLogs(prev => [{ ...student, type: scanType, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
    }

    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const [scanType, setScanType] = useState('Attendance');

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('scanner')}</h1>
          <div className="flex gap-4 mt-2">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{currentRoom}</p>
            <select 
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
              className="bg-matte-black/50 border border-gold/30 text-gold text-[8px] uppercase font-bold px-2 py-0.5 rounded-sm outline-none"
            >
              {['Room 402', 'Science Lab', 'Art Studio', 'Library Main'].map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={cn(
            "px-6 py-3 rounded-sm font-extrabold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2",
            isScanning ? 'bg-ruby text-white' : 'bg-gold text-matte-black'
          )}
        >
          {isScanning ? <XCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          {isScanning ? 'Stop Scanner' : 'Start AI Scanner'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Area */}
        <div className="space-y-6">
          <div className="bg-matte-black border border-white/10 rounded-sm overflow-hidden relative min-h-[400px] flex flex-col glass">
            {isScanning ? (
              <div id="qr-reader" className="w-full flex-1" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative">
                <div className="absolute inset-0 border-2 border-gold/10 m-8 border-dashed"></div>
                <div className="w-20 h-20 border-2 border-gold/40 flex items-center justify-center mb-6 relative z-10 border-dashed">
                  <QrCode className="w-10 h-10 text-gold animate-pulse" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2 relative z-10">Smart Scanner</h3>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs relative z-10">
                  Point QR Code to camera for instant log
                </p>
              </div>
            )}
            
            <div className="p-4 bg-white/5 flex gap-2 overflow-x-auto border-t border-white/5">
              {['Attendance', 'Restroom', 'Clinic', 'Library', 'Asset'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setScanType(type)}
                  className={cn(
                    "px-4 py-2 rounded-sm border text-[9px] font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                    scanType === type ? "bg-gold text-matte-black border-gold" : "bg-white/5 border-white/10 text-gray-400 hover:border-gold/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-gold" />
              Recent Scans
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {logs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-hover border border-white/10 overflow-hidden">
                      <img src={log.photo_url} alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{log.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Attendance • {log.timestamp}</p>
                    </div>
                    <div className="text-emerald">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <p className="text-sm text-gray-600 italic">No scans recorded in this session.</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile / Details Area */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {lastScanned ? (
              <motion.div
                key={lastScanned.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border-2 border-gold/30 rounded-3xl p-8 space-y-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-lg bg-matte-black border-2 border-gold p-1 shadow-2xl relative overflow-hidden">
                    <img src={lastScanned.photo_url} alt={lastScanned.name} className="w-full h-full rounded-sm" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse"></div>
                      <span className="text-[9px] text-emerald font-bold uppercase tracking-[0.3em]">Live Identity Link</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif uppercase leading-tight">{lastScanned.name}</h2>
                    <p className="text-gold/60 font-mono text-xs mt-1">UID: {lastScanned.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-sm bg-ruby/5 border-l-4 border-ruby glass">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-3 h-3 text-ruby" />
                      <span className="text-[9px] font-bold text-ruby uppercase tracking-widest">{t('health_alerts')}</span>
                    </div>
                    <div className="space-y-1">
                      {lastScanned.health_alerts.map(alert => (
                        <p key={alert} className="text-xs font-bold">{alert}</p>
                      ))}
                    </div>
                  </div>
                  <div className={cn(
                    "p-4 rounded-sm border-l-4 glass",
                    lastScanned.financial_status === 'clear' 
                      ? 'border-emerald' 
                      : 'border-gold'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className={cn("w-3 h-3", lastScanned.financial_status === 'clear' ? 'text-emerald' : 'text-gold')} />
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest",
                        lastScanned.financial_status === 'clear' ? 'text-emerald' : 'text-gold'
                      )}>{t('financial_status')}</span>
                    </div>
                    <p className="text-xs font-bold">
                      {lastScanned.financial_status === 'arrears' ? 'Tuition Arrears' : 'Account Clear'}
                    </p>
                  </div>
                </div>

                <div className="bg-matte-black/50 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Current Location
                    </span>
                    <span className="font-bold text-gold">Grade 4 - Room B12</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Last Attendance</span>
                    <span className="font-bold">08:15 AM</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-emerald text-matte-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                    Approve Entry
                  </button>
                  <button className="px-6 py-4 border border-white/10 rounded-xl hover:bg-surface-hover transition-colors">
                    Flag Issue
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface/50 border border-white/5 border-dashed rounded-3xl h-[600px] flex flex-col items-center justify-center text-gray-700">
                <User className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-sm font-medium tracking-wide uppercase opacity-30">Waiting for Scan Data</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
