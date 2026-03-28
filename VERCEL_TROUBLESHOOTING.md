# Vercel Deployment Troubleshooting Guide

## Step-by-Step Fix for Vercel Build Issues

### **STEP 1: Clear Vercel Build Cache**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **Student_Help_Tool**
3. Go to **Settings** → **Git** 
4. Look for **Build Cache** section
5. Click **Clear Build Cache**
6. Wait for confirmation

### **STEP 2: Verify Environment Variables Are Set**

1. In Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Ensure these are added:

| Variable Name | Value | Scope |
|---------------|-------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `VITE_GA_MEASUREMENT_ID` | `G-MY48Y5CKC6` | Production, Preview, Development |

**If missing:**
- Click **"Add New"**
- Enter variable name and value
- Select all three scopes (Production, Preview, Development)
- Click **Save**

### **STEP 3: Force a New Deployment**

**Option A: Using Vercel Dashboard (Recommended)**
1. Go to **Deployments** tab
2. Find the failed deployment
3. Click the **...** menu
4. Select **Redeploy**
5. Wait 2-3 minutes for build to complete

**Option B: Push a New Commit**
```bash
# Make a small change
echo "# Updated" >> README.md

# Commit and push
git add README.md
git commit -m "trigger: force Vercel redeploy"
git push origin main
```

### **STEP 4: Monitor the Build**

1. Go to **Deployments** in Vercel
2. Click on the latest deployment
3. Go to **Build Logs**
4. Watch the build process
5. Take note of any error messages

---

## Common Error Messages & Fixes

### **Error 1: "OPENAI_API_KEY not found" or Similar**

**Problem:** Environment variables not set in Vercel

**Fix:**
```
1. Vercel Dashboard → Settings → Environment Variables
2. Add OPENAI_API_KEY and VITE_GA_MEASUREMENT_ID
3. Redeploy
```

### **Error 2: "Cannot find module" or Import errors**

**Problem:** Dependencies not installed

**Fix:**
```bash
# Local check
npm ci
npm run build

# If works locally, trigger Vercel rebuild
# Go to Deployments → Redeploy
```

### **Error 3: "Build failed: npm run build exited with code 1"**

**Problem:** Build script failing

**Fix:**
```bash
# Test locally first
npm ci
npm run lint
npm run build

# If successful locally, Vercel should work
# Try clearing cache and redeploying
```

### **Error 4: "Deployment completed but features don't work"**

**Problem:** Runtime issues, usually missing environment variables

**Fix:**
1. Check browser console for errors
2. Go to Vercel → Logs → Runtime Logs
3. Look for API key errors
4. Add/verify environment variables
5. Redeploy

---

## Complete Verification Checklist

### ✅ Local Setup
- [ ] Run `npm ci` successfully
- [ ] Run `npm run build` successfully (creates dist folder)
- [ ] Run `npm run preview` and test features locally
- [ ] No console errors in browser

### ✅ GitHub
- [ ] All code committed: `git status` shows clean
- [ ] Latest commit pushed: `git push origin main`
- [ ] vercel.json is DELETED (no longer in repo)
- [ ] package.json has correct build scripts

### ✅ Vercel Settings
- [ ] Project connected to GitHub
- [ ] Main branch is deployment source
- [ ] Build cache cleared
- [ ] Environment variables set:
  - [ ] OPENAI_API_KEY
  - [ ] VITE_GA_MEASUREMENT_ID
- [ ] Framework: auto-detected as Vite

### ✅ Deployment
- [ ] Latest deployment shows ✅
- [ ] View deployment log shows no errors
- [ ] Click "Visit" link to test
- [ ] Test key features work:
  - [ ] Homepage loads
  - [ ] Navigate to /ai/cover-letter
  - [ ] Try to generate cover letter
  - [ ] Check browser console for errors

---

## Detailed Setup Instructions

### 1️⃣ First Time Setup

```bash
# Clone/navigate to project
cd Student_Help_Tool

# Install dependencies
npm ci

# Verify build works locally
npm run build

# Check the dist folder was created
ls dist

# Test preview locally
npm run preview
# Visit http://localhost:4173
```

### 2️⃣ Connect to Vercel

```bash
# Option A: Using Dashboard (Recommended)
# 1. Go to vercel.com
# 2. Sign in with GitHub
# 3. Click "Add New Project"
# 4. Select Student_Help_Tool repository
# 5. Click Import
# 6. In settings, add environment variables
# 7. Click Deploy

# Option B: Using Vercel CLI
npm install -g vercel
vercel
# Follow prompts
```

### 3️⃣ Add Environment Variables

