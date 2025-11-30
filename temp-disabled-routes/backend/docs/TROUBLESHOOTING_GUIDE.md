# 🔧 SpiralogicOracleSystem Troubleshooting Guide

## Quick Diagnostics

### 🚨 System Health Check

```bash
# Run comprehensive health check
curl https://your-domain.com/api/health/full

# Check individual components
curl https://your-domain.com/api/health          # API status
curl https://your-domain.com/api/health/db       # Database
curl https://your-domain.com/api/health/redis    # Redis
curl https://your-domain.com/api/health/oracle   # Oracle system
```

## Common Issues & Solutions

### 1. Build & Deployment Issues

#### ❌ **Problem**: TypeScript compilation fails

```
Error: Cannot find module '@/lib/supabase'
```

**Solution**:

```bash
# Clear TypeScript cache
rm -rf backend/dist
rm -rf backend/tsconfig.tsbuildinfo

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Rebuild with verbose output
npm run build:render-simple
```

#### ❌ **Problem**: Module resolution errors

```
Error: Cannot find module 'express'
```

**Solution**:

```bash
# Check Node version
node --version  # Should be 20.x

# Install with exact versions
npm ci --production

# If persists, check package.json type
# Ensure "type": "commonjs" in backend/package.json
```

#### ❌ **Problem**: Memory issues during build

```
FATAL ERROR: Reached heap limit
```

**Solution**:

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or use minimal build
npm run build:minimal
```

### 2. Database Connection Issues

#### ❌ **Problem**: Database connection timeout

```
Error: Connection terminated unexpectedly
```

**Solution**:

```bash
# Test direct connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool settings
# In your .env:
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000

# Verify SSL mode
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### ❌ **Problem**: Migration failures

```
Error: relation "users" already exists
```

**Solution**:

```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM schema_migrations;"

# Run specific migration
psql $DATABASE_URL -f supabase/migrations/specific_migration.sql

# Reset migrations (CAUTION: Development only)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### 3. Redis & Memory System Issues

#### ❌ **Problem**: Redis connection refused

```
Error: Redis connection to localhost:6379 failed
```

**Solution**:

```bash
# Check Redis status
sudo systemctl status redis
redis-cli ping

# Start Redis if needed
sudo systemctl start redis

# Check Redis config
redis-cli CONFIG GET bind
redis-cli CONFIG GET protected-mode

# Test connection with URL
redis-cli -u $REDIS_URL ping
```

#### ❌ **Problem**: Memory system not persisting

```
Soul memories disappearing after restart
```

**Solution**:

```bash
# Enable Redis persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"
redis-cli CONFIG SET appendonly yes

# Check memory usage
redis-cli INFO memory

# Clear cache if needed
redis-cli FLUSHDB  # CAUTION: Clears all data
```

### 4. Oracle & AI Service Issues

#### ❌ **Problem**: Oracle responses timing out

```
Error: OpenAI API request timed out
```

**Solution**:

```bash
# Check API key validity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Increase timeout in code
# backend/lib/openaiClient.ts:
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds
});

# Use fallback model
OPENAI_MODEL=gpt-3.5-turbo  # Instead of gpt-4
```

#### ❌ **Problem**: Rate limiting errors

```
Error: Rate limit reached for requests
```

**Solution**:

```bash
# Implement exponential backoff
# Add to .env:
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Use Redis for distributed rate limiting
npm install rate-limiter-flexible
```

### 5. Authentication Issues

#### ❌ **Problem**: JWT token validation fails

```
Error: Invalid token signature
```

**Solution**:

```bash
# Regenerate JWT secret
openssl rand -base64 32

# Update .env:
JWT_SECRET=your_new_secret

# Clear existing sessions
redis-cli KEYS "sess:*" | xargs redis-cli DEL

# Restart application
pm2 restart soullab-backend
```

#### ❌ **Problem**: CORS errors

```
Access to fetch at 'api' from origin 'https://app.com' has been blocked
```

**Solution**:

```javascript
// backend/src/app.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### 6. Performance Issues

#### ❌ **Problem**: Slow API responses

```
Oracle queries taking > 10 seconds
```

**Solution**:

```bash
# Enable query logging
# In PostgreSQL:
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;

# Add database indexes
psql $DATABASE_URL -c "
  CREATE INDEX idx_memories_user_created
  ON soul_memories(user_id, created_at DESC);
"

# Enable Redis caching
ENABLE_REDIS_CACHE=true
CACHE_TTL_SECONDS=3600
```

