import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import { policiesAPI } from '../services/api';

const PolicyAnalysis = () => {
  const [lapseLoanData, setLapseLoanData] = useState({ lapse: [], loan: [] });
  const [surrenderData, setSurrenderData] = useState(null);
  const [maturingPolicies, setMaturingPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('lapse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lapseRes, surrenderRes, maturingRes] = await Promise.all([
          policiesAPI.getLapseLoan(),
          policiesAPI.getSurrender(),
          policiesAPI.getMaturing(),
        ]);
        setLapseLoanData(lapseRes.data);
        setSurrenderData(surrenderRes.data);
        setMaturingPolicies(maturingRes.data);
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Policy Analysis</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'lapse' ? 'active' : ''}`} onClick={() => setActiveTab('lapse')}>
          Lapse & Loan
        </button>
        <button className={`tab ${activeTab === 'surrender' ? 'active' : ''}`} onClick={() => setActiveTab('surrender')}>
          Surrender
        </button>
        <button className={`tab ${activeTab === 'maturing' ? 'active' : ''}`} onClick={() => setActiveTab('maturing')}>
          Maturing Policies
        </button>
      </div>

      {activeTab === 'lapse' && (
        <div className="grid-2">
          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'lapse_count', title: 'Lapsed Policies' },
              { key: 'total_premium_lost', title: 'Premium Lost', render: (val) => formatCurrency(val) },
            ]}
            data={lapseLoanData.lapse}
            title="Policy Lapse by Province"
          />
          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'loan_count', title: 'Loan Count' },
              { key: 'total_loan_amount', title: 'Total Loan', render: (val) => formatCurrency(val) },
            ]}
            data={lapseLoanData.loan}
            title="Policy Loans by Province"
          />
        </div>
      )}

      {activeTab === 'surrender' && surrenderData && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '20px' }}>
            <div className="kpi-card accent">
              <div className="kpi-label">Surrender Ratio</div>
              <div className="kpi-value">{surrenderData.surrenderRatio}%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Policies</div>
              <div className="kpi-value">{surrenderData.totalPolicies}</div>
            </div>
          </div>
          <DataChart
            type="pie"
            data={surrenderData.surrenderByProvince}
            xKey="province"
            yKeys={['surrender_count']}
            title="Surrender Policies by Province"
            height={400}
          />
        </div>
      )}

      {activeTab === 'maturing' && (
        <DataTable
          columns={[
            { key: 'policy_number', title: 'Policy Number' },
            { key: 'policyholder_name', title: 'Policyholder' },
            { key: 'province', title: 'Province' },
            { key: 'maturity_date', title: 'Maturity Date' },
            { key: 'sum_assured', title: 'Sum Assured', render: (val) => formatCurrency(val) },
            { key: 'status', title: 'Status' },
          ]}
          data={maturingPolicies}
          title="Maturing Policies (Next 12 Months)"
        />
      )}
    </div>
  );
};

export default PolicyAnalysis;
