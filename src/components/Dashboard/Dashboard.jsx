import React from "react";
import { TrendingUp, ShoppingCart, Package } from "lucide-react";
import StatsCard from "./StatsCard";
import PerformanceChart from "./PerformanceChart";
import { RANGES } from "../../utils/constants";
import { formatCurrency } from "../../utils/calculations";

export default function Dashboard({ 
  range, 
  setRange, 
  currentStats, 
  currentChartData, 
  chartTheme,
  customDateRange 
}) {
  const getRangeLabel = () => {
    if (customDateRange) {
      return "Seçili Tarih";
    }
    return range === RANGES.DAILY ? "Günlük" : range === RANGES.MONTHLY ? "Aylık" : "Yıllık";
  };

  const rangeLabel = getRangeLabel();

  // Chart verileri hazırlığı
  const revenueChartData = currentChartData?.map(item => ({
    date: item.date,
    revenue: item.revenue || 0
  })) || [];

  const profitChartData = currentChartData?.map(item => ({
    date: item.date,
    profit: item.profit || 0
  })) || [];

  const ordersChartData = currentChartData?.map(item => ({
    date: item.date,
    orders: item.orders || 0
  })) || [];

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard 
          Icon={TrendingUp} 
          className="stat-revenue" 
          label={`${rangeLabel} Ciro`} 
          value={formatCurrency(currentStats?.totalRevenue || 0)} 
        />
        <StatsCard 
          Icon={TrendingUp} 
          className="stat-profit" 
          label={`${rangeLabel} Kar`} 
          value={formatCurrency(currentStats?.totalProfit || 0)} 
        />
        <StatsCard 
          Icon={ShoppingCart} 
          className="stat-orders" 
          label={`${rangeLabel} Sipariş`} 
          value={currentStats?.orderCount || 0} 
        />
        <StatsCard 
          Icon={Package} 
          className="stat-cost" 
          label={`${rangeLabel} Maliyet`} 
          value={formatCurrency(currentStats?.totalCost || 0)} 
        />
        <StatsCard 
          Icon={Package} 
          className="stat-tax" 
          label={`${rangeLabel} Vergi`} 
          value={formatCurrency(currentStats?.totalTax || 0)} 
        />
      </div>

      {/* Chart Section */}
      <div className="charts-section">

        <div className="charts-grid">
          {/* Ciro Grafiği */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title-container">
                <div className="chart-card-icon revenue-icon">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="chart-card-title">Ciro Trendi</h3>
                  <p className="chart-card-subtitle">
                    {formatCurrency(currentStats?.totalRevenue || 0)} toplam
                  </p>
                </div>
              </div>
              <div className="chart-card-badge revenue-badge">
                +{((currentStats?.totalRevenue || 0) / Math.max(1, (currentStats?.totalCost || 1)) * 100 - 100).toFixed(1)}%
              </div>
            </div>
            <div className="chart-container">
              <PerformanceChart
                data={revenueChartData}
                dataKey="revenue"
                name="Ciro"
                color={chartTheme?.series?.[0] || "#2563EB"}
                chartTheme={chartTheme}
              />
            </div>
          </div>

          {/* Kar Grafiği */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title-container">
                <div className="chart-card-icon profit-icon">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="chart-card-title">Kar Trendi</h3>
                  <p className="chart-card-subtitle">
                    {formatCurrency(currentStats?.totalProfit || 0)} toplam
                  </p>
                </div>
              </div>
              <div className="chart-card-badge profit-badge">
                {currentStats?.totalRevenue > 0 
                  ? `${((currentStats?.totalProfit || 0) / (currentStats?.totalRevenue || 1) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
            <div className="chart-container">
              <PerformanceChart
                data={profitChartData}
                dataKey="profit"
                name="Kar"
                color={chartTheme?.series?.[1] || "#10B981"}
                chartTheme={chartTheme}
              />
            </div>
          </div>

          {/* Sipariş Sayısı Grafiği */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title-container">
                <div className="chart-card-icon orders-icon">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 className="chart-card-title">Sipariş Trendi</h3>
                  <p className="chart-card-subtitle">
                    {currentStats?.orderCount || 0} toplam sipariş
                  </p>
                </div>
              </div>
              <div className="chart-card-badge orders-badge">
                {currentStats?.paidOrderCount || 0} ödendi
              </div>
            </div>
            <div className="chart-container">
              <PerformanceChart
                data={ordersChartData}
                dataKey="orders"
                name="Sipariş Sayısı"
                color={chartTheme?.series?.[2] || "#DB2777"}
                chartTheme={chartTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
