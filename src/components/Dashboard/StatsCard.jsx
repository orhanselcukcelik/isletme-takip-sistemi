import React from "react";

export default function StatsCard({ Icon, label, value, className = "" }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-content">
        <Icon className="stat-icon" />
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
        </div>
      </div>
    </div>
  );
}
