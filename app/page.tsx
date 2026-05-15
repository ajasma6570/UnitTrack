"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { DailyEntryForm } from "@/components/dashboard/daily-entry-form";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { HistoryTable } from "@/components/dashboard/history-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsResponse } from "@/lib/types";

import { MobileNav, TabType } from "@/components/dashboard/mobile-nav";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Fetch analytics data with error handling
  const {
    data: analytics,
    isLoading: analyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR<AnalyticsResponse>("/api/analytics?period=month", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
  });

  // Fetch entries count to show/hide empty state
  const { data: entriesData, mutate: mutateEntries } = useSWR(
    "/api/entries?page=1&limit=1",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  const handleDataChange = () => {
    mutateAnalytics();
    mutateEntries();
  };

  const hasEntries = (entriesData?.total ?? 0) > 0;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="pb-20 md:pb-0">
        <div className="space-y-6">
          {/* Dashboard Tab */}
          {(activeTab === "dashboard" || !activeTab) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <SummaryCards
                todayUsage={analytics?.todayUsage ?? 0}
                yesterdayUsage={analytics?.yesterdayUsage ?? 0}
                monthlyUsage={analytics?.monthlyUsage ?? 0}
                yearlyUsage={analytics?.yearlyUsage ?? 0}
                isLoading={analyticsLoading}
              />

              {!hasEntries && !analyticsLoading && <EmptyState />}

              {hasEntries && (
                <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    Quick Insights
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your solar system has been active. Check the{" "}
                      <button
                        onClick={() => setActiveTab("history")}
                        className="text-green-600 font-bold"
                      >
                        History
                      </button>{" "}
                      tab for detailed charts and records.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Tab */}
          {activeTab === "create" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <DailyEntryForm
                onSuccess={() => {
                  handleDataChange();
                  setActiveTab("dashboard");
                }}
              />
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {hasEntries ? (
                <>
                  <ChartsSection
                    weeklyData={analytics?.weeklyData ?? []}
                    monthlyChartData={analytics?.monthlyChartData ?? []}
                    yearlyData={analytics?.yearlyData ?? []}
                    isLoading={analyticsLoading}
                  />
                  <HistoryTable onDataChange={handleDataChange} />
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </div>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </DashboardLayout>
  );
}
