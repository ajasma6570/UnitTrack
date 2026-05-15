"use client";

import { LayoutDashboard, PlusCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "dashboard" | "create" | "history";

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "create" as TabType,
      label: "Add Entry",
      icon: PlusCircle,
    },
    {
      id: "history" as TabType,
      label: "History",
      icon: History,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200",
                isActive
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
