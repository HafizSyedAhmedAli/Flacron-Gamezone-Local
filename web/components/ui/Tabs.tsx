import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const tabCount = tabs.length;
    let newIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (currentIndex + 1) % tabCount;
        break;
      case "ArrowLeft":
        newIndex = (currentIndex - 1 + tabCount) % tabCount;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabCount - 1;
        break;
    }

    if (newIndex !== null) {
      e.preventDefault();
      onTabChange(tabs[newIndex].id);
      const nextTab = document.getElementById(`tab-${tabs[newIndex].id}`);
      nextTab?.focus();
    }
  };

  return (
    <div className="flex gap-2 border-b border-slate-700/50" role="tablist">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              isActive
                ? "text-blue-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 inline mr-2" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 text-xs opacity-60">({tab.count})</span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
