# Production Deployment Guide

## 🚀 From POC to Production

This guide covers deploying the Nepal Insurance Dashboard to production with proper architecture, security, and scalability.

---

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Cloud server (AWS EC2 / GCP Compute / Azure VM)
- [ ] Managed MySQL database (AWS RDS / Cloud SQL / Azure Database)
- [ ] Domain name (e.g., dashboard.insurancecompany.com.np)
- [ ] SSL certificate (Let's Encrypt or paid)
- [ ] Backup solution configured

### Application Requirements
- [ ] Node.js 16+ runtime
- [ ] MySQL 5.7+ database
- [ ] npm or yarn package manager
- [ ] Environment variables configured
- [ ] Database backups enabled

---

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Users (Browser)                       │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTPS (SSL)
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Load Balancer / Reverse Proxy               │
│                    (Nginx)                               │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Frontend   │        │   Backend    │
│  (Static)    │        │   API Server │
│   S3/CDN     │        │  (Node.js)   │
└──────────────┘        └───────┬──────┘
                                │
                                │ Connection Pool
                                ▼
                       ┌────────────────┐
                       │  MySQL RDS     │
                       │  (Database)    │
                       └────────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
              ┌──────────┐          ┌──────────┐
              │Power BI  │          │  AI/ML   │
              │ Tableau  │          │ Pipeline │
              └──────────┘          └──────────┘
```

---

## 📦 Deployment Steps

### Step 1: Setup Cloud Infrastructure

#### AWS Example
```bash
# 1. Create EC2 instance (Ubuntu 22.04, t3.medium minimum)
# 2. Create RDS MySQL instance (db.t3.small minimum)
# 3. Configure Security Groups:
#    - EC2: Allow HTTP (80), HTTPS (443), SSH (22)
#    - RDS: Allow MySQL (3306) from EC2 only
# 4. Setup Elastic IP for EC2
# 5. Configure Route53 for domain
```

#### Server Specifications (Minimum)
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Database**: 100 GB SSD (scales with data)

---

### Step 2: Install Dependencies

```bash
# SSH into server
ssh -i key.pem ubuntu@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v  # Should show v18.x.x
npm -v

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

---

### Step 3: Deploy Backend

```bash
# Create app directory
mkdir -p /var/www/insurance-dashboard
cd /var/www/insurance-dashboard

# Clone repository (or upload files)
git clone your-repo-url .

# Install backend dependencies
cd backend
npm install --production

# Create production .env
cat > .env <<EOF
DB_HOST=your-rds-endpoint.ap-south-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=secure_password_here
DB_NAME=insurance_dashboard
DB_PORT=3306
PORT=5000
NODE_ENV=production
EOF

# Setup database
mysql -h your-rds-endpoint -u admin -p < database/schema.sql
mysql -h your-rds-endpoint -u admin -p < database/views.sql
mysql -h your-rds-endpoint -u admin -p < database/ai_features.sql

# Seed data (production data, not mock)
# Import real company data here

# Start with PM2
pm2 start src/server.js --name "dashboard-api"
pm2 save
pm2 startup
```

---

### Step 4: Deploy Frontend

```bash
# Build frontend
cd /var/www/insurance-dashboard/frontend
npm install
npm run build

# Files are in frontend/dist/
# These are static files to serve via Nginx
```

---

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/insurance-dashboard
```

```nginx
server {
    listen 80;
    server_name dashboard.yourcompany.com.np;

    # Frontend (React SPA)
    location / {
        root /var/www/insurance-dashboard/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/insurance-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 6: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d dashboard.yourcompany.com.np

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

### Step 7: Create BI User

```sql
-- Connect to production database
mysql -h your-rds-endpoint -u admin -p

-- Create read-only BI user
CREATE USER 'bi_user'@'%' IDENTIFIED BY 'secure_bi_password';

-- Grant access to views only
GRANT SELECT ON insurance_dashboard.v_* TO 'bi_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'bi_user'@'%';
```

---

### Step 8: Setup Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor application
pm2 monit

# View logs
pm2 logs dashboard-api
```

---

## 🔐 Security Hardening

### 1. Firewall Configuration
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 2. Database Security
```sql
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;

-- Review privileges
SELECT user, host FROM mysql.user;
```

### 3. Application Security
- ✅ Environment variables for secrets
- ✅ SQL parameterized queries (already implemented)
- ✅ CORS configuration
- ⚠️ Add rate limiting (future)
- ⚠️ Add JWT authentication (future)
- ⚠️ Add input validation (future)

---

## 📊 Database Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# /var/www/backup.sh

BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="insurance_dashboard"

# Create backup
mysqldump -h your-rds-endpoint -u admin -p'password' $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
# Make executable
chmod +x /var/www/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /var/www/backup.sh
```

---

## 🔄 CI/CD Pipeline (GitHub Actions Example)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Backend Dependencies
        run: cd backend && npm install --production
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm install
      
      - name: Build Frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/insurance-dashboard
            git pull origin main
            cd backend && npm install --production
            cd ../frontend && npm install && npm run build
            pm2 restart dashboard-api
```

---

## 📈 Performance Tuning

### MySQL Optimization
```ini
# /etc/mysql/my.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### Node.js Optimization
```javascript
// Use cluster module for multi-core
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./src/server.js');
}
```

---

## 🚨 Monitoring & Alerts

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View resource usage
pm2 list

# Check logs
pm2 logs --lines 100
```

### Database Monitoring
```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- Check connections
SHOW STATUS LIKE 'Threads_connected';

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'insurance_dashboard'
ORDER BY size_mb DESC;
```

---

## 📋 Post-Deployment Checklist

- [ ] Dashboard accessible at https://dashboard.yourcompany.com.np
- [ ] All 7 pages loading correctly
- [ ] API endpoints responding
- [ ] Database views working
- [ ] SSL certificate active
- [ ] Backups running
- [ ] Monitoring configured
- [ ] BI user created and tested
- [ ] Performance tested (load testing)
- [ ] Security scan completed
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs dashboard-api

# Check environment variables
cat backend/.env

# Test database connection
mysql -h your-rds-endpoint -u admin -p
```

### Frontend Not Loading
```bash
# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build files exist
ls -la /var/www/insurance-dashboard/frontend/dist/
```

### Database Connection Issues
```bash
# Test from server
mysql -h your-rds-endpoint -u admin -p

# Check security group (AWS)
# Ensure EC2 can access RDS on port 3306
```

---

## 📞 Support

**Production Issues**:
1. Check application logs: `pm2 logs`
2. Check Nginx logs: `/var/log/nginx/`
3. Check MySQL logs: `/var/log/mysql/`
4. Review monitoring dashboard

**Contact**: Development Team  
**Email**: dev-team@insurancecompany.com.np

---

**Last Updated**: 2024-11-15  
**Version**: 1.0.0
