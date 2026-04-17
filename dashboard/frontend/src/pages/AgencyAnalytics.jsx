import React, { useState, useEffect } from 'react';
import DataChart from '../components/DataChart';
import DataTable from '../components/DataTable';
import { agentsAPI } from '../services/api';

const AgencyAnalytics = () => {
  const [growthData, setGrowthData] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [agentList, setAgentList] = useState([]);
  const [passiveToActive, setPassiveToActive] = useState([]);
  const [activeTab, setActiveTab] = useState('growth');
  const [statusFilter, setStatusFilter] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [growthRes, topRes, statusRes, passiveRes] = await Promise.all([
        agentsAPI.getGrowthRate(),
        agentsAPI.getTop20(2024),
        agentsAPI.getStatusList(statusFilter),
        agentsAPI.getPassiveToActive(),
      ]);
      setGrowthData(growthRes.data);
      setTopAgents(topRes.data);
      setAgentList(statusRes.data);
      setPassiveToActive(passiveRes.data);
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
        <h2>Agency Analytics</h2>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'growth' ? 'active' : ''}`} onClick={() => setActiveTab('growth')}>
          Growth Rate
        </button>
        <button className={`tab ${activeTab === 'top' ? 'active' : ''}`} onClick={() => setActiveTab('top')}>
          Top 20 Agents
        </button>
        <button className={`tab ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>
          Agent List
        </button>
        <button className={`tab ${activeTab === 'reactivated' ? 'active' : ''}`} onClick={() => setActiveTab('reactivated')}>
          Passive to Active
        </button>
      </div>

      {activeTab === 'growth' && (
        <div>
          <DataChart
            type="bar"
            data={growthData}
            xKey="province"
            yKeys={['new_agents_2024', 'new_agents_2023']}
            title="Agency Growth by Province"
            height={400}
          />
          <DataTable
            columns={[
              { key: 'province', title: 'Province' },
              { key: 'new_agents_2024', title: 'New Agents 2024' },
              { key: 'new_agents_2023', title: 'New Agents 2023' },
              { key: 'total_agents', title: 'Total Agents' },
              { key: 'growth_rate', title: 'Growth Rate (%)' },
            ]}
            data={growthData}
            title="Province-wise Agency Growth"
          />
        </div>
      )}

      {activeTab === 'top' && (
        <DataTable
          columns={[
            { key: 'name', title: 'Agent Name' },
            { key: 'agency_name', title: 'Agency' },
            { key: 'province', title: 'Province' },
            { key: 'total_collected', title: 'Total Collected', render: (val) => formatCurrency(val) },
            { key: 'policies_count', title: 'Policies' },
          ]}
          data={topAgents}
          title="Top 20 Agents - 2024"
        />
      )}

      {activeTab === 'status' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active Agents</option>
              <option value="inactive">Inactive Agents</option>
              <option value="passive">Passive Agents</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: 'name', title: 'Agent Name' },
              { key: 'province', title: 'Province' },
              { key: 'agency_name', title: 'Agency' },
              { key: 'total_premium_collected', title: 'Total Premium', render: (val) => formatCurrency(val) },
              { key: 'join_date', title: 'Join Date' },
              { key: 'last_activity_date', title: 'Last Activity' },
            ]}
            data={agentList}
            title={`${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Agents`}
          />
        </div>
      )}

      {activeTab === 'reactivated' && (
        <DataTable
          columns={[
            { key: 'name', title: 'Agent Name' },
            { key: 'province', title: 'Province' },
            { key: 'agency_name', title: 'Agency' },
            { key: 'total_premium_collected', title: 'Total Premium', render: (val) => formatCurrency(val) },
            { key: 'last_activity_date', title: 'Last Activity' },
          ]}
          data={passiveToActive}
          title="Recently Reactivated Agents (Passive to Active)"
        />
      )}
    </div>
  );
};

export default AgencyAnalytics;
