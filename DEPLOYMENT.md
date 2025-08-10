# AIWatch Deployment Guide

## 🚀 Deploy to Vercel

Follow these steps to deploy your AIWatch application to Vercel:

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Your repository pushed to GitHub

### Step 1: Push to GitHub

```bash
cd /Users/qaisermalik/Documents/aiwatch
git init
git add .
git commit -m "Initial AIWatch application setup"
git remote add origin https://github.com/iamqaisermalik/aiwatch.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "New Project"**
3. **Import your repository**: `https://github.com/iamqaisermalik/aiwatch`
4. **Configure Project Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Set Environment Variables

In your Vercel project dashboard, add these environment variables:

#### Required Variables:
```
ANTHROPIC_API_KEY=your_claude_api_key_from_anthropic_console
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_random_jwt_secret_key
NODE_ENV=production
```

> **Note**: You'll need to get these values from your Anthropic and Supabase accounts and add them in Vercel's environment variables section.

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-vercel-app-name.vercel.app
NEXT_PUBLIC_WS_URL=wss://your-vercel-app-name.vercel.app
```

### Step 4: Deploy

1. **Click "Deploy"** - Vercel will automatically build and deploy your app
2. **Wait for deployment** to complete (usually 2-3 minutes)
3. **Your app will be live** at `https://your-project-name.vercel.app`

### Step 5: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test the chat interface**: You should see the floating chat box at the bottom center
3. **Try sending a message**: It should respond with a demo message
4. **Check the browser console** for any errors

## 📱 Browser Extension Testing

The browser extension files are in the `/browser-extension` directory. To test:

1. **Open Chrome/Edge** → Go to Extensions → Enable Developer Mode
2. **Load unpacked extension** → Select the `browser-extension` folder
3. **Visit any website** → You should see the AIWatch floating chat

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**: 
   - Check that all dependencies are installed
   - Verify environment variables are set correctly

2. **Chat Not Working**:
   - Check browser console for CORS errors
   - Verify API endpoints are accessible

3. **Styling Issues**:
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting styles

### Production Notes:

- **Python AI Service**: Currently not deployed to Vercel (serverless functions have limitations)
- **WebSocket**: May need additional configuration for production WebSocket support
- **Database**: Using Supabase for production-ready database

## 🔄 Next Steps

After deployment, you can:

1. **Add real AI processing** by deploying the Python service separately (Railway, Render, etc.)
2. **Enable real-time WebSocket** connections
3. **Add user authentication** and personalization
4. **Improve the browser extension** with more context awareness

## 📞 Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test locally first with `npm run dev`
4. Check the GitHub repository for updates

Your AIWatch application should now be live and accessible via the Vercel URL!