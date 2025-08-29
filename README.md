# NoteTaker - Full-Stack Note-Taking Application

A comprehensive note-taking application built with Next.js, TypeScript, and modern web technologies. Features include user authentication with email/OTP verification, Google OAuth integration, advanced note management with search and filtering, and a responsive design.

## Features

### Authentication
- **Email/OTP Signup**: Secure account creation with email verification
- **Google OAuth**: Quick login with Google accounts
- **JWT Authorization**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: Protection against brute force attacks
- **Password Security**: Strong password requirements and bcrypt hashing

### Note Management
- **CRUD Operations**: Create, read, update, and delete notes
- **Advanced Search**: Search by title, content, or tags
- **Categories**: Organize notes with predefined categories
- **Tags**: Add custom tags for better organization
- **Sorting**: Sort by creation date, update date, or title
- **Rich Viewing**: Modal view for detailed note reading

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Real-time Feedback**: Success and error messages
- **Loading States**: Visual feedback during operations
- **Auto-save**: Automatic token refresh and session management
- **Clean UI**: Modern design with Tailwind CSS and shadcn/ui

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with TypeScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Beautiful icons

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **File-based Storage**: JSON files for development (easily replaceable)

### Security
- **Rate Limiting**: Prevents abuse and brute force attacks
- **Token Blacklisting**: Secure logout functionality
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Secure cross-origin requests

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   \`\`\`bash
   git clone <repository-url>
   cd note-taking-app
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   \`\`\`env
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
   \`\`\`

4. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Getting Started
1. **Sign Up**: Create an account with your email and a strong password
2. **Verify Email**: Enter the 6-digit OTP sent to your email (check console in development)
3. **Start Creating**: Begin adding your notes with titles, content, categories, and tags

### Note Management
- **Create Notes**: Use the form at the top to add new notes
- **Edit Notes**: Click the edit icon on any note card
- **View Notes**: Click the eye icon for a detailed view
- **Delete Notes**: Click the trash icon to remove notes
- **Search**: Use the search bar to find notes by content or tags
- **Filter**: Select categories to filter your notes
- **Sort**: Choose how to sort your notes (date, title, etc.)

### Authentication Features
- **Google Login**: Quick access with your Google account
- **Secure Sessions**: Automatic token refresh keeps you logged in
- **Safe Logout**: Tokens are properly invalidated on logout

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Secure logout
- `GET /api/auth/me` - Get current user info

### Notes
- `GET /api/notes` - Get user notes (with search/filter params)
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   ├── verify-otp/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── google/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   └── notes/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── auth-forms.tsx
│   │   └── otp-form.tsx
│   ├── dashboard/
│   │   └── user-header.tsx
│   ├── notes/
│   │   ├── note-form.tsx
│   │   ├── note-card.tsx
│   │   ├── notes-grid.tsx
│   │   ├── notes-filters.tsx
│   │   └── note-view-modal.tsx
│   └── ui/
│       └── [shadcn components]
├── hooks/
│   └── use-auth.ts
├── lib/
│   └── auth-utils.ts
├── data/ (created at runtime)
│   ├── users.json
│   ├── notes.json
│   ├── otps.json
│   └── token-blacklist.json
└── README.md
\`\`\`

## Development Notes

### OTP System
In development, OTP codes are logged to the console. In production, integrate with an email service like:
- SendGrid
- AWS SES
- Nodemailer with SMTP

### Database Migration
The current file-based storage is perfect for development. For production, consider:
- **PostgreSQL** with Prisma ORM
- **MongoDB** with Mongoose
- **Supabase** for managed PostgreSQL
- **PlanetScale** for serverless MySQL

### Google OAuth Setup
To enable Google OAuth:
1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Update the Google login component with real OAuth flow

## Security Considerations

### Production Checklist
- [ ] Set strong, unique JWT secrets
- [ ] Enable HTTPS in production
- [ ] Implement proper CORS policies
- [ ] Add request size limits
- [ ] Set up proper logging and monitoring
- [ ] Use environment-specific configurations
- [ ] Implement database connection pooling
- [ ] Add input sanitization for XSS prevention
- [ ] Set up rate limiting per user/IP
- [ ] Implement proper error handling without information leakage

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens are blacklisted on logout
- Automatic token refresh on expiration

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Full-stack deployment with serverless functions
- **Railway**: Simple deployment with database options
- **DigitalOcean App Platform**: Managed deployment
- **AWS**: EC2 or Lambda with RDS

### Environment Variables for Production
\`\`\`env
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-production-refresh-secret-minimum-32-characters
DATABASE_URL=your-production-database-url
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
EMAIL_SERVICE_API_KEY=your-email-service-api-key
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
