# Deployment Guide - BookMyTime

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Email templates configured
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsiveness verified

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Prepare Repository

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BookMyTime MVP"
   ```

2. **Create GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (public or private)
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bookmytime.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your `bookmytime` repository
   - Vercel auto-detects Next.js

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables**:

   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   RESEND_API_KEY=re_your-api-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Important**: Update `NEXT_PUBLIC_APP_URL` after first deployment!

5. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes for build
   - Your app is live! 🎉

### Step 3: Post-Deployment Configuration

#### Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration

2. **Update Site URL**:
   ```
   https://your-app.vercel.app
   ```

3. **Add Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

4. **Email Templates** (if using custom domain):
   - Update all email links to use your domain
   - Test password reset and email verification

#### Update Vercel Environment Variable

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your actual URL:
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
3. Redeploy (Vercel → Deployments → ⋯ → Redeploy)

## 🌐 Add Custom Domain (Optional)

### Step 1: Purchase Domain

Purchase a domain from:
- Namecheap
- Google Domains
- GoDaddy
- Cloudflare (recommended for free DNS)

### Step 2: Add to Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `bookmytime.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5 mins - 24 hours)

### Step 3: Update All URLs

After domain is active:

**Vercel**:
- Update `NEXT_PUBLIC_APP_URL=https://bookmytime.com`

**Supabase**:
- Site URL: `https://bookmytime.com`
- Redirect URLs: `https://bookmytime.com/**`

**Resend** (if using custom email domain):
- Add and verify your domain
- Update email templates

## 📧 Configure Production Emails

### Option 1: Use Resend with Verified Domain

1. Resend Dashboard → Domains → Add Domain
2. Add your domain (e.g., `bookmytime.com`)
3. Add DNS records as instructed:
   - MX record
   - TXT records for DKIM
4. Wait for verification
5. Update email sender to: `noreply@bookmytime.com`

### Option 2: Use Resend Free Tier

- Sender: `onboarding@resend.dev`
- Limit: 100 emails/day, 1 email/second
- Good for testing, not production

## 🔒 Security Hardening

### Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's environment variable encryption
- ✅ Rotate keys if exposed
- ✅ Use different keys for staging/production

### Supabase Security

1. **Enable RLS on all tables** (already done in schema)
2. **Review RLS policies** for production
3. **Set up database backups**:
   - Supabase → Settings → Database → Enable Point-in-Time Recovery
4. **Configure rate limiting**:
   - Supabase → Settings → API → Rate Limiting

### Next.js Security

1. **Add security headers** in `next.config.js`:
   ```javascript
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
             {
               key: 'Referrer-Policy',
               value: 'origin-when-cross-origin',
             },
           ],
         },
       ];
     },
   };
   ```

2. **Enable HTTPS only** (Vercel does this automatically)

3. **Set up CSP** (Content Security Policy) if needed

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics (free tier available)
3. Monitor Core Web Vitals

### Supabase Monitoring

1. Supabase Dashboard → Reports
2. Monitor:
   - API requests
   - Database performance
   - Storage usage
   - Auth events

### Error Tracking

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Vercel Error Monitoring**

## 🔄 CI/CD Pipeline

Vercel provides automatic deployments:

- **Main branch**: Production deployment
- **Other branches**: Preview deployments
- **Pull requests**: Preview deployments

### Recommended Workflow

```
feature-branch → PR → Preview → Review → Merge → Production
```

## 🧪 Testing in Production

### Smoke Tests

After deployment, verify:

1. ✅ Home page loads
2. ✅ Sign up works
3. ✅ Login works
4. ✅ Email verification sent
5. ✅ Dashboard accessible
6. ✅ Availability can be set
7. ✅ Event types can be created
8. ✅ Public booking page works
9. ✅ Bookings can be created
10. ✅ Emails are sent

### Performance Tests

Use tools:
- **Lighthouse** (Chrome DevTools)
- **PageSpeed Insights** (Google)
- **WebPageTest**

Target metrics:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 📈 Optimization Tips

### Next.js Optimizations

1. **Enable Image Optimization**:
   - Use `next/image` for all images
   - Configure `remotePatterns` in next.config.js

2. **Use ISR** (Incremental Static Regeneration):
   - For public booking pages
   - Set revalidate time appropriately

3. **Bundle Size**:
   - Analyze with `npx @next/bundle-analyzer`
   - Remove unused dependencies
   - Use dynamic imports for large components

### Database Optimizations

1. **Indexes**: Already created in schema
2. **Query Optimization**: Use `.select()` wisely
3. **Connection Pooling**: Enabled by default in Supabase
4. **Caching**: Use SWR or React Query for client-side

## 🆘 Troubleshooting Deployment Issues

### Build Fails

**Error**: "Module not found"
- Solution: Ensure all dependencies in `package.json`
- Run `npm install` locally to verify

**Error**: "TypeScript errors"
- Solution: Fix all TypeScript errors locally first
- Run `npm run build` locally to test

### Runtime Errors

**Error**: "Cannot connect to Supabase"
- Check environment variables in Vercel
- Verify Supabase URL and keys
- Check Supabase project status

**Error**: "Emails not sending"
- Verify Resend API key
- Check Resend account limits
- Review Resend logs

### Performance Issues

**Slow page loads**
- Enable edge caching
- Optimize images
- Reduce JavaScript bundle size
- Use ISR where possible

## 📝 Rollback Plan

If deployment causes issues:

1. **Vercel Dashboard** → Deployments
2. Find last working deployment
3. Click ⋯ → Promote to Production
4. Verify rollback successful

## 🎉 Post-Launch

After successful deployment:

1. **Monitor for 24 hours**:
   - Check error logs
   - Monitor performance
   - Watch for user issues

2. **Gather feedback**:
   - Test with real users
   - Collect feature requests
   - Document bugs

3. **Plan iterations**:
   - Prioritize fixes
   - Schedule updates
   - Continue development

## 📞 Support

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Docs**: https://nextjs.org/docs

---

**Congratulations on deploying BookMyTime!** 🚀

Your scheduling application is now live and ready to help users book appointments effortlessly.
