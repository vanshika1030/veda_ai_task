'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Users, FileText, Bot, Library, Sparkles, Settings, GraduationCap } from 'lucide-react';

interface SidebarProps {
  assignmentCount?: number;
}

export default function Sidebar({ assignmentCount = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveNav = () => {
    if (pathname === '/') return 'assignments';
    if (pathname.startsWith('/create')) return 'assignments';
    if (pathname.startsWith('/paper')) return 'toolkit';
    return 'home';
  };

  const activeNav = getActiveNav();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} />, path: '/' },
    { id: 'groups', label: 'My Groups', icon: <Users size={18} />, path: '/' },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={18} />, path: '/', badge: assignmentCount > 0 ? assignmentCount : undefined },
    { id: 'toolkit', label: "AI Teacher's Toolkit", icon: <Bot size={18} />, path: '/' },
    { id: 'library', label: 'My Library', icon: <Library size={18} />, path: '/', badge: 32 },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">VedaAI</span>
          </div>

          {/* Create Assignment Button */}
          <button className="sidebar-create-btn" onClick={() => { router.push('/create'); setMobileOpen(false); }}>
            <span style={{ display: 'flex', alignItems: 'center' }}><Sparkles size={16} /></span>
            Create Assignment
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { router.push(item.path); setMobileOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-settings">
            <span className="nav-icon"><Settings size={18} /></span>
            <span>Settings</span>
          </div>

          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={20} /></div>
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">Delhi Public School</div>
              <div className="sidebar-profile-location">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button - rendered via TopBar */}
    </>
  );
}
