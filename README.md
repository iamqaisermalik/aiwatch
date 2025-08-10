# AIWatch - Universal Web Assistant

🤖 An AI-powered assistant that runs on any website, monitoring your activity and providing contextual guidance through an always-visible chat interface.

## ✨ Features

- **Universal Integration**: Works on any website via browser extension
- **Contextual Understanding**: Monitors page content and user interactions
- **Real-time Guidance**: Instant AI responses based on current context
- **Privacy-First**: Minimal data collection with user control
- **Cross-Platform**: Chrome, Firefox, and other browsers

## 🏗️ Architecture

```
Browser Extension ↔ React Chat UI ↔ Node.js API ↔ Python AI ↔ Supabase DB
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Supabase account
- OpenAI API key

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd aiwatch
   npm install
   npm run setup:all
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your keys and URLs
   ```

3. **Database setup**
   - Create new Supabase project
   - Run `database/schema.sql` in Supabase SQL editor
   - Update `.env` with Supabase credentials

4. **Start development**
   ```bash
   # Start all services
   npm run dev

   # Or individually:
   npm run dev:frontend   # React app on :3000
   npm run dev:api       # Node.js API on :8000  
   npm run dev:ai        # Python AI on :8001
   npm run dev:extension # Browser extension
   ```

### Browser Extension Installation

1. Build extension: `npm run build:extension`
2. Open Chrome → Extensions → Developer mode
3. Click "Load unpacked" → Select `browser-extension/dist`
4. Pin extension and configure API endpoints

## 📁 Project Structure

```
aiwatch/
├── frontend/              # React chat interface
├── backend/
│   ├── nodejs-api/        # Express API gateway
│   └── python-ai/         # FastAPI AI processing
├── browser-extension/     # Chrome/Firefox extension
├── database/             # Supabase schema & migrations
└── docs/                 # Architecture & guides
```

## 🛠️ Development

### Frontend (React + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State**: Zustand + React Query
- **Real-time**: Socket.io client

### Backend Services

#### Node.js API (Express + TypeScript)
- **Purpose**: API gateway and real-time communication
- **Features**: Authentication, WebSockets, rate limiting
- **Port**: 8000

#### Python AI (FastAPI + Python)
- **Purpose**: AI processing and context analysis
- **Features**: OpenAI integration, content analysis, learning
- **Port**: 8001

### Browser Extension
- **Manifest**: V3 for Chrome, V2 compatibility
- **Content Scripts**: Injected into every page
- **Background**: Service worker for cross-tab communication
- **Popup**: Quick settings and status

## 🔧 Key Technologies

| Component | Tech Stack |
|-----------|------------|
| Frontend | React, Next.js, TypeScript, Tailwind |
| Extension | Vanilla JS/TS, Chrome APIs, Webpack |
| Node.js API | Express, Socket.io, JWT, Redis |
| Python AI | FastAPI, OpenAI, LangChain, Celery |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel, Railway, Docker |
| Monitoring | Sentry, Custom analytics |

## 📊 Monitoring & Analytics

- **Performance**: Response times and error rates
- **Usage**: User engagement and feature adoption  
- **AI Quality**: Response accuracy and user feedback
- **Privacy**: Audit logs and data usage tracking

## 🔒 Security & Privacy

- **Data Minimization**: Only collect necessary context
- **Encryption**: All data encrypted in transit and at rest
- **User Control**: Granular privacy settings and data deletion
- **Compliance**: GDPR and privacy law compliant

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway/Fly.io)
```bash
# Deploy using Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Browser Extension
```bash
npm run build:extension:prod
# Submit to Chrome Web Store / Firefox Add-ons
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@aiwatch.app
- 💬 Discord: [Join our community](https://discord.gg/aiwatch)
- 🐛 Issues: [GitHub Issues](https://github.com/yourorg/aiwatch/issues)
- 📖 Docs: [Full Documentation](https://docs.aiwatch.app)

---

**Built with ❤️ for a more intelligent web experience**