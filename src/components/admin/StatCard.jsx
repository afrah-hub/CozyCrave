import React from "react";

function StatCard({ title, value, onClick, icon }) {
  return (
    <div className="card stat-card" tabIndex="0" role="article" aria-label={`${title}: ${value}`} onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default StatCard;
