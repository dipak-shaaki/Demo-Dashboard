const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dashboardRoutes = require('./routes/dashboard');
const premiumRoutes = require('./routes/premium');
const agentRoutes = require('./routes/agents');
const renewalRoutes = require('./routes/renewals');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const investmentRoutes = require('./routes/investments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/investments', investmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Insurance Dashboard API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
