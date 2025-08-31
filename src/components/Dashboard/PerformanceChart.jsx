import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function PerformanceChart({ data, dataKey, name, color, chartTheme }) {
  return (
    <div className="recharts-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme?.grid} />
          <XAxis dataKey="date" axisLine={{ stroke: chartTheme?.axis }} tickLine={{ stroke: chartTheme?.axis }} />
          <YAxis axisLine={{ stroke: chartTheme?.axis }} tickLine={{ stroke: chartTheme?.axis }} />
          <Tooltip contentStyle={{ backgroundColor: chartTheme?.tooltipBg, color: chartTheme?.tooltipText, border: `1px solid ${chartTheme?.axis}`, borderRadius: 8 }} />
          <Legend wrapperStyle={{ color: chartTheme?.text }} />
          <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} dot={{ fill: color, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
