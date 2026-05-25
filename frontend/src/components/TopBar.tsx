'use client';

import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, LayoutDashboard, ChevronDown } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  icon?: React.ReactNode;
}

export default function TopBar({ title = 'Assignment', showBackButton = true, onBack, icon }: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {showBackButton && (
          <button className="topbar-back" onClick={handleBack} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        )}
        {icon && <span className="topbar-breadcrumb-icon">{icon}</span>}
        <span className="topbar-breadcrumb">
          <span className="topbar-breadcrumb-icon"><LayoutDashboard size={14} /></span>
          {title}
        </span>
      </div>
      <div className="topbar-right">
        <button className="topbar-notification" aria-label="Notifications">
          <Bell size={20} />
          <span className="topbar-notification-dot" />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">JD</div>
          <span className="topbar-user-name">John Doe</span>
          <span className="topbar-user-chevron"><ChevronDown size={14} /></span>
        </div>
      </div>
    </div>
  );
}
