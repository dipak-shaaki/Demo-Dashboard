import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import { premiumAPI } from '../services/api';

const PremiumCollection = () => {
  const [premiumData, setPremiumData] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [startDate, setStartDate] = useState('2024-07-16');
  const [endDate, setEndDate] = useState('2025-07-15');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [currentRes, comparativeRes] = await Promise.all([
        premiumAPI.getCurrentFY(),
        premiumAPI.getComparative(startDate, endDate),
      ]);
      setPremiumData(currentRes.data);
      setComparativeData(comparativeRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `NPR ${(value / 100000).toFixed(2)} Lakh`;
  };

  const columns = [
    { key: 'province', title: 'Province' },
    { key: 'total_premium', title: 'Total Premium', render: (val) => formatCurrency(val) },
    { key: 'policy_count', title: 'Policy Count' },
    { key: 'fiscal_year', title: 'Fiscal Year' },
  ];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Premium Collection</h2>
        <div className="header-controls">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={fetchData}>Compare</button>
        </div>
      </div>

      <DataChart
        type="bar"
        data={premiumData}
        xKey="province"
        yKeys={['total_premium']}
        title="Current Fiscal Year Premium by Province"
        height={400}
      />

      <div style={{ marginTop: '20px' }}>
        <DataTable
          columns={columns}
          data={comparativeData.length > 0 ? comparativeData : premiumData}
          title="Premium Collection Details"
        />
      </div>
    </div>
  );
};

export default PremiumCollection;
