# Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub:**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit: Full-stack note-taking app"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   \`\`\`

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy

3. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     - `JWT_SECRET`: A secure random string (e.g., generate with `openssl rand -base64 32`)
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (optional)
     - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (optional)

## Alternative Deployment Options

### Railway
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Netlify
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables in Netlify dashboard

### Self-hosted
1. Install Node.js 18+ on your server
2. Clone the repository
3. Run `npm install && npm run build`
4. Start with `npm start`
5. Set up reverse proxy (nginx/Apache) to serve on port 80/443

## Environment Variables Required

- `JWT_SECRET`: Secret key for JWT token signing
- `GOOGLE_CLIENT_ID`: (Optional) Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: (Optional) Google OAuth client secret

## Production Considerations

- The app currently uses in-memory storage for development
- For production, integrate with a real database (PostgreSQL, MongoDB, etc.)
- Set up proper logging and monitoring
- Configure CORS for your domain
- Set up SSL/TLS certificates
- Consider implementing rate limiting and additional security measures
