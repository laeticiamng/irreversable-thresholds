import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
  count?: number;
}

function NavItem({ to, label, count }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        relative px-1 py-2 text-xs font-display tracking-[0.2em] uppercase transition-all duration-300
        ${isActive 
          ? 'text-foreground' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-2 text-primary">{count}</span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-px bg-primary" />
      )}
    </Link>
  );
}

interface NavigationProps {
  pendingCount: number;
  crossedCount: number;
}

export function Navigation({ pendingCount, crossedCount }: NavigationProps) {
  return (
    <nav className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-lg tracking-[0.15em] text-foreground hover:text-primary transition-colors">
          IRREVERSA
        </Link>
        
        <div className="flex items-center gap-8">
          <NavItem to="/pending" label="En attente" count={pendingCount} />
          <NavItem to="/archive" label="Franchis" count={crossedCount} />
        </div>
      </div>
    </nav>
  );
}
