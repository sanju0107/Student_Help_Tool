# API Configuration Guide

## OpenAI API Key Setup

### Overview
The Student Help Tool includes AI-powered features that require an **OpenAI API key**:
- ✨ Resume Builder (AI summary generation)
- ✨ Cover Letter AI (automated letter generation)

### What Happens Without an API Key?

**User Experience:**
- When accessing Resume Builder or Cover Letter AI pages, users see an amber warning:
  ```
  ⚠️ API Configuration Required
  OpenAI API Key Not Configured - AI features are disabled.
  Contact your administrator to enable AI-powered features.
  ```
- **All non-AI features continue working normally** (PDF tools, image tools, calculators, etc.)
- The warning is clear and non-blocking - users can still interact with non-AI parts of the tool

### How to Configure

#### 1️⃣ Local Development

**Step 1: Get OpenAI API Key**
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy the key (it starts with `sk-`)

**Step 2: Create `.env` file**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and replace:
OPENAI_API_KEY="sk-your-actual-key-here"
```

**Step 3: Restart Dev Server**
```bash
npm run dev
```

The warnings should disappear when you navigate to AI-powered pages.

#### 2️⃣ Vercel Deployment

**Step 1: Add Environment Variable**
1. Go to Vercel Dashboard → Your Project → Settings
2. Navigate to "Environment Variables"
3. Add new variable:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
   - **Environments:** Select all (Production, Preview, Development)

**Step 2: Redeploy**
```bash
git push  # Triggers automatic Vercel deployment
```

#### 3️⃣ Docker/Server Deployment

Pass the API key as an environment variable at runtime:

```bash
# Docker
docker run -e OPENAI_API_KEY="sk-..." your-app

# Kubernetes
kubectl set env deployment/your-app OPENAI_API_KEY="sk-..."

# Linux Server
export OPENAI_API_KEY="sk-..."
npm run build
npm run preview
```

### ✅ Verification Checklist

After setting up the API key:

- [ ] Navigate to Resume Builder page
- [ ] Navigate to Cover Letter AI page
- [ ] **No amber warning** should appear
- [ ] AI "Suggest" buttons should be functional
- [ ] Try generating an AI summary/cover letter
- [ ] Verify in browser console → no API key errors

### 🔒 Security Best Practices

1. **Never commit API keys** to version control
   - `.env` is in `.gitignore` - good!
   - Keep `.env.example` with placeholder values only

2. **Rotate keys regularly**
   - Delete old keys from OpenAI dashboard
   - Update all deployments with new key

3. **Use environment-specific keys**
   - Separate keys for dev/staging/production
   - Limit API key permissions in OpenAI dashboard

4. **Monitor API usage**
   - Check https://platform.openai.com/account/usage
   - Set usage limits to prevent surprise charges

### 🆘 Troubleshooting

**Problem:** Warning still shows after adding API key
- ✅ Restart dev server: `npm run dev`
- ✅ Check `.env` file has correct key format (starts with `sk-`)
- ✅ Verify key is not expired in OpenAI dashboard
- ✅ Clear browser cache and reload

**Problem:** API calls fail with "Invalid API Key"
- ✅ Verify key hasn't been regenerated in OpenAI dashboard
- ✅ Check key doesn't have leading/trailing whitespace
- ✅ Confirm OPENAI_API_KEY environment variable is set

**Problem:** Getting "Quota exceeded" errors
- ✅ Check usage in OpenAI dashboard
- ✅ Upgrade plan or wait for monthly reset
- ✅ Consider implementing usage limits

### 📊 Environment Variable Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `OPENAI_API_KEY` | Yes* | `sk-...` | *Only if AI features are needed |
| `VITE_GA_MEASUREMENT_ID` | No | `G-MY48Y5CKC6` | Google Analytics tracking |
| `APP_URL` | No | `https://careersuite.io` | For self-referential links |

### 📚 API Key Formats

**Valid API Key:**
- Starts with `sk-`
- Typically 48+ characters
- Example: `sk-proj-BPu7InvxQxK8ZqWvXdT7BlbkFJwkCQmD...`

**Invalid API Key:**
- Starts with anything other than `sk-`
- Shorter than 20 characters
- Contains spaces or special characters (except hyphens)

### 🔗 Links

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI API Keys Dashboard](https://platform.openai.com/api-keys)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated:** March 2026  
**API Version:** OpenAI GPT-4o-mini  
**Project:** Student Help Tool
