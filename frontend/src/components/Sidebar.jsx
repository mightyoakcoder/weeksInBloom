import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, Droplets, Apple, Calendar, Settings
} from 'lucide-react';
import { format } from 'date-fns';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plants',   icon: Sprout,          label: 'My Plants' },
  { to: '/watering', icon: Droplets,        label: 'Watering' },
  { to: '/harvest',  icon: Apple,           label: 'Harvest Log' },
  { to: '/schedule', icon: Calendar,        label: 'Schedule' },
];

export default function Sidebar() {
  const today = format(new Date(), 'MMMM d, yyyy');
  const daysToLastFrost = Math.max(0,
    Math.round((new Date('2026-05-25') - new Date()) / 86400000)
  );

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>Weeks in Bloom</h1>
        <p>Attleboro, MA · Zone 6a</p>
      </div>

      <div className="sidebar-season">
        <strong>{today}</strong>
        {daysToLastFrost > 0
          ? `~${daysToLastFrost} days to last frost`
          : '🌱 Safe to transplant!'}
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={17} className="icon" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
