# 🔒 Admin Panel Deployment Options

## ⚠️ Important
The admin panel should **NOT** be publicly accessible. Choose one of these options:

---

## Option 1: Keep Admin Local (Recommended for Single Admin)

### Setup
1. Keep admin panel on your local machine
2. Run: `npm run dev`
3. Access at: `http://localhost:3000`

### Pros
- ✅ Maximum security
- ✅ No public access
- ✅ Simple setup

### Cons
- ❌ Requires your machine to be running
- ❌ Not accessible from other devices

---

## Option 2: Deploy with Vercel Password Protection

### Setup
1. Deploy admin panel as **separate Vercel project**
2. Go to **Settings → Deployment Protection**
3. Enable **"Password Protection"**
4. Set a strong password
5. Share password only with trusted team members

### Pros
- ✅ Accessible from anywhere
- ✅ Easy to set up
- ✅ Vercel handles protection

### Cons
- ❌ Single password (shared access)
- ❌ Less secure than IP whitelist

### Steps
```bash
cd admin-panel
vercel login
vercel --prod
# Then enable password protection in Vercel dashboard
```

---

## Option 3: Deploy with IP Whitelist (Most Secure)

### Setup
1. Deploy admin panel separately
2. Get your IP: https://api.ipify.org?format=json
3. Update `middleware.js` with your IP
4. Deploy to Vercel

### Pros
- ✅ Maximum security
- ✅ Only your IP can access
- ✅ Accessible from anywhere (if IP is whitelisted)

### Cons
- ❌ Need to update IP if it changes
- ❌ Requires static IP or VPN

### Implementation
1. Edit `admin-panel/middleware.js`
2. Add your IP to `ALLOWED_IPS` array
3. Deploy

---

## Option 4: Deploy on Different Platform (Railway, Render)

### Railway Setup
1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Select `admin-panel` folder
4. Add environment variables
5. Set up IP restrictions in Railway settings

### Render Setup
1. Create account at https://render.com
2. New Web Service → Connect GitHub
3. Select `admin-panel` folder
4. Add environment variables
5. Use Render's IP whitelist feature

---

## 🔐 Security Best Practices

### For All Options:
- ✅ Use strong admin passwords
- ✅ Enable 2FA on admin accounts
- ✅ Never commit `.env.local` to git
- ✅ Regularly update dependencies
- ✅ Monitor access logs

### For Deployed Admin:
- ✅ Use HTTPS only
- ✅ Set up monitoring/alerts
- ✅ Regular security audits
- ✅ Limit admin user accounts

---

## 📋 Environment Variables for Admin Panel

If deploying, add these in your platform:

```
DATABASE_URL=postgresql://postgres.bmwibujhnwmoyiaaahwo:iSpr97%24v_2-%2BnjS@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
JWT_SECRET=stylemart-admin-secret-key-2026-xK9mP2vL
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_SUPABASE_URL=https://bmwibujhnwmoyiaaahwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtd2lidWpobndtb3lpYWFhaHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzE4OTAsImV4cCI6MjA4ODEwNzg5MH0.hxhBH8HKqrUA61H1HWvPA1Y1d5TIVnuZKXQb901iaEM
```

---

## ✅ Recommended Approach

**For single admin user**: **Option 1** (Keep Local)
- Simple, secure, no deployment needed

**For team access**: **Option 2** (Vercel Password Protection)
- Easy setup, accessible from anywhere

**For maximum security**: **Option 3** (IP Whitelist)
- Best protection, requires static IP

---

## 🚀 Quick Start (Local)

```bash
cd admin-panel
npm install
npm run dev
# Access at http://localhost:3000
```
