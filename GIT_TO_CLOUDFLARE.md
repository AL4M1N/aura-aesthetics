# Step-by-Step: Git to Cloudflare Pages Deployment

## Prerequisites ✓
- [ ] Git installed on your computer
- [ ] GitHub account (free)
- [ ] Cloudflare account (free)
- [ ] Project built successfully (`npm run build`)

---

## Step 1: Initialize Git Repository

Open your terminal in the project folder and run:

```bash
# Initialize Git repository
git init

# Check what files will be added
git status
```

You should see your project files listed (node_modules will be ignored by .gitignore).

---

## Step 2: Make Your First Commit

```bash
# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit - Aura Aesthetics website"
```

**Expected output:** Something like "XX files changed, XXXX insertions(+)"

---

## Step 3: Create GitHub Repository

### Option A: Via GitHub Website (Easier)

1. Go to https://github.com
2. Click the **"+" icon** (top right) → **"New repository"**
3. Repository name: `aura-aesthetics` (or your preferred name)
4. Description: `Luxury medical aesthetic clinic website`
5. Keep it **Public** (or Private if you prefer)
6. **DO NOT** initialize with README (we already have files)
7. Click **"Create repository"**

### Option B: Via GitHub CLI (Advanced)

```bash
# Install GitHub CLI first: https://cli.github.com
gh repo create aura-aesthetics --public --source=. --remote=origin
```

---

## Step 4: Connect Local Repository to GitHub

After creating the GitHub repository, you'll see instructions. Run these commands:

```bash
# Set your main branch
git branch -M main

# Add GitHub as remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aura-aesthetics.git

# Verify remote was added
git remote -v
```

**You should see:**
```
origin  https://github.com/YOUR_USERNAME/aura-aesthetics.git (fetch)
origin  https://github.com/YOUR_USERNAME/aura-aesthetics.git (push)
```

---

## Step 5: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin main
```

**First time?** You might need to authenticate:
- Enter your GitHub username
- Enter your **Personal Access Token** (not password)
  - Get token at: https://github.com/settings/tokens
  - Generate new token (classic)
  - Select `repo` scope
  - Copy the token and paste it

**Expected output:** 
```
Enumerating objects: XX, done.
Counting objects: 100%, done.
Writing objects: 100%, done.
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Step 6: Verify GitHub Upload

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/aura-aesthetics`
2. You should see all your files
3. Check that `node_modules/` is **NOT** there (ignored by .gitignore)
4. Verify `dist/` is **NOT** there (will be built on Cloudflare)

---

## Step 7: Sign Up for Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Click **"Sign up"** or **"Log in"**
3. Create a free account (you can use email or GitHub)
4. Verify your email if needed
5. You'll be taken to the Cloudflare Pages dashboard

---

## Step 8: Create New Project on Cloudflare Pages

1. Click **"Create a project"** button
2. Click **"Connect to Git"**
3. Choose **"GitHub"**
4. Click **"Connect GitHub"**

---

## Step 9: Authorize Cloudflare on GitHub

1. A GitHub authorization window will open
2. Click **"Authorize Cloudflare Pages"**
3. You might be asked to select which repositories to grant access:
   - Choose **"Only select repositories"**
   - Select **`aura-aesthetics`** (or your repo name)
   - Or choose **"All repositories"** if you prefer
4. Click **"Install & Authorize"**

---

## Step 10: Select Your Repository

Back in Cloudflare Pages:

1. You'll see a list of your GitHub repositories
2. Find and click on **`aura-aesthetics`**
3. Click **"Begin setup"**

---

## Step 11: Configure Build Settings

**Set up builds and deployments:**

### Project name:
```
aura-aesthetics
```
(This will be your URL: `aura-aesthetics.pages.dev`)

### Production branch:
```
main
```

### Framework preset:
```
None (or select "Vite" if available)
```

### Build command:
```
npm run build
```

### Build output directory:
```
dist
```

### Root directory (path):
```
/
```
(Leave empty or put `/`)

---

## Step 12: Add Environment Variables (Optional)

Click **"Add variable"** if you need to add environment variables:

**For now, you can skip this.** Add later if you connect to Laravel API.

Example for future:
- Variable name: `VITE_API_URL`
- Value: `https://api.yoursite.com`

---

## Step 13: Deploy!

1. Click **"Save and Deploy"**
2. Cloudflare will now:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your project (`npm run build`)
   - Deploy to global CDN

**This takes about 2-3 minutes.**

You'll see a build log showing the progress.

---

## Step 14: Watch the Build Process

