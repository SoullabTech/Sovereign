# 🧪 MAIA SoulLab Tester Access Guide

## 🌐 **EXTERNAL ACCESS (Works from anywhere!)**

### **NEW: HTTPS Access (Bypasses ISP blocking!)**
```
https://soullab.life/
https://soullab.life/labtools/
```
**⚠️ Security Certificate Warning:** Your browser will show "Not Secure" or certificate warnings. This is expected for our self-signed certificate. Click "Advanced" → "Proceed to soullab.life" to continue.

### **Bypassing Certificate Warnings by Browser:**

**Chrome:**
1. You'll see "Your connection is not private"
2. Click "Advanced"
3. Click "Proceed to soullab.life (unsafe)"

**Safari:**
1. You'll see "This Connection Is Not Private"
2. Click "Show Details"
3. Click "visit this website"
4. Click "Visit Website" again

**Firefox:**
1. You'll see "Warning: Potential Security Risk Ahead"
2. Click "Advanced..."
3. Click "Accept the Risk and Continue"

**Edge:**
1. You'll see "Your connection isn't private"
2. Click "Advanced"
3. Click "Continue to soullab.life (unsafe)"

### **Fallback External URLs**
```
https://soullab.loca.lt/maia/
https://soullab.loca.lt/labtools/
```

## ✅ **LOCAL NETWORK ACCESS**

### **Primary Local Access (All Browsers)**
```
http://192.168.4.210/maia/
http://192.168.4.210/labtools/
```

### **Backup Local Access**
```
http://192.168.4.210:8080/maia/
http://192.168.4.210:8080/labtools/
```

---

## 🔧 **Chrome-Specific Troubleshooting**

### **Method 1: Clear DNS Cache**
1. Open Chrome
2. Go to: `chrome://net-internals/#dns`
3. Click "Clear host cache"
4. Try: `http://soullab.life/maia`

### **Method 2: Incognito Mode**
1. Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
2. Try: `http://soullab.life/maia`

### **Method 3: Force HTTP Protocol**
- Use: `http://soullab.life/maia` (not https://)
- Chrome may auto-redirect to HTTPS which won't work

### **Method 4: Disable Security Features**
1. Go to: `chrome://flags/`
2. Search: "secure dns"
3. Set to "Disabled"
4. Restart Chrome

---

## 🌐 **Domain Access (May Work Depending on Network)**

### **Primary Domain Routes**
```
http://soullab.life/maia/
http://soullab.life/labtools/
```

### **Alternative Port Routes**
```
http://soullab.life:8080/maia/
http://32.217.63.121:8080/maia/
```

---

## 📱 **Mobile Testing**

### **iOS Safari** ✅
- Should work with: `http://soullab.life/maia`

### **Chrome Mobile** ⚠️
- Use direct IP: `http://192.168.4.210/maia/`
- Clear Chrome app data if needed

### **Android Chrome** ⚠️
- Use direct IP: `http://192.168.4.210/maia/`
- Try incognito mode

---

## 🔍 **Troubleshooting Steps**

### **If Nothing Works:**
1. **Check Network Connection**
   - Must be on same WiFi network as server
   - Ask admin for network name/password

2. **Try Different Browser**
   - Firefox: `http://192.168.4.210/maia/`
   - Edge: `http://192.168.4.210/maia/`
   - Safari: `http://soullab.life/maia`

3. **Check Firewall/VPN**
   - Disable VPN temporarily
   - Check corporate firewall settings

### **For Developers:**
- Server Status: Both `maia-main` and `maia-labtools` running ✅
- Nginx Proxy: Configured for ports 80 and 8080 ✅
- PM2 Management: Active with auto-restart ✅

---

## 📞 **Support**

**If you're still having issues:**
- Try the guaranteed working URLs first: `http://192.168.4.210/maia/`
- Report browser type and specific error messages
- Include screenshot of any error pages

**Current Server Status:** 🟢 Online
**Last Updated:** $(date)