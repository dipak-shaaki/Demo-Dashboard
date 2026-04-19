import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import { renewalsAPI } from '../services/api';

const RenewalTracking = () => {
  const [renewalData, setRenewalData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      const response = await renewalsAPI.getYearlyComparison(selectedYear || null);
      setRenewalData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `NPR ${(value / 100000).toFixed(2)} Lakh`;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Renewal Tracking</h2>
        <div className="header-controls">
          <select
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2081/82">FY 2081/82</option>
            <option value="2080/81">FY 2080/81</option>
            <option value="2079/80">FY 2079/80</option>
          </select>
        </div>
      </div>

      <DataChart
        type="bar"
        data={renewalData}
        xKey="province"
        yKeys={['paid_count', 'pending_count', 'lapsed_count']}
        title="Renewal Status by Province"
        height={400}
      />

      <DataTable
        columns={[
          { key: 'province', title: 'Province' },
          { key: 'fiscal_year', title: 'Fiscal Year' },
          { key: 'total_renewal', title: 'Total Renewal', render: (val) => formatCurrency(val) },
          { key: 'paid_count', title: 'Paid' },
          { key: 'pending_count', title: 'Pending' },
          { key: 'lapsed_count', title: 'Lapsed' },
        ]}
        data={renewalData}
        title="Year-wise Renewal Comparison"
      />
    </div>
  );
};

export default RenewalTracking;
