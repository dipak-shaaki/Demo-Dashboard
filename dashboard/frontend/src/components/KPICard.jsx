import React from 'react';

const KPICard = ({ title, value, icon: Icon, trend, variant = 'default' }) => {
  return (
    <div className={`kpi-card ${variant}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="kpi-label">{title}</div>
          <div className="kpi-value">{value}</div>
          {trend && <div className="kpi-trend">{trend}</div>}
        </div>
        {Icon && <Icon size={32} style={{ opacity: 0.8 }} />}
      </div>
    </div>
  );
};

export default KPICard;