You'll see output like:

```
Cloning repository...
Installing dependencies...
npm install
Building application...
npm run build
Deploying to Cloudflare Pages...
Success! Deployed to https://aura-aesthetics.pages.dev
```

---

## Step 15: Visit Your Live Site! 🎉

1. Once build completes, you'll see **"Success!"**
2. Your site URL will be: `https://aura-aesthetics.pages.dev`
3. Click the URL to visit your live site
4. Your website is now live globally on 275+ data centers!

---

## Step 16: Add Custom Domain (Optional)

Want to use your own domain like `aura-aesthetics.com`?

### In Cloudflare Pages:

1. Go to your project
2. Click **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter your domain: `aura-aesthetics.com`
5. Follow the DNS setup instructions

### You'll need to:
- Add a CNAME record pointing to your Cloudflare Pages URL
- Or transfer your domain to Cloudflare (easier)

---

## Step 17: Future Updates

Whenever you make changes:

```bash
# Make your changes to the code
# ...

# Check what changed
git status

# Add changes
git add .

# Commit with a message
git commit -m "Updated hero section slider"

# Push to GitHub
git push
```

**Cloudflare will automatically:**
- Detect the push
- Build your site
- Deploy in 2-3 minutes
- No manual steps needed! 🎉

---

## Complete Command Reference

### First Time Setup:
```bash
# 1. Initialize Git
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit"

# 4. Set branch name
git branch -M main

# 5. Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/aura-aesthetics.git

# 6. Push to GitHub
git push -u origin main
```

### Future Updates:
```bash
# 1. Check changes
git status

# 2. Add changes
git add .

# 3. Commit with message
git commit -m "Your update message here"

# 4. Push to GitHub (auto-deploys to Cloudflare)
git push
```

---

## Troubleshooting

### Error: "git: command not found"
**Solution:** Install Git from https://git-scm.com/downloads

### Error: "remote origin already exists"
**Solution:** 
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/aura-aesthetics.git
```

### Error: "failed to push some refs"
**Solution:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Build fails on Cloudflare with "npm not found"
**Solution:** 
- Ensure `package.json` is in the root directory
- Check build command is `npm run build`
- Check output directory is `dist`

### Site loads but shows blank page
**Solution:**
1. Check browser console for errors (F12)
2. Verify `dist/` folder was created in build
3. Check if base URL is set correctly in `vite.config.ts`

### Images not loading
**Solution:**
1. Make sure images are in `/public/` folder
2. Use `/image.jpg` not `./image.jpg` in src
3. Check image URLs in browser network tab

---

## Your URLs

After deployment, you'll have:

- **Cloudflare Pages URL:** `https://aura-aesthetics.pages.dev`
- **GitHub Repository:** `https://github.com/YOUR_USERNAME/aura-aesthetics`
- **Build Logs:** Available in Cloudflare Pages dashboard

---

## Performance Check

After deployment, test your site:

### 1. Google PageSpeed Insights
- Go to: https://pagespeed.web.dev/
- Enter your URL: `https://aura-aesthetics.pages.dev`
- Run test
- **Target:** 90+ performance score

### 2. Check Load Time
- Open your site
- Press F12 → Network tab
- Refresh page
- Check "Load" time (should be under 2s)

---

## Next Steps

✅ Site is live on Cloudflare Pages  
✅ Auto-deploys on every Git push  
✅ Global CDN (fast worldwide)  
✅ Free SSL certificate  
✅ Unlimited bandwidth  

**Now you can:**
1. Replace placeholder images with real photos
2. Update text content
3. Add custom domain
4. Connect to Laravel API (when ready)
5. Add Google Analytics
6. Setup contact form backend

---

## Need Help?

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Git Basics:** https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **GitHub Guides:** https://guides.github.com/

**Common Issues:**
- Forgot GitHub username/password → Use Personal Access Token
- Build fails → Check build logs in Cloudflare dashboard
- Site is blank → Check browser console (F12) for errors
- Images missing → Ensure they're in `/public/` folder

---

## Summary Checklist

- [ ] Created .gitignore file
- [ ] Initialized Git repository (`git init`)
- [ ] Made first commit (`git add .` + `git commit`)
- [ ] Created GitHub repository
- [ ] Pushed to GitHub (`git push`)
- [ ] Signed up for Cloudflare Pages
- [ ] Connected GitHub to Cloudflare
- [ ] Configured build settings
- [ ] Deployed successfully
- [ ] Visited live site
- [ ] Tested performance

🎉 **Congratulations! Your site is live!**
