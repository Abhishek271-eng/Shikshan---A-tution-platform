import React from 'react';
import { Home, Compass, Send, Bookmark, User } from 'lucide-react';

export type BottomNavTab = 'home' | 'discover' | 'requests' | 'saved' | 'profile';

interface ClayBottomNavigationProps {
  activeTab: BottomNavTab;
  onChangeTab: (tab: BottomNavTab) => void;
  requestsCount?: number;
  savedCount?: number;
}

export const ClayBottomNavigation: React.FC<ClayBottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  requestsCount = 0,
  savedCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as BottomNavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'discover' as BottomNavTab,
      label: 'Find Tutors',
      icon: Compass,
    },
    {
      id: 'requests' as BottomNavTab,
      label: 'My Requests',
      icon: Send,
      badge: requestsCount,
    },
    {
      id: 'saved' as BottomNavTab,
      label: 'Shortlist',
      icon: Bookmark,
      badge: savedCount,
    },
    {
      id: 'profile' as BottomNavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5DFF8] shadow-lg px-2 sm:px-6 py-2 select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#6D28D9]'
                  : 'text-[#686487] hover:text-[#1C1938] hover:bg-[#FAF9FE]'
              }`}
            >
              {/* Icon Container with clay highlight when active */}
              <div
                className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-button-primary'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />

                {/* Badge Indicator */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white ${
                      isActive ? 'bg-[#EF4444] text-white' : 'bg-[#7C3AED] text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-1 truncate max-w-full font-bold tracking-tight ${
                  isActive ? 'text-[#6D28D9]' : 'text-[#686487]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
