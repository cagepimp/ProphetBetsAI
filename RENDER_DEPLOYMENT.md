# ProphetBet AI - Render Deployment Guide

## Prerequisites

Before deploying to Render, you need:

1. A [Render account](https://render.com/) (free tier available)
2. Your Supabase credentials:
   - **VITE_SUPABASE_URL**: `https://abglcmahihbmglkbolir.supabase.co`
   - **VITE_SUPABASE_ANON_KEY**: Get from Supabase Dashboard > Settings > API > anon/public key
   - **SUPABASE_SERVICE_ROLE_KEY**: Already in your .env file
3. Optional API keys (for enhanced features):
   - TheOddsAPI key
   - ESPN API key
   - RapidAPI key

## Quick Deploy to Render

### Option 1: Using render.yaml (Recommended - Infrastructure as Code)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**:
   - Go to https://dashboard.render.com/
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:

   Render will prompt you to add these environment variables (marked as `sync: false` in render.yaml):

   **REQUIRED:**
   - `VITE_SUPABASE_URL` = `https://abglcmahihbmglkbolir.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = Get from Supabase Dashboard > Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key from .env
   - `VITE_FRONTEND_URL` = Your Render URL (will be provided after creation, e.g., `https://prophetbet-ai.onrender.com`)

   **OPTIONAL (but recommended for full functionality):**
   - `ODDS_API_KEY` = Your TheOddsAPI key
   - `ESPN_API_KEY` = Your ESPN API key
   - `RAPIDAPI_KEY` = Your RapidAPI key

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Build time: ~2-5 minutes

### Option 2: Manual Setup (Without render.yaml)

1. **Push code to GitHub** (see above)

2. **Create new Web Service**:
   - Go to https://dashboard.render.com/
   - Click "New +" > "Web Service"
   - Connect your repository

3. **Configure Build Settings**:
   - **Name**: `prophetbet-ai`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or choose paid plan)

4. **Add Environment Variables** (see list above in Option 1)

5. **Advanced Settings**:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes (optional)

6. **Create Web Service**: Click the button to deploy

## Post-Deployment Steps

### 1. Get Your Live URL

After deployment completes, Render will provide you with a URL like:
```
https://prophetbet-ai.onrender.com
```

### 2. Update VITE_FRONTEND_URL

Go back to your Render dashboard and update the environment variable:
- `VITE_FRONTEND_URL` = Your live Render URL

This will trigger a re-deploy.

### 3. Get Missing Supabase Anon Key

If you don't have your Supabase anon key:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `abglcmahihbmglkbolir`
3. Go to Settings > API
4. Copy the `anon` / `public` key
5. Add it to Render's environment variables as `VITE_SUPABASE_ANON_KEY`

### 4. Verify Deployment

Visit your live URL and check:
- [ ] App loads without errors
- [ ] You can see sports data
- [ ] Navigation works
- [ ] Health check endpoint works: `https://your-app.onrender.com/health`

## Important Notes

### Free Tier Limitations

Render's free tier:
- Your app will spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month of runtime
- Enough for testing and small projects

### Performance Optimization

To improve cold start times:
1. Consider upgrading to a paid plan ($7/month) for persistent instances
2. Use a service like UptimeRobot to ping your app every 14 minutes

### Auto-Deploy

Enable auto-deploy to automatically deploy when you push to your main branch:
1. Go to your service in Render Dashboard
2. Settings > Build & Deploy
3. Enable "Auto-Deploy"

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abglcmahihbmglkbolir.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public/anon key | Get from Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | From your .env file |
| `VITE_FRONTEND_URL` | Your app's URL | `https://prophetbet-ai.onrender.com` |

### Optional API Keys

| Variable | Description | Get Key From |
|----------|-------------|--------------|
| `ODDS_API_KEY` | Live odds data | https://the-odds-api.com/ |
| `ESPN_API_KEY` | ESPN sports data | ESPN Developer Portal |
| `RAPIDAPI_KEY` | Additional sports data | https://rapidapi.com/ |

### Feature Flags (Optional - defaults set in render.yaml)

All feature flags are already configured with sensible defaults in `render.yaml`:
- Sports: NFL, CFB, NBA, MLB, UFC, Golf (all enabled)
- Features: Live Odds, Props Analyzer, AI Learning, Alerts (all enabled)
- Analyzer version: v10000plus
- Min confidence: 60%

## Troubleshooting

### Build Fails

**Error**: Missing dependencies
- **Solution**: Make sure `package-lock.json` is committed to git

**Error**: Build timeout
- **Solution**: Free tier has 15-minute build timeout. Your app should build in ~2-5 minutes.

### App Won't Start

**Error**: Port binding issues
- **Solution**: The server.js already uses `process.env.PORT`, so this should work automatically

### Blank Page or 404 Errors

**Error**: Routes not working
- **Solution**: Server.js is already configured to handle SPA routing with the `*` route

### API Errors

**Error**: Supabase connection fails
- **Solution**: Double-check your `VITE_SUPABASE_ANON_KEY` is set correctly

## Support

For Render-specific issues:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

For ProphetBet AI issues:
- Check your local build first: `npm run build && npm start`
- Review Render logs in the dashboard

## Next Steps

After successful deployment:

1. Test all features thoroughly
2. Set up custom domain (optional, Render supports this)
3. Configure monitoring/alerts
4. Set up database backups in Supabase
5. Consider upgrading to paid tier if needed

---

Your app should now be live at: `https://your-app-name.onrender.com`