**In Vercel Dashboard:**
1. Your Project → Settings
2. Environment Variables
3. Add these one by one:

**OPENAI_API_KEY:**
- Name: `OPENAI_API_KEY`
- Value: `sk-proj-...` (full key from OpenAI)
- Environments: ✓ Production, ✓ Preview, ✓ Development
- Save

**VITE_GA_MEASUREMENT_ID:**
- Name: `VITE_GA_MEASUREMENT_ID`
- Value: `G-MY48Y5CKC6`
- Environments: ✓ Production, ✓ Preview, ✓ Development
- Save

### 4️⃣ Deploy

1. Go to Deployments
2. Click "Redeploy" on latest commit
3. Watch build logs
4. Wait for ✅ Success
5. Click "Visit" to see live site

---

## If Still Getting Errors - Debug Mode

### Check Build Logs in Detail

**In Vercel:**
1. Deployments → Failed Deployment
2. Click **"Build Logs"** tab
3. Look for first error message
4. Copy the error text

### Local Reproduction

If you see an error in build logs:

```bash
# Set same environment variables locally
export OPENAI_API_KEY="your-key"
export VITE_GA_MEASUREMENT_ID="G-MY48Y5CKC6"

# Try building
npm ci
npm run build

# See if you get same error
```

### Common Solutions

| Error Pattern | Solution |
|---------------|----------|
| `Cannot find module` | Run `npm ci` locally |
| `API key not found` | Add env var to Vercel |
| `Build completed but doesn't work` | Check browser console |
| `Timeout during build` | Increase build time limit |
| `Port already in use` | Clear cache & redeploy |

---

## If Nothing Works - Nuclear Option

### Reset Everything

```bash
# 1. Delete Vercel project
# Go to Vercel → Project Settings → Danger Zone → Delete Project

# 2. Clear local cache
npx cache clean --force
rm -r node_modules
rm package-lock.json

# 3. Reinstall fresh
npm ci

# 4. Test build locally
npm run build
npm run preview

# 5. Create new Vercel project
# Go to vercel.com
# Import repository fresh
# Add environment variables
# Deploy
```

---

## Vercel Build System Explained

```
Timeline of Build:
1. 0s      - GitHub webhook triggers Vercel
2. 5s      - Clone repository
3. 10s     - Install dependencies (npm ci)
4. 30s     - Set environment variables
5. 35s     - Run build script (npm run build)
6. 90s     - Optimize assets
7. 100s    - Deploy to edge network
8. 105s    - Ready at vercel.app URL
```

**If stuck at any step, check:**
- Logs for that specific step
- Environment variables
- Build cache

---

## Testing After Deployment

### Local Test (Before Deploying)
```bash
npm run build
npm run preview
# Visit http://localhost:4173
# Test all features
```

### Test After Vercel Deploy
1. Visit `https://[project].vercel.app`
2. Check these pages:
   - Home page loads
   - Image compression works
   - Cover letter generator loads
   - Can enter data in form
3. Open browser DevTools (F12)
4. Check Console tab - should have NO red errors
5. Check Network tab - all requests should be green

---

## Support & Resources

### Get Help
1. **Check Vercel Logs:**
   - Deployments → Failed Deploy → Build Logs
   
2. **Check Browser Console:**
   - F12 → Console tab
   - Red errors = front-end issues
   
3. **Test Locally:**
   - `npm ci && npm run build && npm run preview`
   - If works locally, issue is in Vercel config

4. **Clear & Retry:**
   - Clear build cache
   - Clear browser cache (Hard Refresh: Ctrl+Shift+R)
   - Redeploy

---

## Quick Reference URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your GitHub Repo:** https://github.com/sanju0107/Student_Help_Tool
- **Project Settings:** https://vercel.com/dashboard/[project-name]/settings
- **Environment Variables:** https://vercel.com/dashboard/[project-name]/settings/environment-variables
- **Deployments:** https://vercel.com/dashboard/[project-name]/deployments

---

## Final Checklist Before Contacting Support

- [ ] Tried clearing Vercel build cache
- [ ] Added both environment variables to Vercel
- [ ] Verified environment variables are visible in settings
- [ ] Clicked Redeploy and waited 2-3 minutes
- [ ] Checked build logs for error messages
- [ ] Tested `npm run build` locally - works fine
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Tried from incognito/private window

If all above done and still issues:
1. Note the exact error from Vercel logs
2. Take screenshot
3. Share with support

---

**Last Updated:** March 28, 2026  
**Status:** Comprehensive Troubleshooting Guide  
**Priority:** Solve deployment issues
