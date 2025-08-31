// src/components/Dashboard/PerformanceChart.jsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function PerformanceChart({ data, dataKey, name, color, chartTheme }) {
  // Props validation
  if (!data || !Array.isArray(data) || !dataKey || !name) {
    return (
      <div className="recharts-wrapper" style={{ width: "100%", height: 300 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: chartTheme?.text || '#6b7280'
        }}>
          Veri yükleniyor...
        </div>
      </div>
    );
  }

  // Calculate Y-axis domain for better scaling
  const values = data.map(item => item[dataKey] || 0).filter(val => typeof val === 'number');
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(...values, 0);
  
  // Add some padding to Y-axis
  const padding = Math.max((maxValue - minValue) * 0.1, maxValue * 0.05);
  const yAxisDomain = [
    Math.max(0, minValue - padding),
    maxValue + padding
  ];

  // Format Y-axis values
  const formatYAxisValue = (value) => {
    if (dataKey === 'orders') {
      return Math.round(value).toString();
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return Math.round(value).toString();
  };

  // Custom tooltip formatter
  const formatTooltipValue = (value, name, props) => {
    if (dataKey === 'orders') {
      return [`${Math.round(value)} adet`, name];
    }
    return [`₺${Number(value).toFixed(2)}`, name];
  };

  return (
    <div className="recharts-wrapper" style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme?.grid || "rgba(0,0,0,0.1)"} 
            strokeOpacity={0.3}
          />
          
          <XAxis
            dataKey="date"
            interval="preserveStartEnd"
            minTickGap={20}
            axisLine={{ stroke: chartTheme?.axis || "#374151" }}
            tickLine={{ stroke: chartTheme?.axis || "#374151" }}
            tick={{ 
              fontSize: 12, 
              fill: chartTheme?.text || "#374151",
              fontWeight: 500
            }}
            tickFormatter={(value) => value || ""}
          />

          <YAxis
            domain={yAxisDomain}
            allowDecimals={dataKey !== 'orders'}
            axisLine={{ stroke: chartTheme?.axis || "#374151" }}
            tickLine={{ stroke: chartTheme?.axis || "#374151" }}
            tick={{ 
              fontSize: 12, 
              fill: chartTheme?.text || "#374151",
              fontWeight: 500
            }}
            tickFormatter={formatYAxisValue}
            width={60}
          />

          <Tooltip
            labelFormatter={(label) => label || ""}
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: chartTheme?.tooltipBg || "#ffffff",
              color: chartTheme?.tooltipText || "#111827",
              border: `1px solid ${chartTheme?.axis || "#e5e7eb"}`,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
            labelStyle={{
              color: chartTheme?.tooltipText || "#111827",
              fontWeight: 600
            }}
          />

          <Legend 
            wrapperStyle={{ 
              color: chartTheme?.text || "#374151",
              fontSize: "14px",
              fontWeight: 500
            }} 
          />

          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={color || chartTheme?.series?.[0] || "#3b82f6"}
            strokeWidth={3}
            dot={{ 
              fill: color || chartTheme?.series?.[0] || "#3b82f6",
              stroke: chartTheme?.background || "#ffffff",
              strokeWidth: 2,
              r: 4 
            }}
            activeDot={{ 
              r: 6, 
              fill: color || chartTheme?.series?.[0] || "#3b82f6",
              stroke: chartTheme?.background || "#ffffff",
              strokeWidth: 2,
              boxShadow: `0 0 12px ${color || chartTheme?.series?.[0] || "#3b82f6"}40`
            }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
