# AIWatch - Universal Web Assistant Architecture

## 🎯 Project Overview
A universal AI assistant that runs on any website, monitoring user activity and providing contextual guidance through an always-visible chat interface.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Browser Ext    │    │   React Frontend │    │  User Dashboard │
│  (Any Website)  │◄───┤   (Chat UI)      │◄───┤  (aiwatch.app)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Node.js API   │◄───┤   Python AI      │    │   Supabase DB   │
│   (Real-time)   │    │   (Processing)   │◄───┤   (Storage)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🧩 Components Breakdown

### 1. Browser Extension
**Purpose**: Universal web integration and context monitoring
- **Content Script**: Injected into every webpage
- **Background Script**: Cross-tab communication and data processing  
- **Popup**: Quick settings and status

**Key Features**:
- DOM monitoring and change detection
- Page content extraction
- User interaction tracking
- Chat interface injection
- Cross-origin communication

### 2. React Frontend
**Purpose**: Chat interface and user dashboard
- **Chat Component**: Always-visible bottom bar
- **Dashboard**: Analytics and settings
- **Real-time Updates**: WebSocket integration

**Tech Stack**:
- React 18 + TypeScript
- Tailwind CSS
- Socket.io-client
- React Query for state management

### 3. Python AI Backend
**Purpose**: AI processing and context analysis
- **Content Analysis**: Page understanding
- **Intent Recognition**: User query processing
- **Response Generation**: Contextual guidance
- **Learning**: User behavior patterns

**Tech Stack**:
- FastAPI + Python 3.11
- OpenAI/Anthropic API
- LangChain for AI orchestration
- Redis for caching
- Celery for background tasks

### 4. Node.js API Gateway
**Purpose**: Real-time communication and API coordination
- **WebSocket Server**: Real-time chat
- **API Gateway**: Route management
- **Authentication**: User sessions
- **Rate Limiting**: API protection

**Tech Stack**:
- Express.js + TypeScript
- Socket.io for WebSockets
- JWT authentication
- Redis for session storage

### 5. Supabase Database
**Purpose**: Data storage and real-time features
- **User Management**: Profiles and preferences
- **Context Storage**: Page data and interactions
- **Chat History**: Conversation logs
- **Analytics**: Usage patterns

**Schema Design**:
- `users` - User profiles and settings
- `sessions` - Browser sessions and active tabs
- `contexts` - Page content and user interactions
- `conversations` - Chat messages and responses
- `insights` - AI-generated user insights

## 🔄 Data Flow

### Context Monitoring Flow
1. **Browser Extension** monitors page changes
2. **Content extraction** happens in real-time
3. **Context data** sent to Python AI for analysis
4. **Insights stored** in Supabase for future reference

### Chat Interaction Flow
1. **User types** in chat interface
2. **Message sent** via WebSocket to Node.js API
3. **Context retrieved** from current page + history
4. **Python AI processes** query with full context
5. **Response generated** and sent back through WebSocket
6. **Chat updated** in real-time

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Docker & Docker Compose
- Supabase CLI
- Vercel CLI

### Local Development
```bash
# Frontend
cd frontend && npm install && npm run dev

# Node.js Backend  
cd backend/nodejs-api && npm install && npm run dev

# Python Backend
cd backend/python-ai && pip install -r requirements.txt && uvicorn main:app --reload

# Browser Extension
cd browser-extension && npm install && npm run build:dev
```

## 🚀 Deployment Strategy

### Frontend (Vercel)
- Automatic deployments from main branch
- Environment variables for API endpoints
- Custom domain: `app.aiwatch.com`

### Backend Services (Railway/Fly.io)
- **Python AI**: Containerized FastAPI service
- **Node.js API**: Real-time WebSocket server
- **Redis**: Managed Redis instance

### Database (Supabase)
- Managed PostgreSQL with real-time features
- Row Level Security (RLS) enabled
- API keys for different environments

### Browser Extension (Chrome/Firefox Stores)
- Production build with proper CSP
- Extension review and approval process
- Auto-updates for users

## 🔒 Security Considerations

### Privacy & Data Protection
- **Minimal data collection**: Only necessary context
- **Local processing**: Sensitive data stays on device when possible
- **Encryption**: All data encrypted in transit and at rest
- **User consent**: Clear permissions and opt-out options

### Content Security
- **CSP headers**: Prevent XSS attacks
- **Origin validation**: Verify legitimate requests
- **Rate limiting**: Prevent abuse
- **Authentication**: Secure user sessions

### Browser Extension Security
- **Minimal permissions**: Only required APIs
- **Content script isolation**: Separate from page scripts
- **Secure communication**: Encrypted message passing
- **Code obfuscation**: Protect intellectual property

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Response times**: API and AI processing speed
- **Error tracking**: Sentry integration
- **Uptime monitoring**: Service availability
- **User analytics**: Usage patterns and engagement

### AI Performance
- **Response quality**: User feedback scoring
- **Context accuracy**: How well AI understands pages
- **Learning effectiveness**: Improvement over time
- **Cost optimization**: API usage and expenses

## 🔧 Technology Stack Summary

| Component | Primary Tech | Supporting Tools |
|-----------|-------------|------------------|
| Frontend | React + TypeScript | Tailwind, Socket.io, React Query |
| Browser Ext | Vanilla JS/TS | Chrome/Firefox APIs, Webpack |
| Python AI | FastAPI + Python | OpenAI, LangChain, Celery, Redis |
| Node.js API | Express + TypeScript | Socket.io, JWT, Redis |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, RLS |
| Hosting | Vercel + Railway | Docker, CI/CD pipelines |
| Monitoring | Sentry + Custom | Analytics, logging, alerts |

## 🎯 Next Steps
1. Set up development environment
2. Create Supabase project and schema
3. Build basic browser extension
4. Implement chat interface
5. Set up AI processing pipeline
6. Test end-to-end functionality
7. Deploy and iterate