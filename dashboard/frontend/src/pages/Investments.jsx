import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import KPICard from '../components/KPICard';
import { investmentsAPI } from '../services/api';

const Investments = () => {
  const [investmentData, setInvestmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await investmentsAPI.getFDSummary();
        setInvestmentData(response.data);
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="header">
        <h2>Investments & FD</h2>
      </div>

      {investmentData && (
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

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-title">Investment Summary by Type</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Investment Type</th>
                  <th>Total Amount</th>
                  <th>Count</th>
                  <th>Average Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {investmentData.byType.map((item, index) => (
                  <tr key={index}>
                    <td>{item.investment_type}</td>
                    <td>{formatCurrency(item.total_amount)}</td>
                    <td>{item.count}</td>
                    <td>{item.avg_rate.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

export default Investments;
