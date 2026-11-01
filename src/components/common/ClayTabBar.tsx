import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.FC<{ className?: string }>;
}

interface ClayTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const ClayTabBar: React.FC<ClayTabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`inline-flex p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#E5DFF8] shadow-clay-sm gap-1 w-full max-w-full overflow-x-auto select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-button-primary'
                : 'text-[#686487] hover:text-[#1C1938] hover:bg-[#FAF9FE]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 stroke-[2.2]" />}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#EDE9FE] text-[#7C3AED]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
