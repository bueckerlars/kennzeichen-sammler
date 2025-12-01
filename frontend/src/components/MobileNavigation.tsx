import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { LayoutDashboard, List, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/collection', icon: List, label: 'Sammlung' },
  { path: '/leaderboard', icon: Trophy, label: 'Bestenliste' },
];

export function MobileNavigation() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = navItems.findIndex(
      (item) => location.pathname === item.path || 
      (item.path === '/dashboard' && location.pathname === '/')
    );

    if (activeIndex !== -1 && buttonRefs.current[activeIndex] && navRef.current) {
      const activeButton = buttonRefs.current[activeIndex];
      const navRect = navRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        width: buttonRect.width - 8, // Account for mx-1 margin
        left: buttonRect.left - navRect.left + 4, // Account for mx-1 margin
      });
    }
  }, [location.pathname]);

  // Hide navigation on login/register pages
  if (location.pathname === '/login') {
    return null;
  }

  if (!isMobile) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-4 left-4 right-4 z-[100] glass-nav rounded-3xl md:hidden"
      style={{ 
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 100
      }}
    >
      <div ref={navRef} className="grid grid-cols-3 h-16 relative">
        {/* Animated active indicator */}
        <div
          className="nav-active-indicator"
          style={{
            width: `${indicatorStyle.width}px`,
            transform: `translateX(${indicatorStyle.left}px)`,
          }}
        />
        
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          
          return (
            <button
              key={item.path}
              ref={(el) => { buttonRefs.current[index] = el; }}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors duration-300',
                'min-h-[44px] touch-manipulation relative rounded-2xl mx-1 z-10',
                'active:opacity-70',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
              aria-label={item.label}
            >
              <Icon className={cn(
                'h-5 w-5 transition-all duration-300',
                isActive && 'text-primary scale-110'
              )} />
              <span className={cn(
                'text-xs font-medium transition-all duration-300',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

