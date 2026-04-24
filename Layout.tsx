import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  QrCode, 
  Package, 
  ShieldAlert, 
  Wallet, 
  Settings, 
  LogOut, 
  Bell, 
  Globe,
  MoreVertical,
  Search,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300",
      active ? "bg-gold text-matte-black shadow-lg shadow-gold/20" : "text-gray-400 hover:bg-white/5 hover:text-white",
      collapsed && "justify-center px-0"
    )}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">{label}</span>}
  </button>
);

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab,
  isMuted,
  onToggleMute,
  onLogout,
  profile
}: { 
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onLogout?: () => void;
  profile?: UserProfile | null;
}) {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = React.useState(false);
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'scanner', icon: QrCode, label: t('scanner') },
    { id: 'assets', icon: Package, label: t('assets') },
    { id: 'compliance', icon: ShieldAlert, label: t('compliance') },
    { id: 'finance', icon: Wallet, label: t('finance') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="flex h-screen bg-matte-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className={cn(
          "h-full border-white/5 bg-matte-black flex flex-col z-20 glass",
          isRtl ? "border-l" : "border-r"
        )}
      >
        <div className="p-6 flex items-center gap-3 h-20">
          <div className="w-10 h-10 bg-gold rounded-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold/20">
            <span className="font-bold text-matte-black text-xl">Y</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-gold font-serif leading-none uppercase">Yanbu Elite</span>
              <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold">Governance OS</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <SidebarItem
            icon={LogOut}
            label={t('logout')}
            collapsed={collapsed}
            onClick={onLogout}
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-matte-black/50 backdrop-blur-xl px-8 flex items-center justify-between z-10 glass">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold transition-colors", isRtl ? "right-3" : "left-3")} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-sm py-2 pr-4 text-xs font-medium focus:outline-none focus:border-gold/50 transition-all",
                  isRtl ? "pl-4 pr-10" : "pl-10 pr-4 text-left"
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleMute}
              className="p-2 border border-gold/30 rounded-sm hover:bg-gold/10 transition-colors text-gold"
              title={isMuted ? "Unmute Alerts" : "Mute Alerts"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-white/5 rounded-sm transition-colors text-gray-400 hover:text-gold flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>
            
            <button className="p-2 hover:bg-surface rounded-xl transition-colors text-gray-400 hover:text-ruby relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-ruby rounded-full border-2 border-matte-black"></span>
            </button>

            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{profile?.full_name || 'Admin User'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight">{profile?.role || t('compliance')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'admin'}`} 
                  alt="User avatar" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          
          {/* Emergency Floating Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "fixed bottom-8 w-16 h-16 bg-ruby rounded-sm flex items-center justify-center shadow-2xl shadow-ruby/40 z-30 group",
              isRtl ? "left-8" : "right-8"
            )}
          >
            <ShieldAlert className="w-8 h-8 text-white group-hover:animate-pulse" />
            <span className={cn(
              "absolute -top-12 bg-ruby text-white text-[10px] font-bold px-3 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest",
              isRtl ? "left-0" : "right-0"
            )}>
              {t('emergency')}
            </span>
          </motion.button>
        </div>
      </main>
    </div>
  );
}
