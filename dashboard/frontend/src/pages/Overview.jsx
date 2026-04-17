import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Shield } from 'lucide-react';
import KPICard from '../components/KPICard';
import DataChart from '../components/DataChart';
import { dashboardAPI } from '../services/api';

const Overview = () => {
  const [summary, setSummary] = useState(null);
  const [premiumData, setPremiumData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, premiumRes] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getPremiumByProvince('2081/82'),
        ]);
        setSummary(summaryRes.data);
        setPremiumData(premiumRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return `NPR ${(value / 10000000).toFixed(2)} Crore`;
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="header">
        <h2>Dashboard Overview</h2>
        <div className="header-controls">
          <span>Fiscal Year: 2081/82</span>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard
          title="Total Premium Collection"
          value={formatCurrency(summary?.totalPremium || 0)}
          icon={TrendingUp}
          trend="↑ 12.5% from last year"
          variant="default"
        />
        <KPICard
          title="Active Agents"
          value={summary?.activeAgents || 0}
          icon={Users}
          trend="↑ 8.3% growth"
          variant="accent"
        />
        <KPICard
          title="Active Policies"
          value={summary?.totalPolicies || 0}
          icon={FileText}
          trend="↑ 15.2% increase"
          variant="gold"
        />
        <KPICard
          title="Claims Approval Ratio"
          value={`${(summary?.claimsRatio || 0).toFixed(1)}%`}
          icon={Shield}
          trend="Stable performance"
          variant="info"
        />
      </div>

      <DataChart
        type="bar"
        data={premiumData}
        xKey="province"
        yKeys={['total_premium']}
        title="Premium Collection by Province (NPR)"
        height={400}
      />

      <div className="grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <div className="card-title">Quick Statistics</div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Provinces:</span>
              <strong>7</strong>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Premium (FY 2081/82):</span>
              <strong>{formatCurrency(summary?.totalPremium || 0)}</strong>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Average per Province:</span>
              <strong>{formatCurrency((summary?.totalPremium || 0) / 7)}</strong>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Active Agents:</span>
              <strong>{summary?.activeAgents || 0}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Top Performing Province</div>
          {premiumData.length > 0 && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1B5E20', marginBottom: '8px' }}>
                {premiumData[0].province}
              </div>
              <div style={{ marginBottom: '12px' }}>
                Premium: {formatCurrency(premiumData[0].total_premium)}
              </div>
              <div>
                Policies: {premiumData[0].policy_count || 0}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
