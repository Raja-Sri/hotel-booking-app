import React, { useState } from 'react';
import { Hotel as HotelIcon, User, LogOut, Terminal, Mail, Clock, ShieldAlert } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenLogs: () => void;
  onOpenEmails: () => void;
  activeTab: 'explore' | 'bookings' | 'admin';
  setActiveTab: (tab: 'explore' | 'bookings' | 'admin') => void;
  unreadEmailCount: number;
}

export default function Header({
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenLogs,
  onOpenEmails,
  activeTab,
  setActiveTab,
  unreadEmailCount,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-luxury-accent-cream border-b border-luxury-beige shadow-sm flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 bg-luxury-gold rounded-xl flex items-center justify-center text-luxury-navy font-black text-2xl shadow-lg shadow-luxury-gold/15 transform transition hover:scale-105 active:scale-95">
            S
          </div>
          <span className="text-2xl font-black text-luxury-navy tracking-tight">
            Stay<span className="text-luxury-gold-dark">Vibe</span>
          </span>
        </div>

        {/* Center Navigation */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setActiveTab('explore')}
            className={`font-extrabold pb-1 px-1 text-sm transition-all focus:outline-none cursor-pointer ${
              activeTab === 'explore'
                ? 'text-luxury-gold-dark border-b-2 border-luxury-gold'
                : 'text-luxury-clay hover:text-luxury-gold border-b-2 border-transparent'
            }`}
          >
            <span>Explore</span>
          </button>
          
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth('login');
              } else {
                setActiveTab('bookings');
              }
            }}
            className={`font-extrabold pb-1 px-1 text-sm transition-all focus:outline-none cursor-pointer ${
              activeTab === 'bookings'
                ? 'text-luxury-gold-dark border-b-2 border-luxury-gold'
                : 'text-luxury-clay hover:text-luxury-gold border-b-2 border-transparent'
            }`}
          >
            <span>My Trips</span>
          </button>

          {/* Admin Portal Tab (Only visible to authenticated administrators) */}
          {currentUser && currentUser.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`font-semibold pb-1 px-1.5 text-xs transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full py-1 hover:bg-rose-100 ${
                activeTab === 'admin'
                  ? 'ring-2 ring-rose-500 font-extrabold shadow-sm'
                  : ''
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>Admin Center</span>
            </button>
          )}
        </nav>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-3">

          {/* Auth Trigger / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 bg-luxury-beige p-1.5 rounded-full pl-4 hover:bg-luxury-stone transition-all cursor-pointer focus:outline-none"
              >
                <span className="hidden sm:inline text-xs font-bold text-luxury-navy uppercase tracking-wider">
                  {currentUser.role === 'ROLE_ADMIN' ? '👑 Admin' : currentUser.name.split(' ')[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-luxury-gold border-2 border-white overflow-hidden flex items-center justify-center text-xs font-black text-luxury-navy">
                  {currentUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-3 w-60 bg-luxury-accent-cream border border-luxury-beige rounded-2xl shadow-xl py-2 z-20">
                    <div className="px-4 py-2 border-b border-luxury-stone">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-luxury-navy">{currentUser.name}</p>
                        {currentUser.role === 'ROLE_ADMIN' && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-black uppercase">Admin</span>
                        )}
                      </div>
                      <p className="text-[11px] text-luxury-clay truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.role === 'ROLE_ADMIN' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-700 hover:bg-rose-50 text-left transition-colors font-extrabold"
                      >
                        <ShieldAlert className="h-4 w-4 text-rose-500" />
                        <span>Admin Terminal</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setActiveTab('bookings');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-luxury-navy hover:bg-luxury-beige/50 text-left transition-colors font-semibold"
                    >
                      <Clock className="h-4 w-4 text-luxury-gold" />
                      <span>Manage Reservations</span>
                    </button>

                    <button
                      onClick={onOpenLogs}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-luxury-navy hover:bg-luxury-beige/50 text-left transition-colors font-semibold"
                    >
                      <Terminal className="h-4 w-4 text-luxury-gold" />
                      <span>Diagnostics & System Logs</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 text-left transition-all font-bold border-t border-luxury-beige"
                    >
                      <LogOut className="h-4 w-4 text-rose-450" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm text-luxury-clay hover:text-luxury-gold-dark font-black transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-navy px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-md shadow-luxury-gold/20 hover:shadow-lg hover:scale-102 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
