# BookMyTime - Complete Setup Guide

This guide will walk you through setting up the BookMyTime scheduling application from scratch.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git (for version control)
- ✅ A code editor (VS Code recommended)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier works fine)
3. Click "New Project"
4. Fill in the details:
   - Name: `bookmytime` (or your preferred name)
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
5. Click "Create new project" and wait ~2 minutes for setup

### 1.2 Get API Credentials

1. In your Supabase project dashboard, click on the ⚙️ "Settings" icon in the sidebar
2. Go to "API" section
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### 1.3 Run Database Schema

1. In Supabase dashboard, click "SQL Editor" in the sidebar
2. Click "New query"
3. Open the file `supabase/schema.sql` from this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

This creates all tables, indexes, Row Level Security policies, and functions needed for the app.

## Step 2: Resend Email Service Setup

### 2.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2.2 Get API Key

1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name it "BookMyTime" or similar
4. Copy the API key (you won't be able to see it again!)

### 2.3 Add Domain (Optional but Recommended)

For production, you should add your own domain:
1. In Resend, go to "Domains"
2. Click "Add Domain"
3. Follow instructions to add DNS records
4. Wait for verification (usually 5-30 minutes)

For development/testing, you can use the default `onboarding@resend.dev` sender.

## Step 3: Environment Configuration

### 3.1 Create Environment File

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   (On Mac/Linux use `cp` instead of `copy`)

2. Open `.env.local` in your editor

3. Fill in your credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Resend Email Service
   RESEND_API_KEY=re_your_api_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3.2 Verify Environment Variables

Make sure:
- No quotes around the values
- No trailing spaces
- The Supabase URL starts with `https://`
- The file is named exactly `.env.local` (not `.env.local.txt`)

## Step 4: Install Dependencies

1. Open terminal in the project root
2. Run:
   ```bash
   npm install
   ```
3. Wait for all packages to install (~1-2 minutes)

## Step 5: Start Development Server

1. Run the development server:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in Xs
   ```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

4. You should see the BookMyTime welcome page!

## Step 6: Configure Supabase Auth

### 6.1 Enable Email Provider

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Ensure "Email" provider is enabled
3. Configure email settings:
   - Enable "Confirm email"
   - Set "Site URL" to `http://localhost:3000` (for dev)
   - Set "Redirect URLs" to include:
     - `http://localhost:3000/**`
     - Your production URL when ready

### 6.2 Customize Email Templates (Optional)

1. Go to "Authentication" → "Email Templates"
2. You can customize the templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

## Step 7: Test the Application

### 7.1 Create Your First User

1. Navigate to the signup page
2. Enter your details:
   - Full name
   - Email address
   - Password (min 8 characters)
3. Click "Sign Up"
4. Check your email for confirmation (if enabled)
5. Confirm your email and log in

### 7.2 Set Up Your Availability

1. After logging in, go to "Availability" settings
2. Click "Add Availability"
3. Select days and time ranges when you're available
4. Save your availability

### 7.3 Create an Event Type

1. Go to "Event Types"
2. Click "Create Event Type"
3. Fill in:
   - Name (e.g., "30-Minute Meeting")
   - Duration (in minutes)
   - Description
   - Location/Meeting link
4. Save the event type

### 7.4 Test Booking Flow

1. Copy your booking link
2. Open it in an incognito/private window
3. Try to book a meeting with yourself
4. Check that you receive a confirmation email

## Step 8: Deploy to Production (When Ready)

### 8.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bookmytime.git
git push -u origin main
```

### 8.2 Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/Log in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables (same as `.env.local`)
7. Click "Deploy"

### 8.3 Update Supabase Settings

1. In Supabase → Authentication → URL Configuration:
   - Update Site URL to your Vercel URL: `https://your-app.vercel.app`
   - Add to Redirect URLs: `https://your-app.vercel.app/**`

2. Update your production `.env` variables:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

### 8.4 Configure Custom Domain (Optional)

1. In Vercel, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update Supabase URLs to use your custom domain

## Troubleshooting

### Issue: "Database error" when signing up

**Solution:**
- Verify the database schema was run successfully in Supabase
- Check the Supabase logs in Dashboard → Database → Logs
- Ensure RLS policies are enabled

### Issue: "Cannot connect to Supabase"

**Solution:**
- Double-check your `.env.local` file
- Verify the Supabase URL and anon key are correct
- Restart the development server after changing environment variables

### Issue: Emails not sending

**Solution:**
- Check your Resend API key is correct
- Verify your Resend account is verified
- Check Resend dashboard → Logs for error messages
- For production, ensure your domain is verified

### Issue: TypeScript errors

**Solution:**
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall
- Restart your IDE/editor

### Issue: "Module not found" errors

**Solution:**
- Ensure all packages are installed: `npm install`
- Check that path aliases in `tsconfig.json` are correct
- Try clearing Next.js cache: `rm -rf .next` (or `rmdir .next` on Windows)

## Next Steps

Now that your application is set up, you can:

1. **Customize the UI**: Modify components in `src/components`
2. **Add Features**: Implement additional functionality from the design document
3. **Configure Branding**: Update colors, fonts, and logos
4. **Set Up Analytics**: Add Vercel Analytics or Google Analytics
5. **Optimize Performance**: Enable ISR, caching, and image optimization
6. **Add Tests**: Write unit and integration tests

## Support

If you encounter issues:
1. Check this guide for troubleshooting tips
2. Review the project README.md
3. Check the design document for specifications
4. Consult Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
5. Check Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)

## Useful Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database
# Run migrations in Supabase SQL Editor

# Deployment
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

Happy coding! 🚀
