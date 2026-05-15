"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCardsProps {
  todayUsage: number;
  yesterdayUsage: number;
  monthlyUsage: number;
  yearlyUsage: number;
  isLoading?: boolean;
}

export function SummaryCards({
  todayUsage,
  yesterdayUsage,
  monthlyUsage,
  yearlyUsage,
  isLoading = false,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Today",
      value: todayUsage,
      unit: "kWh",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Yesterday",
      value: yesterdayUsage,
      unit: "kWh",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "This Month",
      value: monthlyUsage,
      unit: "kWh",
      icon: Zap,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "This Year",
      value: yearlyUsage,
      unit: "kWh",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = card.value;

        return (
          <Card
            key={card.title}
            className="overflow-hidden border shadow-sm gap-0 py-4"
          >
            <CardHeader className="px-3">
              <div className="flex items-center justify-between gap-1">
                <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-1.5 rounded-lg shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-1 px-3">
              {isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight">
                      {value.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {card.unit}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
