'use client';

import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, LayoutDashboard, ChevronDown, Menu } from 'lucide-react';

interface TopBarProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  icon?: React.ReactNode;
  showMobileTitle?: boolean;
}

export default function TopBar({ title = 'Assignment', showBackButton = true, showMobileTitle = true, onBack, icon }: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      {/* Desktop Topbar */}
      <div className="topbar desktop-only">
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

      {/* Mobile Global Header */}
      <div className="global-header mobile-only">
        <div className="global-header-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#1A1A1A"/>
            <path d="M12 4L4 9L12 14L20 9L12 4Z" fill="white" opacity="0.9"/>
            <path d="M4 19L12 24L20 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 14L12 19L20 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="global-header-title">VedaAI</span>
        </div>
        <div className="global-header-actions">
          <button className="topbar-notification">
            <Bell size={20} />
            <span className="topbar-notification-dot" />
          </button>
          <div className="topbar-user">
            <div className="topbar-avatar-img"></div>
          </div>
          <button className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Page Header (Optional) */}
      {showMobileTitle && (
        <div className="mobile-page-header mobile-only">
          <div className="mobile-page-header-content">
            {showBackButton && (
              <button className="mobile-back-btn" onClick={handleBack}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="mobile-page-title">{title}</h1>
          </div>
        </div>
      )}
    </>
  );
}
