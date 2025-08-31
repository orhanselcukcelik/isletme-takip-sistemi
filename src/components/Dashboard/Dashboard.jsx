import React from "react";
import { TrendingUp, ShoppingCart, Package } from "lucide-react";
import StatsCard from "./StatsCard";
import { RANGES } from "../../utils/constants";
import { formatCurrency } from "../../utils/calculations";

export default function Dashboard({ range, setRange, currentStats, customDateRange }) {
  const getRangeLabel = () => {
    if (customDateRange) {
      return "Seçili Tarih";
    }
    return range === RANGES.DAILY ? "Günlük" : range === RANGES.MONTHLY ? "Aylık" : "Yıllık";
  };

  const rangeLabel = getRangeLabel();

  return (
    <div>
      <div className="stats-grid">
        <StatsCard Icon={TrendingUp} className="stat-revenue" label={`${rangeLabel} Ciro`} value={formatCurrency(currentStats.totalRevenue)} />
        <StatsCard Icon={TrendingUp} className="stat-profit" label={`${rangeLabel} Kar`} value={formatCurrency(currentStats.totalProfit)} />
        <StatsCard Icon={ShoppingCart} className="stat-orders" label={`${rangeLabel} Sipariş`} value={currentStats.orderCount} />
        <StatsCard Icon={Package} className="stat-cost" label={`${rangeLabel} Maliyet`} value={formatCurrency(currentStats.totalCost)} />
        <StatsCard Icon={Package} className="stat-tax" label={`${rangeLabel} Vergi`} value={formatCurrency(currentStats.totalTax)} />
      </div>
      
    </div>
  );
}
