# 🚀 DEPLOYMENT CHEATSHEET

## Quick Deploy Commands (No AI Required!)

### 🔹 **Preview Deploy** (Test Before Going Live)
```bash
./preview-deploy.sh
```
- Creates temporary test URL
- Expires after 7 days
- Safe for testing changes

### 🔹 **Production Deploy** (Go Live!)
```bash
./emergency-deploy.sh
```
- Updates main site: `spiralogic-oracle-system.vercel.app`
- Permanent deployment
- Use AFTER preview looks good

---

## 📋 Step-by-Step Manual Deploy

If scripts don't work, here's the manual process:

### 1. Clean Up First
```bash
rm -rf .next dist node_modules/.cache
```

### 2. Deploy Preview
```bash
cd apps/web
vercel --archive=tgz --yes
cd ../..
```

### 3. Deploy Production
```bash
cd apps/web
vercel --prod --archive=tgz --yes
cd ../..
```

---

## 🔧 Troubleshooting

### "Command not found: vercel"
```bash
npm install -g vercel
```

### "Not linked to project"
```bash
cd apps/web
vercel link
# Follow prompts to select existing project
```

### "Build failed"
Check logs:
```bash
cat vercel-deploy.log
```

### "Too many files"
The `--archive=tgz` flag should handle this, but if not:
```bash
echo "node_modules" >> .vercelignore
echo ".next" >> .vercelignore
echo "dist" >> .vercelignore
```

---

## 🎯 Golden Rule

**Always deploy in this order:**

1. Make changes locally
2. Run `./preview-deploy.sh` → Get preview URL
3. Test the preview URL thoroughly
4. If happy, run `./emergency-deploy.sh` → Goes live

---

## 📝 Important Notes

- **Preview URLs** look like: `spiralogic-abc123.vercel.app`
- **Production URL** is always: `spiralogic-oracle-system.vercel.app`
- **Logs** saved to: `vercel-deploy.log` or `preview-deploy.log`
- **Backend API** uses stub mode (no real API calls during demos)

---

## 🆘 Emergency Contacts

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/dashboard/project/spiralogic-oracle-system
- **Support**: Check `vercel-deploy.log` first, then ask team lead

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Tested locally with `npm run dev`
- [ ] Deployed to preview with `./preview-deploy.sh`
- [ ] Checked preview URL on mobile & desktop
- [ ] No console errors in browser DevTools
- [ ] Ready to go live!

Then run: `./emergency-deploy.sh` 🚀