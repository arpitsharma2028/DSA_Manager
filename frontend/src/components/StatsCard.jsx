import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}