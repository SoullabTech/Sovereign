# 🌟 MAIA Sovereign Process Management

**Centralized control to prevent process proliferation and ensure clean operations**

## Quick Start

```bash
# Check what's running
./process-manager.sh status

# Start development server
./process-manager.sh start-dev

# Emergency cleanup if things get messy
./process-manager.sh cleanup

# Deploy to production
./process-manager.sh deploy
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `start-dev [port]` | Start development server | `./process-manager.sh start-dev 3000` |
| `start-prod [port]` | Start production server | `./process-manager.sh start-prod 80` |
| `start-consciousness` | Start consciousness monitoring | `./process-manager.sh start-consciousness` |
| `stop <service>` | Stop specific service | `./process-manager.sh stop dev-server-3000` |
| `stop-all` | Stop all managed processes | `./process-manager.sh stop-all` |
| `status` | Show all process status | `./process-manager.sh status` |
| `deploy` | Build and deploy production | `./process-manager.sh deploy` |
| `cleanup` | Emergency cleanup all MAIA processes | `./process-manager.sh cleanup` |

## Key Features

### ✅ **Prevents Duplication**
- Checks if processes are already running before starting new ones
- Tracks PIDs in `/tmp/maia-processes/`
- Won't start duplicate servers on the same port

### ✅ **Clean Port Management**
- Automatically kills existing processes on target ports
- Shows clear port usage in status command
- Prevents the "port already in use" errors

### ✅ **Centralized Control**
- Single script manages all MAIA processes
- Consistent logging and PID tracking
- Easy to see what's running and stop everything

### ✅ **Emergency Recovery**
- `cleanup` command kills ALL MAIA-related processes
- Clears stale PID files and port conflicts
- Gets you back to a clean state instantly

## Process Categories

### Development
- `dev-server-3000` - Main development server
- `dev-server-3005` - Alternative port if needed

### Production
- `prod-server-80` - Production server on port 80
- `prod-server-443` - HTTPS production (if configured)

### Monitoring
- `consciousness-monitor` - Python consciousness monitoring service

## Best Practices

### ⭐ **Always use the process manager**
```bash
# ❌ Don't do this anymore
npm run dev

# ✅ Do this instead
./process-manager.sh start-dev
```

### ⭐ **Check status regularly**
```bash
# See what's running
./process-manager.sh status
```

### ⭐ **Clean up when switching contexts**
```bash
# Stop everything when switching between dev/prod
./process-manager.sh stop-all

# Or emergency cleanup if things are broken
./process-manager.sh cleanup
```

## Troubleshooting

### Multiple processes running?
```bash
./process-manager.sh cleanup
./process-manager.sh start-dev
```

### Port conflicts?
The process manager automatically handles port conflicts, but if you see issues:
```bash
# Check what's using ports
lsof -i :3000,3001,3002,3003,3004,80

# Emergency cleanup
./process-manager.sh cleanup
```

### Process won't stop?
```bash
# Force stop all MAIA processes
./process-manager.sh cleanup
```

## Logs

Process logs are stored in `/tmp/maia-processes/`:
- `dev-server-3000.log` - Development server output
- `prod-server-80.log` - Production server output
- `consciousness-monitor.log` - Consciousness monitoring output

```bash
# View logs
tail -f /tmp/maia-processes/dev-server-3000.log
```

---

## 🚨 **Never Accidentally Create Multiple Processes Again!**

This system ensures:
- ✅ Only one development server at a time
- ✅ Clean process tracking and management
- ✅ Easy emergency recovery
- ✅ Clear visibility into what's running
- ✅ Bulletproof deployment without conflicts

**Use `./process-manager.sh status` to always know what's running!**