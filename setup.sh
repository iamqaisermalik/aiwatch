#!/bin/bash

echo "🚀 Setting up AIWatch development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi
print_status "Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
    print_error "Python 3.11+ required. Current version: $PYTHON_VERSION"
    exit 1
fi
print_status "Python $PYTHON_VERSION found"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    print_status "Docker found - you can use docker-compose for development"
else
    print_warning "Docker not found - you'll need to install Redis manually"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    print_status ".env file created - please update with your API keys"
else
    print_warning ".env file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Install Node.js API dependencies
echo "📦 Installing Node.js API dependencies..."
cd backend/nodejs-api
npm install
if [ $? -eq 0 ]; then
    print_status "Node.js API dependencies installed"
else
    print_error "Failed to install Node.js API dependencies"
    exit 1
fi
cd ../..

# Install browser extension dependencies
echo "📦 Installing browser extension dependencies..."
cd browser-extension
npm install
if [ $? -eq 0 ]; then
    print_status "Browser extension dependencies installed"
else
    print_error "Failed to install browser extension dependencies"
    exit 1
fi
cd ..

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
cd backend/python-ai

if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Python virtual environment created"
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_status "Python dependencies installed"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

cd ../..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p cache
print_status "Directories created"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 📝 Update your .env file with:"
echo "   - Supabase URL and keys"
echo "   - OpenAI API key"
echo "   - Other required credentials"
echo ""
echo "2. 🗄️ Set up your Supabase database:"
echo "   - Create a new project at https://supabase.com"
echo "   - Run the SQL in database/schema.sql"
echo ""
echo "3. 🚀 Start development:"
echo "   npm run dev              # Start all services"
echo "   npm run dev:frontend     # Just frontend"
echo "   npm run dev:api         # Just Node.js API"
echo "   npm run dev:ai          # Just Python AI"
echo ""
echo "4. 🔧 Install browser extension:"
echo "   npm run build:extension"
echo "   Then load browser-extension/dist in Chrome"
echo ""
echo "📖 Check README.md for detailed documentation"
echo ""
print_status "Happy coding! 🚀"