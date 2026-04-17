const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insurance_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const formatDate = (date) => date.toISOString().split('T')[0];

const nepaliNames = [
  'Ram Sharma', 'Sita Devi', 'Krishna Bahadur', 'Gita Rai', 'Bikash Thapa',
  'Anjali Gurung', 'Prakash Magar', 'Sunita Tamang', 'Deepak Shrestha', 'Pooja Maharjan',
  'Rajesh Karki', 'Manisha Poudel', 'Sanjay Adhikari', 'Rina Bhandari', 'Binod Chettri',
  'Kamala BK', 'Hari Prasad', 'Srijana Limbu', 'Dhruba Basnet', 'Nisha Khatri',
  'Ramesh Dangol', 'Sarita Aryal', 'Bishnu Shahi', 'Kalpana Joshi', 'Ganesh Bista',
  'Meena Pandey', 'Umesh Ghimire', 'Tara Devi', 'Laxman Subedi', 'Rekha Dahal'
];

const agencyNames = [
  'Himalayan Insurance Agency', 'Everest Financial Services', 'Kathmandu Insurance Hub',
  'Nepal Life Advisors', 'Mountain Peak Agency', 'Valley Insurance Solutions',
  'Sherpa Insurance Group', 'Annapurna Financial', 'Lumbini Insurance Center',
  'Machhapuchhre Agency'
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Insert provinces
    console.log('Inserting provinces...');
    const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
    const provinceIds = [];
    
    for (const province of provinces) {
      const [result] = await pool.execute('INSERT INTO provinces (name) VALUES (?)', [province]);
      provinceIds.push(result.insertId);
    }

    // Insert agents (500+ agents)
    console.log('Inserting agents...');
    const agentIds = [];
    const statuses = ['active', 'active', 'active', 'inactive', 'passive']; // More active agents
    
    for (let i = 0; i < 550; i++) {
      const name = nepaliNames[i % nepaliNames.length] + (i > 29 ? ` ${i}` : '');
      const provinceId = provinceIds[randomInt(0, 6)];
      const agencyName = agencyNames[randomInt(0, agencyNames.length - 1)];
      const joinDate = formatDate(randomDate(new Date(2018, 0, 1), new Date(2024, 6, 1)));
      const status = statuses[randomInt(0, statuses.length - 1)];
      const totalPremium = randomFloat(50000, 5000000);
      const lastActivity = status === 'active' ? formatDate(randomDate(new Date(2024, 8, 1), new Date(2024, 10, 1))) : formatDate(randomDate(new Date(2023, 0, 1), new Date(2024, 5, 1)));
      
      await pool.execute(
        'INSERT INTO agents (name, province_id, agency_name, join_date, status, total_premium_collected, last_activity_date, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, provinceId, agencyName, joinDate, status, totalPremium, lastActivity, `98${randomInt(10000000, 99999999)}`, `${name.toLowerCase().replace(/ /g, '.')}@example.com`]
      );
      agentIds.push(agentIds.length + 1);
    }

    // Insert policies (5000+ policies)
    console.log('Inserting policies...');
    const planTypes = ['term', 'endowment', 'money-back', 'whole-life'];
    const policyStatuses = ['active', 'active', 'active', 'active', 'lapsed', 'surrendered', 'matured', 'claim'];
    const policyIds = [];
    
    for (let i = 0; i < 5500; i++) {
      const policyNumber = `POL${2024}${String(i + 1).padStart(6, '0')}`;
      const agentId = agentIds[randomInt(0, agentIds.length - 1)];
      const provinceId = provinceIds[randomInt(0, 6)];
      const planType = planTypes[randomInt(0, 3)];
      const premiumAmount = randomFloat(10000, 500000);
      const sumAssured = randomFloat(500000, 10000000);
      const issueDate = formatDate(randomDate(new Date(2019, 0, 1), new Date(2024, 9, 1)));
      const maturityYears = randomInt(5, 25);
      const maturityDate = formatDate(new Date(new Date(issueDate).setFullYear(new Date(issueDate).getFullYear() + maturityYears)));
      const status = policyStatuses[randomInt(0, policyStatuses.length - 1)];
      
      await pool.execute(
        'INSERT INTO policies (policy_number, agent_id, province_id, plan_type, premium_amount, sum_assured, issue_date, maturity_date, status, policyholder_name, policyholder_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [policyNumber, agentId, provinceId, planType, premiumAmount, sumAssured, issueDate, maturityDate, status, nepaliNames[randomInt(0, nepaliNames.length - 1)], `98${randomInt(10000000, 99999999)}`]
      );
      policyIds.push(policyIds.length + 1);
    }

    // Insert premium collections
    console.log('Inserting premium collections...');
    const paymentModes = ['cash', 'cheque', 'bank_transfer', 'online'];
    const fiscalYears = ['2080/81', '2081/82'];
    
    for (let i = 0; i < 15000; i++) {
      const policyId = policyIds[randomInt(0, policyIds.length - 1)];
      const collectionDate = formatDate(randomDate(new Date(2023, 6, 16), new Date(2024, 10, 15)));
      const amount = randomFloat(5000, 250000);
      const fiscalYear = collectionDate >= '2024-07-16' ? '2081/82' : '2080/81';
      const paymentMode = paymentModes[randomInt(0, paymentModes.length - 1)];
      
      await pool.execute(
        'INSERT INTO premium_collections (policy_id, collection_date, amount, fiscal_year, payment_mode) VALUES (?, ?, ?, ?, ?)',
        [policyId, collectionDate, amount, fiscalYear, paymentMode]
      );
    }

    // Insert claims
    console.log('Inserting claims...');
    const claimTypes = ['death', 'maturity', 'surrender', 'loan'];
    const claimStatuses = ['pending', 'approved', 'approved', 'approved', 'rejected'];
    
    for (let i = 0; i < 800; i++) {
      const policyId = policyIds[randomInt(0, policyIds.length - 1)];
      const claimType = claimTypes[randomInt(0, 3)];
      const claimDate = formatDate(randomDate(new Date(2023, 6, 16), new Date(2024, 10, 15)));
      const claimAmount = randomFloat(200000, 8000000);
      const status = claimStatuses[randomInt(0, claimStatuses.length - 1)];
      
      await pool.execute(
        'INSERT INTO claims (policy_id, claim_type, claim_date, claim_amount, status, claim_description) VALUES (?, ?, ?, ?, ?, ?)',
        [policyId, claimType, claimDate, claimAmount, status, `Claim description for ${claimType} claim`]
      );
    }

    // Insert renewals
    console.log('Inserting renewals...');
    const renewalStatuses = ['paid', 'paid', 'paid', 'pending', 'lapsed'];
    
    for (let i = 0; i < 10000; i++) {
      const policyId = policyIds[randomInt(0, policyIds.length - 1)];
      const renewalDate = formatDate(randomDate(new Date(2021, 6, 16), new Date(2024, 10, 15)));
      const amount = randomFloat(10000, 500000);
      const fiscalYear = renewalDate >= '2024-07-16' ? '2081/82' : renewalDate >= '2023-07-16' ? '2080/81' : '2079/80';
      const status = renewalStatuses[randomInt(0, renewalStatuses.length - 1)];
      
      await pool.execute(
        'INSERT INTO renewals (policy_id, renewal_date, amount, fiscal_year, status) VALUES (?, ?, ?, ?, ?)',
        [policyId, renewalDate, amount, fiscalYear, status]
      );
    }

    // Insert investments
    console.log('Inserting investments...');
    const investmentTypes = ['FD', 'FD', 'FD', 'bonds', 'others'];
    const investmentStatuses = ['active', 'active', 'matured', 'withdrawn'];
    
    for (let i = 0; i < 2000; i++) {
      const policyId = Math.random() > 0.3 ? policyIds[randomInt(0, policyIds.length - 1)] : null;
      const investmentType = investmentTypes[randomInt(0, 4)];
      const amount = randomFloat(100000, 5000000);
      const interestRate = randomFloat(6, 12);
      const startDate = formatDate(randomDate(new Date(2020, 0, 1), new Date(2024, 6, 1)));
      const duration = randomInt(1, 5);
      const maturityDate = formatDate(new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + duration)));
      const status = investmentStatuses[randomInt(0, investmentStatuses.length - 1)];
      
      await pool.execute(
        'INSERT INTO investments (policy_id, investment_type, amount, interest_rate, start_date, maturity_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [policyId, investmentType, amount, interestRate, startDate, maturityDate, status]
      );
    }

    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log('- 7 provinces');
    console.log('- 550 agents');
    console.log('- 5,500 policies');
    console.log('- 15,000 premium collections');
    console.log('- 800 claims');
    console.log('- 10,000 renewals');
    console.log('- 2,000 investments');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
