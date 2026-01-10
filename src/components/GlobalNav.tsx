import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearch } from '@/components/GlobalSearch';
import { 
  LayoutDashboard, 
  Target, 
  Eye, 
  XCircle, 
  Leaf, 
  User,
  Menu,
  X,
  Settings
} from 'lucide-react';

const navItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    color: 'text-foreground'
  },
  { 
    path: '/irreversa/home', 
    label: 'IRREVERSA', 
    icon: Target,
    color: 'text-primary',
    activeColor: 'text-primary'
  },
  { 
    path: '/thresh/home', 
    label: 'THRESH', 
    icon: Eye,
    color: 'text-amber-500',
    activeColor: 'text-amber-500'
  },
  { 
    path: '/nulla/home', 
    label: 'NULLA', 
    icon: XCircle,
    color: 'text-nulla',
    activeColor: 'text-nulla'
  },
  { 
    path: '/silva/home', 
    label: 'SILVA', 
    icon: Leaf,
    color: 'text-silva',
    activeColor: 'text-silva'
  },
];

export function GlobalNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path.replace('/home', ''));
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link 
              to="/" 
              className="font-display text-sm tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors uppercase"
            >
              Suite
            </Link>

            {/* Nav Items */}
            <div className="flex items-center gap-0.5 lg:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative px-2 lg:px-3 py-2 flex items-center gap-1.5 lg:gap-2 text-[10px] lg:text-xs font-display tracking-[0.1em] lg:tracking-[0.15em] uppercase transition-all duration-300
                      ${active 
                        ? item.activeColor || 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                    {active && (
                      <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        item.path === '/dashboard' ? 'bg-foreground' :
                        item.path.includes('irreversa') ? 'bg-primary' :
                        item.path.includes('thresh') ? 'bg-amber-500' :
                        item.path.includes('nulla') ? 'bg-nulla' :
                        'bg-silva'
                      }`} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Global Search */}
              <GlobalSearch />

              {/* Notifications */}
              <NotificationBell />

              {/* Settings */}
              <Link 
                to="/settings"
                className={`
                  p-2 rounded-full border transition-colors
                  ${location.pathname === '/settings' 
                    ? 'border-primary/50 text-primary' 
                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Account */}
              <Link 
                to="/account"
                className={`
                  p-2 rounded-full border transition-colors
                  ${location.pathname === '/account' 
                    ? 'border-primary/50 text-primary' 
                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-sm md:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link 
              to="/" 
              className="font-display text-sm tracking-[0.3em] text-muted-foreground uppercase"
            >
              Suite
            </Link>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-muted-foreground"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="absolute top-14 left-0 right-0 bg-background border-b border-border/30 py-4 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active 
                      ? `bg-card/50 ${item.activeColor || 'text-foreground'}` 
                      : 'text-muted-foreground hover:bg-card/30 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-display tracking-wider">{item.label}</span>
                </Link>
              );
            })}
            
            <div className="pt-2 border-t border-border/30 mt-2 space-y-1">
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === '/settings' 
                    ? 'bg-card/50 text-primary' 
                    : 'text-muted-foreground hover:bg-card/30 hover:text-foreground'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-display tracking-wider">Paramètres</span>
              </Link>
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === '/account' 
                    ? 'bg-card/50 text-primary' 
                    : 'text-muted-foreground hover:bg-card/30 hover:text-foreground'
                  }
                `}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-display tracking-wider">Mon compte</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
