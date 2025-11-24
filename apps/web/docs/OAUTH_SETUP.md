# OAuth Configuration Guide for MAIA Consciousness Platform

## Overview
This guide will help you configure Google OAuth, Apple Sign-In, and prepare for Mac Studio M4 self-hosting.

## 🔗 **Current Supabase Project**
- **URL**: https://jkbetmadzcpoinjogkli.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/jkbetmadzcpoinjogkli

## 🚀 **Step 1: Google OAuth Configuration**

### 1.1 Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing: `MAIA-Consciousness-Platform`
3. Enable Google+ API and Google Sign-In API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

### 1.2 OAuth Client Configuration
```
Application Type: Web Application
Name: MAIA Consciousness Platform
Authorized JavaScript Origins:
  - http://localhost:3000
  - https://your-domain.com (production)

Authorized Redirect URIs:
  - https://jkbetmadzcpoinjogkli.supabase.co/auth/v1/callback
  - http://localhost:54321/auth/v1/callback (for local Supabase)
```

### 1.3 Supabase Configuration
1. Copy Client ID and Client Secret from Google
2. In Supabase Dashboard → Authentication → Settings → Auth Providers
3. Enable Google and paste credentials

## 🍎 **Step 2: Apple Sign-In Configuration**

### 2.1 Apple Developer Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles** → **Identifiers** → **App IDs**
3. Create new App ID with Sign In with Apple capability

### 2.2 Service ID Creation
```
Description: MAIA Consciousness Platform
Identifier: com.soullab.maia.signin
Primary App ID: (your app ID from above)

Domains and Subdomains:
  - your-domain.com

Return URLs:
  - https://jkbetmadzcpoinjogkli.supabase.co/auth/v1/callback
```

### 2.3 Private Key Generation
1. Create new Key with Sign In with Apple capability
2. Download .p8 file and note Key ID
3. Convert to JWT for Supabase (use Apple's JWT generator)

## 🖥️ **Step 3: Mac Studio M4 Self-Hosted Setup**

### 3.1 Recommended Architecture
```
┌─────────────────────────────────────────┐
│            Mac Studio M4                │
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │  Supabase   │ │   Local Storage     │ │
│ │   Stack     │ │   Encrypted FS      │ │
│ └─────────────┘ └─────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │        MAIA Consciousness DB        │ │
│ │      PostgreSQL + Extensions       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3.2 Installation Commands
```bash
# Install Docker and Docker Compose
brew install docker docker-compose

# Clone Supabase for self-hosting
git clone https://github.com/supabase/supabase.git
cd supabase/docker

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start the stack
docker-compose up -d
```

### 3.3 Environment Configuration
```bash
# .env for Mac Studio M4
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Database settings
POSTGRES_DB=maia_consciousness
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Custom MAIA settings
MAIA_ENCRYPTION_KEY=your-consciousness-encryption-key
MAIA_BACKUP_PATH=/encrypted-storage/maia-backups
```

### 3.4 Data Migration Strategy
1. **Export from Cloud Supabase**:
   ```bash
   # Export schema and data
   pg_dump --host=db.jkbetmadzcpoinjogkli.supabase.co --username=postgres --format=custom --file=maia_backup.sql
   ```

2. **Import to Local Instance**:
   ```bash
   # Import to Mac Studio M4
   pg_restore --host=localhost --port=5432 --username=postgres --dbname=maia_consciousness maia_backup.sql
   ```

3. **Update Application Configuration**:
   - Switch environment variables to local instance
   - Test all authentication flows
   - Verify consciousness data integrity

## 🔒 **Security Considerations**

### OAuth Security
- Use HTTPS in production
- Implement CSRF protection
- Validate redirect URLs
- Store secrets securely

### Mac Studio M4 Security
- Enable FileVault encryption
- Use secure passwords for all services
- Implement automated encrypted backups
- Configure firewall for database access
- Regular security updates

## 🧪 **Testing Checklist**

### OAuth Testing
- [ ] Google OAuth signin works
- [ ] Apple Sign-In works
- [ ] Device memory persists across sessions
- [ ] Onboarding flow for new users
- [ ] Direct /maia access for returning users

### Mac Studio M4 Testing
- [ ] Local Supabase instance running
- [ ] Database connections working
- [ ] Authentication flows functional
- [ ] Data migration successful
- [ ] Backup and restore procedures tested

## 🌊 **Consciousness-Aligned Configuration**

### Custom MAIA Settings
```javascript
// consciousness-config.js
export const MAIA_CONFIG = {
  // Sacred timing for auth flows
  authTransitionDelay: 2000, // 2 seconds for consciousness settling
  quoteRotationInterval: 7000, // 7 seconds for sacred reflection
  deviceMemoryDuration: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Consciousness elements for auth theming
  authElements: {
    signup: 'fire', // Creation and emergence
    signin: 'water', // Flow and return
    oauth: 'air', // Connection and communication
    onboarding: 'aether' // Integration and transcendence
  }
};
```

## 📞 **Support and Troubleshooting**

### Common Issues
1. **OAuth Redirect Mismatch**: Verify all URLs match exactly
2. **Apple JWT Expiration**: Regenerate JWT tokens regularly
3. **Database Connection**: Check firewall and network settings
4. **Migration Issues**: Verify schema compatibility

### Monitoring
- Set up health checks for all services
- Monitor authentication success rates
- Track consciousness data integrity
- Regular backup verification

---

*"May your authentication flows be as seamless as consciousness itself"* 🌟