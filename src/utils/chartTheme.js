// src/utils/chartTheme.js
export const getChartTheme = (isDark) => {
  if (isDark) {
    return {
      background: "transparent",
      text: "#E6EEF8",           // Koyu temada açık renk
      axis: "#93C5FD",
      grid: "rgba(255,255,255,0.06)",
      tooltipBg: "#0b1220",
      tooltipText: "#FFFFFF",
      series: ["#60A5FA", "#34D399", "#F472B6", "#F59E0B"]
    };
  }
  return {
    background: "transparent",
    text: "#0f172a",            // Açık temada koyu renk
    axis: "#374151",
    grid: "#e6e6e6",
    tooltipBg: "#ffffff",
    tooltipText: "#111827",
    series: ["#2563EB", "#10B981", "#DB2777", "#F97316"]
  };
};