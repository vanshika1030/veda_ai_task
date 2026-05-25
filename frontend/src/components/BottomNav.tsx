'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Library, Sparkles } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveNav = () => {
    if (pathname === '/') return 'assignments';
    if (pathname.startsWith('/create')) return 'assignments';
    if (pathname.startsWith('/paper')) return 'toolkit';
    return 'home';
  };

  const activeNav = getActiveNav();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/' },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={20} />, path: '/' },
    { id: 'library', label: 'Library', icon: <Library size={20} />, path: '/' },
    { id: 'toolkit', label: 'AI Toolkit', icon: <Sparkles size={20} />, path: '/' },
  ];

  return (
    <div className="bottom-nav mobile-only">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activeNav === item.id ? 'active' : ''}`}
          onClick={() => router.push(item.path)}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