#### ❌ **Problem**: Memory leaks

```
Node process consuming increasing memory
```

**Solution**:

```bash
# Monitor memory usage
pm2 monit

# Enable heap snapshots
node --inspect dist/server-simple.js

# Add memory limits
pm2 start dist/server-simple.js --max-memory-restart 1G

# Check for event listener leaks
# Add to code:
process.on('warning', (warning) => {
  console.warn(warning.stack);
});
```

### 7. Frontend Issues

#### ❌ **Problem**: Blank page after deployment

```
Console: Failed to load resource: 404
```

**Solution**:

```bash
# Check build output
ls -la .next/
ls -la public/

# Verify environment variables
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_SUPABASE_URL

# Rebuild with clean cache
rm -rf .next
npm run build

# Check Vercel logs
vercel logs
```

#### ❌ **Problem**: Hydration mismatch

```
Error: Text content does not match server-rendered HTML
```

**Solution**:

```javascript
// Use dynamic imports for client-only components
const OracleChat = dynamic(() => import("@/components/OracleChat"), {
  ssr: false,
});

// Check for browser-only code
if (typeof window !== "undefined") {
  // Browser-only code
}
```

## Debug Commands

### 🔍 Application Debugging

```bash
# Run in debug mode
NODE_ENV=development DEBUG=* node dist/server-simple.js

# Test specific endpoints
curl -X POST https://your-domain.com/api/oracle/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Test query"}'

# Check process status
pm2 status
pm2 logs soullab-backend --lines 100

# Database queries
psql $DATABASE_URL -c "
  SELECT COUNT(*) as total_users FROM users;
  SELECT COUNT(*) as total_memories FROM soul_memories;
  SELECT COUNT(*) as active_sessions FROM sessions
  WHERE expires_at > NOW();
"
```

### 📊 Performance Analysis

```bash
# CPU profiling
node --prof dist/server-simple.js
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --expose-gc --inspect dist/server-simple.js

# Network analysis
tcpdump -i any -w capture.pcap port 10000

# Load testing
artillery quick --count 10 --num 100 \
  https://your-domain.com/api/health
```

## Emergency Procedures

### 🚨 Service Recovery

```bash
# Full restart sequence
sudo systemctl stop soullab-backend
sudo systemctl stop redis
sudo systemctl stop postgresql

# Clear problematic data
redis-cli FLUSHDB  # CAUTION: Clears cache

# Start services
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start soullab-backend

# Verify recovery
./scripts/health-check.sh
```

### 🔄 Rollback Procedure

```bash
# 1. Stop current version
pm2 stop soullab-backend

# 2. Restore previous version
cd /opt/soullab
git fetch --tags
git checkout previous-version-tag

# 3. Restore database if needed
psql $DATABASE_URL < /backups/db_backup_stable.sql

# 4. Clear caches
redis-cli FLUSHALL

# 5. Rebuild and restart
npm ci --production
npm run build
pm2 start soullab-backend
```

## Logging & Monitoring

### 📝 Log Locations

```bash
# Application logs
/var/log/soullab/app.log
/var/log/soullab/error.log

# System logs
journalctl -u soullab-backend -f

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log

# PostgreSQL logs
/var/log/postgresql/postgresql-14-main.log

# Redis logs
/var/log/redis/redis-server.log
```

### 🔍 Log Analysis

```bash
# Find errors in last hour
journalctl -u soullab-backend --since "1 hour ago" | grep ERROR

# Count error types
grep ERROR /var/log/soullab/error.log | cut -d' ' -f5- | sort | uniq -c

# Monitor real-time
tail -f /var/log/soullab/app.log | grep -E "ERROR|WARN"

# Database slow queries
grep "duration:" /var/log/postgresql/*.log | awk '$NF > 1000'
```

## Support Escalation

### 📞 Escalation Path

1. **Level 1**: Application logs & health checks
2. **Level 2**: Database & Redis diagnostics
3. **Level 3**: Infrastructure & network analysis
4. **Level 4**: Code debugging & profiling

### 🆘 Getting Help

```bash
# Generate diagnostic report
./scripts/generate-diagnostic-report.sh > diagnostic_$(date +%Y%m%d_%H%M%S).txt

# Information to include:
- Error messages & stack traces
- Recent deployment changes
- Environment configuration (sanitized)
- Performance metrics
- Log excerpts (last 1000 lines)
```

---

_Sacred Technology Support - Transforming Errors into Wisdom_ 🔮
