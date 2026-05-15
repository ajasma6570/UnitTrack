"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WeeklyChartData, MonthlyChartData, YearlyData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChartsSectionProps {
  weeklyData: WeeklyChartData[];
  monthlyChartData: MonthlyChartData[];
  yearlyData: YearlyData[];
  isLoading?: boolean;
}

export function ChartsSection({
  weeklyData,
  monthlyChartData,
  yearlyData,
  isLoading = false,
}: ChartsSectionProps) {
  const [chartType, setChartType] = useState<"daily" | "monthly" | "yearly">(
    "daily",
  );
  const isMobile = useIsMobile();

  const getChartData = () => {
    switch (chartType) {
      case "daily":
        return weeklyData;
      case "monthly":
        return monthlyChartData;
      case "yearly":
        return yearlyData;
      default:
        return weeklyData;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case "daily":
        return "Daily Usage";
      case "monthly":
        return "Monthly Usage";
      case "yearly":
        return "Yearly Usage";
      default:
        return "Energy Analytics";
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case "daily":
        return "Energy used in the last 7 days";
      case "monthly":
        return "Energy used each day this month";
      case "yearly":
        return "Energy used each month this year";
      default:
        return "Energy metrics and trends";
    }
  };

  const chartData = getChartData();

  return (
    <Card className="border-none shadow-sm py-0">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 px-4 pt-4">
        <div>
          <CardTitle className="text-lg sm:text-xl">
            {getChartTitle()}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            {getChartDescription()}
          </CardDescription>
        </div>
        <Select
          value={chartType}
          onValueChange={(val: any) => setChartType(val)}
        >
          <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm h-9">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily (7 Days)</SelectItem>
            <SelectItem value="monthly">Monthly (Days)</SelectItem>
            <SelectItem value="yearly">Yearly (Months)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-1 sm:px-4 pb-4">
        {isLoading ? (
          <Skeleton className="h-[300px] sm:h-[400px] w-full" />
        ) : chartData && chartData.length > 0 ? (
          <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey={chartType === "yearly" ? "month" : "date"}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={isMobile && chartType === "monthly" ? 4 : 0}
                  tickFormatter={(value) => {
                    if (isMobile && chartType === "monthly") {
                      return value.split("-")[2]; // Only show day part on mobile monthly view
                    }
                    if (chartType === "daily") {
                      return value.split("-").slice(1).join("/"); // Show MM/DD
                    }
                    return value;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [value?.toFixed(2), "kWh"]}
                />
                <Bar
                  dataKey="usage"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Usage"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[350px] flex items-center justify-center text-xs sm:text-sm text-muted-foreground italic">
            No data available for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
