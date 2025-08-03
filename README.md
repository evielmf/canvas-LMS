# Canvas LMS Student Dashboard

A modern, full-stack web application that integrates with Canvas LMS to provide students with a comprehensive dashboard for managing their academic life.

![Canvas Dashboard](https://via.placeholder.com/800x400/0374B5/FFFFFF?text=Canvas+LMS+Dashboard)

## ✨ Features

### 🔐 Authentication & Security
- **Google OAuth**: Secure authentication via Supabase
- **Encrypted Token Storage**: Canvas API tokens are encrypted using AES encryption
- **Row Level Security**: Database access restricted to user's own data

### 📚 Canvas Integration
- **Automatic Data Sync**: Fetch assignments, grades, and course data from Canvas
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Secure Token Management**: Encrypted storage of Canvas API tokens

### 📊 Dashboard Features
- **Assignment Management**: View, filter, and track all assignments
- **Grade Tracking**: Visual charts and detailed grade analysis
- **Weekly Schedule**: Manual entry for class schedules with calendar view
- **Study Reminders**: Create and manage custom study reminders
- **Course Overview**: Complete course and grade statistics

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Tailwind CSS**: Modern, clean, and consistent design system
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and caching
- **Recharts**: Interactive charts and visualizations
- **Lucide React**: Beautiful icon library
- **React Hot Toast**: Elegant notifications

### Backend
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Row Level Security**: Database security policies
- **Real-time subscriptions**: Live data updates

### Security
- **CryptoJS**: AES encryption for sensitive data
- **Supabase Auth**: Secure OAuth implementation
- **Environment variables**: Secure configuration management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Canvas LMS instance with API access

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/canvas-lms-dashboard.git
cd canvas-lms-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the environment template and fill in your values:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Encryption Key (use a secure random string)
NEXT_PUBLIC_ENCRYPTION_KEY=your-secure-encryption-key-here
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Enable Google OAuth in Supabase Auth settings

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

```
canvas-lms-dashboard/
├── app/                          # Next.js App Router
│   ├── auth/callback/           # OAuth callback handler
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── assignments/         # Assignments page
│   │   ├── grades/             # Grades & progress page
│   │   ├── schedule/           # Weekly schedule page
│   │   └── settings/           # Settings page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing/auth page
│   └── providers.tsx           # Context providers
├── components/                  # React components
│   ├── assignments/            # Assignment-related components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   ├── grades/                 # Grade tracking components
│   ├── schedule/               # Schedule management
│   └── settings/               # Settings components
├── hooks/                      # Custom React hooks
│   └── useCanvasData.ts        # Canvas API data fetching
├── supabase/                   # Database schema
│   └── schema.sql              # Complete database setup
└── public/                     # Static assets
```

## 🎯 Key Components

### Dashboard Overview (`/dashboard`)
- Assignment statistics and upcoming deadlines
- Grade progress charts
- Quick access to all features
- Study reminders summary

### Assignments (`/dashboard/assignments`)
- Complete assignment list with filtering
- Search functionality
- Status tracking (upcoming, overdue, completed)
- Direct links to Canvas assignments

### Grades (`/dashboard/grades`)
- Visual grade analysis with charts
- Course-by-course breakdown
- Grade distribution statistics
- Recent grades timeline

### Schedule (`/dashboard/schedule`)
- Weekly calendar view
- Manual class schedule entry
- Color-coded events
- Today's schedule summary

### Settings (`/dashboard/settings`)
- Canvas integration management
- Account information
- Privacy and security details
- Token management

## 🔧 Canvas API Integration

### Required Canvas Permissions
To use this application, you need to generate a Canvas API token with access to:
- Course information
- Assignment data
- Submission details
- Grade information

### Getting Your Canvas API Token
1. Log into your Canvas account
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "New Access Token"
5. Enter "Student Dashboard" as the purpose
6. Copy the generated token

### Supported Canvas Endpoints
- `/api/v1/courses` - Course information
- `/api/v1/courses/{id}/assignments` - Assignment data
- `/api/v1/courses/{id}/assignments/{id}/submissions/self` - Submission status
- `/api/v1/courses/{id}/students/self/submissions` - Grade data

## 🛡 Security Features

### Data Protection
- **Encrypted Token Storage**: Canvas tokens are encrypted using AES before database storage
- **Row Level Security**: PostgreSQL RLS ensures users only access their own data
- **Secure Authentication**: OAuth 2.0 implementation via Supabase
- **Environment Variables**: Sensitive configuration kept in environment files

### Privacy
- No third-party data sharing
- Local data processing
- Minimal data collection (only Canvas academic data)
- Complete data deletion on account removal

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:
- `canvas_tokens` - Encrypted Canvas API tokens
- `study_reminders` - User-created study reminders
- `weekly_schedule` - Weekly class schedule entries
- `canvas_assignments_cache` - Cached Canvas assignment data
- `canvas_courses_cache` - Cached Canvas course data

All tables include Row Level Security policies for data protection.

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/canvas-lms-dashboard/issues) page
2. Create a new issue with detailed information
3. Include relevant logs and environment details

## 🎉 Acknowledgments

- Canvas LMS for providing comprehensive APIs
- Supabase for excellent backend services
- The open-source community for amazing tools and libraries

---

**Note**: This application is not officially affiliated with Instructure or Canvas LMS. It's an independent student project designed to enhance the Canvas learning experience.