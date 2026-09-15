"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatMoney } from "@/lib/utils";

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#171717" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#171717" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#737373" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v, "USD")} width={70} />
        <Tooltip formatter={(v) => formatMoney(Number(v), "USD")} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Area type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
