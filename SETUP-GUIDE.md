# Family Challenge — Setup Guide
## From download to live app, step by step

This guide assumes you've never set up a web app before. Every step is explained.

---

## What you're setting up

You have a folder called `family-challenge/` containing a complete Next.js web application.
To make it live, you need four things:

1. **GitHub** — stores your code (free)
2. **Supabase** — your database and login system (free)
3. **Vercel** — hosts your website (free)
4. **Node.js** — runs the code on your computer during development (free)

Total cost: **$0** to launch.

---

## Step 1: Install Node.js (5 minutes)

Node.js lets you run the app on your computer for testing.

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the big green button)
3. Run the installer — click Next through everything, defaults are fine
4. When done, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Type `node --version` and press Enter
6. You should see something like `v20.x.x` — that means it worked

---

## Step 2: Create a GitHub account (5 minutes)

GitHub stores your code and connects to Vercel for automatic deployments.

1. Go to **https://github.com**
2. Click **Sign up**
3. Create your account (free plan is fine)
4. Verify your email

---

## Step 3: Create a Supabase project (10 minutes)

Supabase is your database and handles user login.

1. Go to **https://supabase.com**
2. Click **Start your project** → sign in with GitHub
3. Click **New Project**
4. Choose your organization (it auto-creates one)
5. Enter:
   - **Project name:** `family-challenge`
   - **Database password:** Choose a strong password and SAVE IT somewhere
   - **Region:** Choose the closest to you (e.g., "West US" if you're in Idaho)
6. Click **Create new project** — wait 2-3 minutes for it to set up

### Set up the database tables

7. In your Supabase dashboard, click **SQL Editor** in the left sidebar
8. Click **New Query**
9. Open the file `supabase-setup.sql` from your project folder
10. Copy the ENTIRE contents and paste it into the SQL Editor
11. Click **Run** (the green play button)
12. You should see "Success" — this created all your tables

### Get your API keys

13. In Supabase, go to **Settings** → **API** (in the left sidebar under Configuration)
14. You'll see two important values:
    - **Project URL** — looks like `https://abc123xyz.supabase.co`
    - **anon public key** — a long string starting with `eyJ...`
15. Copy both — you'll need them in Step 5

### Enable Google login (optional but recommended)

16. In Supabase, go to **Authentication** → **Providers**
17. Find **Google** and click to expand
18. Toggle it **ON**
19. You'll need to set up Google OAuth credentials:
    - Go to **https://console.cloud.google.com**
    - Create a project → go to **APIs & Services** → **Credentials**
    - Click **Create Credentials** → **OAuth 2.0 Client ID**
    - Set **Authorized redirect URI** to: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
    - Copy the Client ID and Client Secret back into Supabase
20. Click **Save**

---

## Step 4: Set up the project on your computer (10 minutes)

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)

2. Navigate to where you saved the `family-challenge` folder:
   ```
   cd ~/Downloads/family-challenge
   ```
   (adjust the path to wherever you put it)

3. Install dependencies:
   ```
   npm install
   ```
   Wait for it to finish (may take 1-2 minutes).

4. Create your environment file:
   ```
   cp .env.local.example .env.local
   ```

5. Open `.env.local` in any text editor (TextEdit on Mac, Notepad on Windows)

6. Replace the placeholder values with your real Supabase keys from Step 3:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

7. Save the file

8. Start the development server:
   ```
   npm run dev
   ```

9. Open your browser and go to **http://localhost:3000**

10. You should see the Family Challenge landing page!

### Test it locally

11. Click **Create your family** and sign up with your email
12. You should be able to create a family and see the dashboard
13. Note your invite code
14. Open an incognito/private window and go to `http://localhost:3000/join`
15. Enter the invite code to test the join flow

---

## Step 5: Push to GitHub (10 minutes)

1. Install Git if you don't have it:
   - Mac: It's usually pre-installed. Type `git --version` to check.
   - Windows: Download from **https://git-scm.com**

2. In your terminal (still in the `family-challenge` folder):
   ```
   git init
   git add .
   git commit -m "Initial commit - Family Challenge app"
   ```

3. Go to **https://github.com** and click the **+** icon → **New repository**

4. Name it `family-challenge`, keep it **Private**, and click **Create repository**

5. GitHub will show you commands. Run the ones under "push an existing repository":
   ```
   git remote add origin https://github.com/YOUR-USERNAME/family-challenge.git
   git branch -M main
   git push -u origin main
   ```

6. Refresh the GitHub page — you should see your files

---

## Step 6: Deploy to Vercel (5 minutes)

This makes your app live on the internet.

