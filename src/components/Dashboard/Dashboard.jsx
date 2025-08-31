import React from "react";
import { TrendingUp, ShoppingCart, Package } from "lucide-react";
import StatsCard from "./StatsCard";
import PerformanceChart from "./PerformanceChart";
import { RANGES } from "../../utils/constants";
import { formatCurrency } from "../../utils/calculations";

export default function Dashboard({ range, setRange, currentStats, currentChartData, chartTheme }) {
  const rangeLabel = range === RANGES.DAILY ? "Günlük" : range === RANGES.MONTHLY ? "Aylık" : "Yıllık";

  return (
    <div>
      <div className="stats-grid">
        <StatsCard Icon={TrendingUp} className="stat-revenue" label={`${rangeLabel} Ciro`} value={formatCurrency(currentStats.totalRevenue)} />
        <StatsCard Icon={TrendingUp} className="stat-profit" label={`${rangeLabel} Kar`} value={formatCurrency(currentStats.totalProfit)} />
        <StatsCard Icon={ShoppingCart} className="stat-orders" label={`${rangeLabel} Sipariş`} value={currentStats.orderCount} />
        <StatsCard Icon={Package} className="stat-cost" label={`${rangeLabel} Maliyet`} value={formatCurrency(currentStats.totalCost)} />
        <StatsCard Icon={Package} className="stat-tax" label={`${rangeLabel} Vergi`} value={formatCurrency(currentStats.totalTax)} />
      </div>

      <div className="content-card">
        <div className="content-header"><h2>Performans Grafikleri</h2></div>
        <div className="content-body">
          <div className="charts-grid">
            <PerformanceChart data={currentChartData} dataKey="revenue" name="Ciro" color={chartTheme.series[0]} chartTheme={chartTheme} />
            <PerformanceChart data={currentChartData} dataKey="profit"  name="Kar"  color={chartTheme.series[1]} chartTheme={chartTheme} />
            <PerformanceChart data={currentChartData} dataKey="orders"  name="Sipariş Sayısı" color={chartTheme.series[3]} chartTheme={chartTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}
