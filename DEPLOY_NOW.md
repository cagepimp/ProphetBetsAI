# Deploy ProphetBetsAI to Render NOW

## ✅ Pre-Deployment Checklist Complete

- ✅ Code is ready and pushed to GitHub
- ✅ Build tested successfully (5.69s)
- ✅ `render.yaml` configuration created
- ✅ Server.js configured for production
- ✅ Dependencies installed

## 🚀 Deploy in 5 Minutes

### Step 1: Get Supabase Anon Key (2 minutes)

**You MUST do this first:**

1. Go to: https://supabase.com/dashboard
2. Select project: `abglcmahihbmglkbolir`
3. Click: Settings → API
4. Copy the **anon** / **public** key (NOT service_role)
5. Keep this handy - you'll need it in Step 3

### Step 2: Create Render Service (1 minute)

1. Go to: https://dashboard.render.com/
2. Click: **"New +"** → **"Web Service"**
3. Click: **"Connect a repository"**
4. Find and select: **`cagepimp/ProphetBetsAI`**
5. Render will detect your `render.yaml` automatically
6. Click: **"Create Web Service"**

### Step 3: Add Environment Variables (2 minutes)

Render will prompt you to add these variables. **Copy and paste each one:**

#### Required Variables (Add all 4):

```
VITE_SUPABASE_URL
```
Value: `https://abglcmahihbmglkbolir.supabase.co`

```
VITE_SUPABASE_ANON_KEY
```
Value: `[Paste the anon key from Step 1]`

```
SUPABASE_SERVICE_ROLE_KEY
```
Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZ2xjbWFoaWhibWdsa2JvbGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3ODYyMSwiZXhwIjoyMDc3NjU0NjIxfQ.Ot1R50mLuVb-Byo0Rg83I4vMa3vMeTMbQmnWdWmfKBM`

```
VITE_FRONTEND_URL
```
Value: `https://prophetbet-ai.onrender.com` (update with your actual URL after deployment)

#### Optional API Keys (Add later if needed):

```
ODDS_API_KEY=[your-odds-api-key]
ESPN_API_KEY=[your-espn-api-key]
RAPIDAPI_KEY=[your-rapidapi-key]
```

### Step 4: Deploy (Automatic)

1. After adding environment variables, click: **"Save"**
2. Render will automatically start building
3. Build takes: **2-5 minutes**
4. Watch the logs for any errors

### Step 5: Get Your Live URL

1. After deployment completes, Render shows your URL
2. Copy your URL (e.g., `https://prophetbet-ai-xyz123.onrender.com`)
3. Go back to: **Environment** section
4. Update `VITE_FRONTEND_URL` with your actual URL
5. Click **"Save"** (triggers automatic redeploy, ~2 min)

### Step 6: Test Your App

Visit your URL and verify:
- [ ] App loads without errors
- [ ] You can navigate between pages
- [ ] Sports data displays
- [ ] Health check works: `https://your-url.onrender.com/health`

## 🎉 You're Live!

Your ProphetBetsAI is now live at: `https://[your-service-name].onrender.com`

## 📊 What Render Built

From your `render.yaml`:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `node server.js`
- **Health Check**: `/health`
- **Node Version**: 18
- **Plan**: Free

## ⚡ Performance Notes

**Free Tier:**
- Your app spins down after 15 minutes of inactivity
- Cold start: 30-60 seconds on first request after spin-down
- 750 hours/month runtime (plenty for testing)

**To Keep It Warm:**
- Use UptimeRobot to ping every 14 minutes
- Or upgrade to paid plan ($7/month) for 24/7 uptime

## 🔧 Troubleshooting

### Build Fails
- Check Render logs in dashboard
- Verify all dependencies are in package.json
- Ensure package-lock.json is committed

### App Shows Blank Page
- Check browser console for errors
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Make sure you updated `VITE_FRONTEND_URL`

### 404 Errors
- Server.js handles routing automatically
- Should work out of the box

### Can't Connect to Supabase
- Double-check your anon key
- Verify Supabase project is active
- Check Supabase dashboard for any issues

## 🔄 Auto-Deploy Setup (Optional)

Enable auto-deploy for automatic deployments on git push:

1. Go to: Dashboard → Your Service → Settings
2. Find: **Build & Deploy** section
3. Enable: **Auto-Deploy: Yes**
4. Now every push to `main` auto-deploys

## 📝 Next Steps After Deployment

1. **Test thoroughly** - Click through all features
2. **Add API keys** - For live odds and enhanced features
3. **Custom domain** (optional) - Render supports this
4. **Monitor performance** - Check Render dashboard
5. **Set up alerts** - Get notified of issues

## 💡 Quick Reference

| Item | Value |
|------|-------|
| GitHub Repo | https://github.com/cagepimp/ProphetBetsAI |
| Render Dashboard | https://dashboard.render.com/ |
| Supabase Dashboard | https://supabase.com/dashboard |
| Health Check | `https://your-url.onrender.com/health` |

---

## 🆘 Need Help?

If you run into issues:
1. Check Render logs in dashboard
2. Review RENDER_DEPLOYMENT.md for detailed troubleshooting
3. Test locally: `npm run build && npm start`

**Your app is ready to deploy RIGHT NOW!** 🚀