1. Go to **https://vercel.com**
2. Click **Sign Up** → **Continue with GitHub**
3. Click **Add New Project**
4. It will show your GitHub repos — select **family-challenge**
5. Vercel auto-detects it's a Next.js project

6. **IMPORTANT:** Before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key

7. Click **Deploy**
8. Wait 1-2 minutes — Vercel builds and deploys your app
9. When done, you get a URL like `family-challenge-abc123.vercel.app`
10. Click it — your app is LIVE on the internet!

### Update Supabase redirect URLs

11. Go back to your Supabase dashboard → **Authentication** → **URL Configuration**
12. Set **Site URL** to your Vercel URL: `https://family-challenge-abc123.vercel.app`
13. Add to **Redirect URLs**: `https://family-challenge-abc123.vercel.app/auth/callback`

---

## Step 7: Custom domain (optional, $12/year)

1. Buy a domain at **https://namecheap.com** (e.g., `familychallenge.app`)
2. In Vercel, go to your project → **Settings** → **Domains**
3. Add your custom domain
4. Vercel will give you DNS records to add at Namecheap
5. Follow their instructions — usually takes 10-30 minutes to propagate
6. Update your Supabase Site URL and Redirect URLs to use the custom domain

---

## Step 8: Invite your family! 🎉

1. Go to your live site
2. Sign up and create your family
3. Share the invite code with your wife and kids
4. Each person visits the site and clicks "Join with invite code"
5. Start creating challenges!

---

## Making changes

Whenever you want to update the app:

1. Make changes to the files on your computer
2. Test locally with `npm run dev`
3. When happy, push to GitHub:
   ```
   git add .
   git commit -m "Description of what you changed"
   git push
   ```
4. Vercel automatically detects the push and redeploys (takes ~1 minute)

---

## Using AI to build more features

As a non-developer, your best tool is **Claude Code**:

1. Install it: `npm install -g @anthropic-ai/claude-code`
2. Navigate to your project: `cd family-challenge`
3. Run: `claude`
4. Tell it what you want, e.g.:
   - "Add a shoutout feature where users can send coins to other family members"
   - "Add push notifications when a challenge is completed"
   - "Make the rewards page look like the prototype"
5. It will read your code, make changes, and explain what it did

Other options: **Cursor** (cursor.sh) — a code editor with AI built in.

---

## Troubleshooting

**"npm command not found"**
→ Node.js isn't installed or your terminal needs to be restarted. Close and reopen Terminal.

**"Module not found" errors**
→ Run `npm install` again in the project folder.

**Can't sign up / login doesn't work**
→ Check that your `.env.local` has the correct Supabase URL and key. Also check the Supabase dashboard → Authentication → Users to see if the user was created.

**Page shows "Loading..." forever**
→ Your Supabase tables might not be set up. Go to Supabase → Table Editor and check if the `profiles` and `families` tables exist. If not, re-run the SQL setup.

**Google login redirects to wrong URL**
→ Update your Supabase redirect URLs (Authentication → URL Configuration) to match your Vercel domain.

**Changes aren't showing up on the live site**
→ Make sure you pushed to GitHub (`git push`). Check Vercel dashboard → Deployments to see if it's building.

---

## Project file overview

```
family-challenge/
├── supabase-setup.sql      ← Run this in Supabase SQL Editor (once)
├── .env.local.example       ← Copy to .env.local and add your keys
├── package.json             ← Dependencies list
├── next.config.js           ← Next.js settings
├── tailwind.config.js       ← Styling configuration
├── jsconfig.json            ← Path aliases (@/ = src/)
├── public/
│   └── manifest.json        ← PWA configuration
├── src/
│   ├── middleware.js         ← Auth protection (redirects to login)
│   ├── lib/
│   │   ├── supabase-browser.js  ← Database client (browser)
│   │   └── supabase-server.js   ← Database client (server)
│   ├── styles/
│   │   └── globals.css      ← Global styles
│   └── app/
│       ├── layout.js        ← Root HTML wrapper
│       ├── page.js          ← Landing page (/)
│       ├── login/page.js    ← Login screen
│       ├── signup/page.js   ← Create family flow
│       ├── join/page.js     ← Join with invite code
│       ├── auth/callback/route.js ← Google OAuth handler
│       └── dashboard/
│           ├── layout.js    ← Sidebar + mobile nav
│           ├── page.js      ← Home dashboard
│           ├── challenges/  ← Challenge list
│           ├── create/      ← Create challenge form
│           ├── feed/        ← Family activity feed
│           ├── rewards/     ← Reward shop
│           ├── analytics/   ← Family stats (parent only)
│           ├── profile/     ← User profile
│           └── settings/    ← App settings
```
