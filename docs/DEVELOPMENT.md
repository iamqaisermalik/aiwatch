# AIWatch Development Guide

## 🎯 Project Overview

AIWatch is a universal web assistant that provides contextual AI guidance on any website through a browser extension and chat interface.

## 🏗️ Architecture Deep Dive

### Data Flow
```
Website → Extension → Node.js API → Python AI → Supabase
   ↓         ↓           ↓            ↓          ↓
Context   Monitor     Gateway     Process    Store
Extract   Changes    WebSocket     & ML      & Sync
```

### Component Responsibilities

**Browser Extension**
- 🔍 **Context Extraction**: DOM monitoring, content analysis, user interaction tracking
- 🎯 **UI Injection**: Chat interface, floating widgets, contextual hints
- 📡 **Communication**: Secure messaging with backend APIs

**React Frontend**  
- 💬 **Chat Interface**: Real-time messaging, rich content display
- 📊 **Dashboard**: Analytics, settings, conversation history
- 🔧 **Admin Panel**: System monitoring, user management

**Node.js API Gateway**
- 🌐 **WebSocket Server**: Real-time chat communication
- 🔐 **Authentication**: JWT tokens, session management
- 🚦 **Rate Limiting**: API protection, usage quotas
- 📨 **Message Routing**: Between extension, frontend, and AI

**Python AI Backend**
- 🧠 **Context Analysis**: Page understanding, intent recognition
- 💭 **Response Generation**: Contextual AI responses
- 📈 **Learning**: User behavior patterns, preference adaptation
- 🔄 **Background Processing**: Heavy computations, model training

**Supabase Database**
- 👤 **User Management**: Profiles, settings, subscriptions
- 📝 **Context Storage**: Page data, interaction history
- 💬 **Chat History**: Conversations, message threads
- 📊 **Analytics**: Usage patterns, performance metrics

## 🛠️ Development Setup

### 1. Prerequisites Installation

**Node.js 18+**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Python 3.11+**
```bash
# macOS
brew install python@3.11

# Ubuntu
sudo apt update && sudo apt install python3.11 python3.11-venv

# Windows
# Download from python.org
```

**Docker (Optional but Recommended)**
```bash
# macOS
brew install docker docker-compose

# Ubuntu  
sudo apt install docker.io docker-compose

# Windows
# Download Docker Desktop
```

### 2. Project Setup
```bash
# Clone and setup
git clone <your-repo-url> aiwatch
cd aiwatch

# Run automated setup
./setup.sh

# Or manual setup
npm install
npm run setup:all
```

### 3. Environment Configuration

Create `.env` from `.env.example` and configure:

```bash
# Supabase (Create project at supabase.com)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Redis (Local or managed)
REDIS_URL=redis://localhost:6379

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 4. Database Setup

1. **Create Supabase project**
   - Go to https://supabase.com
   - Create new project
   - Note the URL and API keys

2. **Run database schema**
   - Open Supabase SQL Editor
   - Paste contents of `database/schema.sql`
   - Execute to create tables and policies

3. **Configure authentication**
   - Enable email authentication
   - Set up OAuth providers (optional)
   - Configure email templates

### 5. Start Development

```bash
# Start all services (recommended)
npm run dev

# Or start individually:
npm run dev:frontend   # React app → localhost:3000
npm run dev:api       # Node.js API → localhost:8000
npm run dev:ai        # Python AI → localhost:8001
npm run dev:extension # Extension build watch

# With Docker (alternative)
docker-compose up -d
```

## 🔧 Component Development

### Frontend Development

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS

```bash
cd frontend

# Development
npm run dev

# Key files:
src/app/                 # Next.js app router
src/components/          # Reusable UI components
src/hooks/              # Custom React hooks
src/lib/                # Utilities and configurations
src/styles/             # Global styles and Tailwind config
```

**Key Features to Implement**:
- Real-time chat interface
- User authentication
- Dashboard with analytics
- Settings and preferences
- Responsive design

### Browser Extension Development

**Tech Stack**: TypeScript, Webpack, Chrome/Firefox APIs

```bash
cd browser-extension

# Development (watch mode)
npm run dev

# Production build
npm run build

# Key files:
src/content/            # Content scripts (injected)
src/background/         # Background/service worker
src/popup/              # Extension popup
src/shared/             # Shared utilities
manifest.json           # Extension manifest
```

**Architecture**:
```
Content Script ←→ Background Script ←→ Popup
      ↓               ↓                ↓
   Monitor DOM    Coordinate       Settings UI
   Inject Chat    API Calls        User Actions
   Extract Data   Cross-tab Sync   Status Display
```

**Key Features to Implement**:
- DOM monitoring and change detection
- Chat interface injection
- Content extraction (text, images, forms)
- User interaction tracking
- Cross-tab communication
- Settings management

### Node.js API Development

**Tech Stack**: Express, Socket.io, TypeScript, Redis

```bash
cd backend/nodejs-api

