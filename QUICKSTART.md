# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup (2 minutes)

1. **Create `.env.local` file:**
   ```bash
   copy .env.example .env.local
   ```

2. **Add Supabase credentials** (get from https://supabase.com):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Add Resend API key** (get from https://resend.com):
   ```env
   RESEND_API_KEY=re_xxxxx
   ```

### Step 2: Database Setup (1 minute)

1. Go to your Supabase project → SQL Editor
2. Copy all content from `supabase/schema.sql`
3. Paste and run in SQL Editor
4. Verify success message appears

### Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 - you should see the welcome page!

### Step 4: Next Actions

**Option A: Follow the full setup guide**
- Read `SETUP_GUIDE.md` for detailed instructions
- Configure Supabase Auth settings
- Customize email templates

**Option B: Start coding immediately**
- Authentication pages are next: `src/app/(auth)/`
- Use existing UI components in `src/components/ui/`
- Reference type definitions in `src/types/database.ts`

## 📚 Key Files

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Complete setup instructions |
| `PROJECT_STATUS.md` | Current progress and next steps |
| `README.md` | Project overview |
| `supabase/schema.sql` | Database structure |
| `.env.example` | Environment variable template |

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint

# Deployment
vercel              # Deploy to Vercel
```

## 💡 Tips

- ✅ Hot reload is enabled - changes appear instantly
- ✅ TypeScript errors shown in terminal
- ✅ Tailwind CSS IntelliSense works in VS Code
- ✅ Use `cn()` utility for conditional classes

## 🆘 Troubleshooting

**Server won't start?**
- Check `.env.local` file exists
- Run `npm install` again
- Delete `.next` folder and restart

**Database errors?**
- Verify schema.sql was run successfully
- Check Supabase project is running
- Confirm credentials in `.env.local`

**TypeScript errors?**
- Restart your editor
- Run `npm install` again
- Check `tsconfig.json` paths

## 📖 Next Steps

1. Read `PROJECT_STATUS.md` for current progress
2. Follow `SETUP_GUIDE.md` for detailed configuration
3. Review design document in `.qoder/quests/`
4. Start building authentication pages!

Happy coding! 🎉
