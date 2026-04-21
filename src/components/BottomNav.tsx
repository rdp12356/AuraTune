import { motion } from 'framer-motion';
import { BarChart3, Home, User } from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = React.memo(function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (['/player', '/onboarding', '/auth', '/reset-password'].includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/30 safe-bottom">
      <div className="flex items-center justify-around py-1.5 pb-safe">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <motion.button key={tab.path} whileTap={{ scale: 0.9 }} onTap={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-6 py-2 relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={20}
                className={`transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

export default BottomNav;
