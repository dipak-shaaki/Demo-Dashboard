import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import KPICard from '../components/KPICard';
import { investmentsAPI } from '../services/api';

const Investments = () => {
  const [investmentData, setInvestmentData] = useState(null);
  const [fdData, setFdData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [investmentRes, fdRes] = await Promise.all([
          investmentsAPI.getByProvince(),
          investmentsAPI.getFDSummary(),
        ]);
        setInvestmentData(investmentRes.data);
        setFdData(fdRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `NPR ${(value / 10000000).toFixed(2)} Crore`;
    }
    return `NPR ${(value / 100000).toFixed(2)} Lakh`;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Investments & FD</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Investment Overview
        </button>
        <button className={`tab ${activeTab === 'fd' ? 'active' : ''}`} onClick={() => setActiveTab('fd')}>
          FD Details
        </button>
        <button className={`tab ${activeTab === 'maturity' ? 'active' : ''}`} onClick={() => setActiveTab('maturity')}>
          FD Maturity Schedule
        </button>
      </div>

      {activeTab === 'overview' && investmentData && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <KPICard
              title="Total Investment"
              value={formatCurrency(investmentData.total.total)}
              variant="default"
            />
            <KPICard
              title="Total Investments"
              value={investmentData.total.count}
              variant="accent"
            />
          </div>

          <div className="grid-2">
            <DataChart
              type="pie"
              data={investmentData.byType}
              xKey="investment_type"
              yKeys={['total_amount']}
              title="Investment Distribution by Type"
              height={400}
            />

            <DataChart
              type="bar"
              data={investmentData.byProvince}
              xKey="province"
              yKeys={['total_investment']}
              title="Investment by Province"
              height={400}
            />
          </div>

          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'total_investment', title: 'Total Investment', render: (val) => formatCurrency(val) },
              { key: 'count', title: 'Investment Count' },
            ]}
            data={investmentData.byProvince}
            title="Province-wise Investment Details"
          />
        </div>
      )}

      {activeTab === 'fd' && fdData && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <KPICard
              title="Total FD Investment"
              value={formatCurrency(fdData.fdTotal.total)}
              variant="gold"
            />
            <KPICard
              title="Total FD Count"
              value={fdData.fdTotal.count}
              variant="default"
            />
            <KPICard
              title="Average Interest Rate"
              value={`${fdData.fdTotal.avg_rate.toFixed(2)}%`}
              variant="accent"
            />
          </div>

          <DataChart
            type="bar"
            data={fdData.fdByProvince}
            xKey="province"
            yKeys={['total_fd_amount']}
            title="FD Investment by Province"
            height={400}
          />

          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'total_fd_amount', title: 'Total FD Amount', render: (val) => formatCurrency(val) },
              { key: 'fd_count', title: 'FD Count' },
              { key: 'avg_interest_rate', title: 'Avg Interest Rate', render: (val) => `${val.toFixed(2)}%` },
            ]}
            data={fdData.fdByProvince}
            title="Province-wise FD Details"
          />
        </div>
      )}

      {activeTab === 'maturity' && fdData && (
        <DataTable
          columns={[
            { key: 'policy_number', title: 'Policy Number' },
            { key: 'policyholder_name', title: 'Policyholder' },
            { key: 'province', title: 'Province' },
            { key: 'fd_amount', title: 'FD Amount', render: (val) => formatCurrency(val) },
            { key: 'interest_rate', title: 'Interest Rate', render: (val) => `${val.toFixed(2)}%` },
            { key: 'maturity_date', title: 'Maturity Date' },
            { key: 'days_to_maturity', title: 'Days to Maturity' },
            { key: 'policy_sum_assured', title: 'Policy Sum Assured', render: (val) => formatCurrency(val) },
          ]}
          data={fdData.fdMaturitySchedule}
          title="FD Maturity Schedule (Next 12 Months)"
        />
      )}
    </div>
  );
};

export default Investments;