# Development
npm run dev

# Key files:
src/index.ts            # Main server setup
src/routes/             # API route handlers
src/middleware/         # Auth, validation, etc.
src/services/           # Business logic
src/utils/              # Helper functions
src/types/              # TypeScript definitions
```

**Key Features to Implement**:
- WebSocket server for real-time chat
- Authentication middleware
- API route handlers
- Rate limiting and security
- Redis integration for sessions/cache
- Communication with Python AI service

### Python AI Development

**Tech Stack**: FastAPI, OpenAI, LangChain, Celery

```bash
cd backend/python-ai

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Development
uvicorn main:app --reload --port 8001

# Key files:
main.py                 # FastAPI app
app/api/                # API endpoints
app/services/           # AI processing services
app/models/             # Data models
app/core/               # Configuration
app/utils/              # Helper functions
```

**Key Features to Implement**:
- Context analysis from webpage data
- Intent recognition from user queries
- AI response generation
- Content summarization
- User behavior analysis
- Background task processing

## 🧪 Testing Strategy

### Frontend Testing
```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Testing tools:
# - Jest for unit tests
# - React Testing Library
# - Playwright for E2E
```

### API Testing
```bash
cd backend/nodejs-api

# Unit and integration tests
npm test

# Testing tools:
# - Jest for unit tests
# - Supertest for API testing
# - Mock services for external APIs
```

### AI Testing
```bash
cd backend/python-ai

# Python tests
pytest

# Testing tools:
# - pytest for unit tests
# - httpx for async API testing
# - Mock AI responses for consistency
```

### Browser Extension Testing
```bash
cd browser-extension

# Build test version
npm run build:test

# Load in browser for manual testing
# Use Chrome DevTools for debugging
```

## 📦 Deployment

### Environment Setup

**Staging**:
- Vercel for frontend
- Railway/Fly.io for backend services
- Supabase staging database
- Test API keys

**Production**:
- Custom domain setup
- Production API keys
- Monitoring and alerting
- CDN configuration
- SSL certificates

### Frontend Deployment (Vercel)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables set in Vercel dashboard
```

### Backend Deployment (Docker)
```bash
# Build and push images
docker build -t aiwatch-api ./backend/nodejs-api
docker build -t aiwatch-ai ./backend/python-ai

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Browser Extension Deployment
```bash
# Build production version
npm run build:extension:prod

# Submit to Chrome Web Store
# - Zip the dist folder
# - Upload to Chrome Developer Console
# - Fill out store listing
# - Submit for review

# Firefox Add-ons
# - Create developer account
# - Submit .xpi file
# - Wait for approval
```

## 🔍 Monitoring & Debugging

### Logging
- **Frontend**: Console logs, Sentry error tracking
- **Backend**: Winston structured logging
- **AI**: Python logging with structured JSON
- **Extension**: Chrome DevTools, background script logs

### Performance Monitoring
```bash
# Monitor API response times
# Track WebSocket connection health  
# Monitor AI processing times
# Track browser extension performance
```

### Development Tools
- **React DevTools**: Component debugging
- **Redux DevTools**: State management (if using Redux)
- **Chrome Extension DevTools**: Extension debugging
- **Postman/Insomnia**: API testing
- **Supabase Dashboard**: Database monitoring

## 🚀 Best Practices

### Code Quality
```bash
# Linting and formatting
npm run lint          # All projects
npm run format        # Prettier formatting
npm run type-check    # TypeScript checking
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR for review
```

### Security
- Never commit API keys or secrets
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all user inputs
- Use HTTPS for all communications
- Follow OWASP security guidelines

### Performance
- Minimize extension content script impact
- Implement proper caching strategies
- Optimize AI response times
- Use CDN for static assets
- Monitor and optimize database queries

## 🆘 Troubleshooting

### Common Issues

**Extension not loading**:
- Check manifest.json syntax
- Verify file permissions
- Check Chrome developer mode is enabled

**WebSocket connection failed**:
- Verify Node.js server is running
- Check CORS configuration
- Confirm WebSocket URL in frontend

**AI responses slow**:
- Check OpenAI API key and limits
- Monitor Python service logs
- Verify Redis connection for caching

**Database connection issues**:
- Verify Supabase credentials
- Check network connectivity
- Confirm RLS policies are correct

### Debug Commands
```bash
# Check service health
curl http://localhost:8000/health
curl http://localhost:8001/health

# View logs
docker-compose logs -f nodejs-api
docker-compose logs -f python-ai

# Redis CLI
redis-cli ping

# Database connection test
npx supabase status
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Happy coding! 🚀** 

For questions or issues, check our [GitHub Issues](https://github.com/yourorg/aiwatch/issues) or join our [Discord community](https://discord.gg/aiwatch).