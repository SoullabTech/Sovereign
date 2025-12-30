# DNS Cache Flush Commands

## Platform-Specific Commands

### macOS:

```bash
sudo killall -HUP mDNSResponder
```

### Windows:

```bash
ipconfig /flushdns
```

### Linux (depending on distro):

```bash
# systemd-based (Ubuntu 20.04+, Fedora, etc.)
sudo systemd-resolve --flush-caches

# Traditional DNS cache
sudo service network-manager restart

# Or for older systems
sudo /etc/init.d/networking restart
```

## When to Flush DNS Cache

1. **Domain propagation issues**: New DNS records not resolving locally
2. **Cached 404/NXDOMAIN responses**: Old failures being cached
3. **Testing domain changes**: Ensuring fresh DNS lookups
4. **ISP DNS issues**: Bypassing problematic upstream cache

## Current Domain Status

### DNS Records (✅ Correct):

```bash
dig +short soullab.life @1.1.1.1
# Returns: 76.76.21.21 ✅

dig +short oracle.soullab.life @1.1.1.1
# Returns: cname.vercel-dns.com. ✅
```

### Domain Response (❌ Needs Transfer):

```bash
curl -I https://soullab.life/
# Returns: HTTP/2 404 (x-vercel-error: NOT_FOUND)
# Issue: Domain assigned to different Vercel project
```

## Troubleshooting Steps

1. **Flush DNS cache** (run the command for your OS above)
2. **Test DNS resolution**:
   ```bash
   nslookup soullab.life
   nslookup oracle.soullab.life
   ```
3. **Test different DNS servers**:
   ```bash
   dig +short soullab.life @8.8.8.8      # Google DNS
   dig +short soullab.life @1.1.1.1      # Cloudflare DNS
   dig +short soullab.life @208.67.222.222  # OpenDNS
   ```
4. **Check domain assignment in Vercel dashboard**
5. **Transfer domains to correct project**

## After DNS Flush

Run these tests to verify:

```bash
# Check DNS resolution
dig +short soullab.life
dig +short oracle.soullab.life

# Test HTTP responses
curl -I https://soullab.life/
curl -I https://oracle.soullab.life/

# Or use our automated checker
./setup-domains.sh
```

## Expected Results After Domain Transfer

All commands should return:

```
HTTP/2 200 OK
server: Vercel
x-matched-path: /
```

Instead of:

```
HTTP/2 404
x-vercel-error: NOT_FOUND
```
