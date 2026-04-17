import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import KPICard from '../components/KPICard';
import { claimsAPI } from '../services/api';

const ClaimsManagement = () => {
  const [deathClaimData, setDeathClaimData] = useState(null);
  const [claimDetails, setClaimDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('ratio');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratioRes, detailsRes] = await Promise.all([
          claimsAPI.getDeathClaimRatio(),
          claimsAPI.getDetails(),
        ]);
        setDeathClaimData(ratioRes.data);
        setClaimDetails(detailsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return `NPR ${(value / 100000).toFixed(2)} Lakh`;
  };

  const getStatusBadge = (status) => {
    const className = status === 'approved' ? 'badge-success' : status === 'pending' ? 'badge-warning' : 'badge-error';
    return <span className={`badge ${className}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Claims Management</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'ratio' ? 'active' : ''}`} onClick={() => setActiveTab('ratio')}>
          Death Claim Ratio
        </button>
        <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
          Claim Details
        </button>
      </div>

      {activeTab === 'ratio' && deathClaimData && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <KPICard
              title="Death Claim Ratio"
              value={`${deathClaimData.deathClaimRatio}%`}
              variant="accent"
            />
            <KPICard
              title="Total Policies"
              value={deathClaimData.totalPolicies}
              variant="default"
            />
            <KPICard
              title="Total Death Claims"
              value={deathClaimData.deathClaimsByProvince.reduce((sum, c) => sum + c.death_claim_count, 0)}
              variant="gold"
            />
          </div>

          <DataChart
            type="bar"
            data={deathClaimData.deathClaimsByProvince}
            xKey="province"
            yKeys={['death_claim_count']}
            title="Death Claims by Province"
            height={400}
          />

          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'death_claim_count', title: 'Death Claims' },
              { key: 'total_claim_amount', title: 'Total Claim Amount', render: (val) => formatCurrency(val) },
            ]}
            data={deathClaimData.deathClaimsByProvince}
            title="Province-wise Death Claim Comparison"
          />
        </div>
      )}

      {activeTab === 'details' && (
        <DataTable
          columns={[
            { key: 'policy_number', title: 'Policy Number' },
            { key: 'province', title: 'Province' },
            { key: 'claim_type', title: 'Claim Type' },
            { key: 'claim_date', title: 'Claim Date' },
            { key: 'claim_amount', title: 'Claim Amount', render: (val) => formatCurrency(val) },
            { key: 'status', title: 'Status', render: (val) => getStatusBadge(val) },
          ]}
          data={claimDetails}
          title="Recent Claims"
        />
      )}
    </div>
  );
};

export default ClaimsManagement;
