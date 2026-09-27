import { NavLink, Outlet } from 'react-router-dom';
import { 
  SquaresFour, 
  TrendUp, 
  MapPin, 
  Users, 
  WarningCircle, 
  Export, 
  SignOut 
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

const NAV_ITEMS = [
  { path: '/overview', label: 'Overview', icon: SquaresFour },
  { path: '/trends', label: 'Trends', icon: TrendUp },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/workers', label: 'Workers', icon: Users },
  { path: '/flagged', label: 'Flagged', icon: WarningCircle },
  { path: '/export', label: 'Export', icon: Export },
];

export const AppLayout = () => {
  const { name, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-base)]">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-surface)] transition-all">
        <div className="h-16 flex items-center justify-center lg:justify-start px-0 lg:px-6 border-b border-[var(--color-border-subtle)]">
          <span className="font-heading font-bold text-xl text-[var(--color-accent)] hidden lg:block">PoshanScan</span>
          <span className="font-heading font-bold text-xl text-[var(--color-accent)] lg:hidden">PS</span>
        </div>

        <nav className="flex-1 py-6 px-2 lg:px-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors group relative",
                isActive 
                  ? "bg-[var(--color-accent)]/5 text-[var(--color-accent)]" 
                  : "text-[var(--color-secondary)] hover:bg-[var(--color-border-subtle)]/50 hover:text-[var(--color-primary)]"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)] rounded-r-sm" />
                  )}
                  <Icon weight={isActive ? "fill" : "regular"} className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium hidden lg:block">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 mb-4 px-2 hidden lg:flex">
            <div className="w-8 h-8 rounded-full bg-[var(--color-border-subtle)] flex items-center justify-center flex-shrink-0">
              <span className="font-heading font-bold text-sm text-[var(--color-secondary)]">
                {name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-primary)] truncate">{name}</p>
              <p className="text-xs text-[var(--color-secondary)] truncate">Supervisor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-sm hover:bg-[var(--color-border-subtle)]/50"
          >
            <SignOut weight="regular" className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium hidden lg:block">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
