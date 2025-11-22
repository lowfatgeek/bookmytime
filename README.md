# BookMyTime - Scheduling Made Simple

A micro SaaS booking and scheduling application similar to Calendly, built with Next.js 14, Supabase, and Shadcn UI.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **UI Components**: Shadcn UI (Radix UI + Tailwind CSS)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Features

- 🔐 User authentication (signup, login, password reset)
- 📅 Availability management with weekly schedule configuration
- ⏰ Timezone detection and conversion
- 📝 Event types with customizable duration and buffer times
- 🔗 Public booking pages for each user
- ✉️ Email notifications (confirmations, reminders, cancellations)
- 📊 Dashboard with upcoming and past bookings
- ↩️ Cancel and reschedule functionality
- 🌙 Dark mode support
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Resend account for email sending (free tier works)

### Setup Instructions

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project at [https://supabase.com](https://supabase.com)
   - Go to Project Settings → API
   - Copy your project URL and anon key
   - Run the database schema from `supabase/schema.sql` in the SQL Editor

4. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Add your Resend API key (get from [https://resend.com](https://resend.com))

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
bookmytime/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   ├── book/         # Public booking pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn UI components
│   │   └── ...           # Custom components
│   ├── lib/              # Utilities and helpers
│   │   ├── supabase/     # Supabase clients
│   │   └── utils.ts      # Utility functions
│   └── types/            # TypeScript type definitions
├── supabase/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `event_types` - Meeting types defined by users
- `availability` - Weekly availability schedules
- `bookings` - Scheduled appointments
- `notifications` - Email notification tracking

See `supabase/schema.sql` for the complete schema with Row Level Security policies.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically handle:
- HTTPS/SSL certificates
- Edge caching
- Serverless function deployment
- Preview deployments for pull requests

## Development Roadmap

- [x] Phase 1: Foundation and authentication
- [ ] Phase 2: Availability and event types management
- [ ] Phase 3: Public booking interface
- [ ] Phase 4: Notifications and dashboard
- [ ] Phase 5: Testing and deployment

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
