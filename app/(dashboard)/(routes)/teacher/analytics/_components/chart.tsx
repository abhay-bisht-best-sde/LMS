"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export const Chart = ({
  data
}: ChartProps) => {
  const chartData = data
    .slice()
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      ...item,
      shortName:
        item.name.length > 34 ? `${item.name.slice(0, 34)}...` : item.name,
    }));

  const chartHeight = Math.max(280, chartData.length * 72);

  if (!chartData.length) {
    return (
      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue By Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
            No sales yet. Analytics will appear after first purchase.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue By Course</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 24, bottom: 10, left: 24 }}
            barCategoryGap="26%"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={220}
              stroke="#334155"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 30px rgba(2, 6, 23, 0.08)",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name || "Course"}
            />
            <Bar
              dataKey="total"
              fill="#0369a1"
              radius={[0, 6, 6, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
