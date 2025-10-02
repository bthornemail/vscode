#!/bin/bash

# 🌍 HyperDev IDE Setup Script
# Sets up your regenerative development environment in one command

set -e

echo "🌍 Welcome to HyperDev IDE Setup!"
echo "Setting up your regenerative development environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. You have $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git detected${NC}"

echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Setup environment file
echo -e "${BLUE}⚙️ Setting up environment configuration...${NC}"

if [ ! -f ".env" ]; then
    cat > .env << EOF
# HyperDev IDE Environment Configuration
VITE_APP_NAME=HyperDev IDE
VITE_APP_VERSION=1.0.0

# MCP Server Configuration
VITE_MCP_SERVER_URL=http://localhost:3001
VITE_H2GNN_ENDPOINT=http://localhost:3002

# Web3 Configuration
VITE_DEFAULT_NETWORK=polygon
VITE_ENABLE_TESTNET=true

# Regenerative Features
VITE_IMPACT_TRACKING=true
VITE_CARBON_MEASUREMENT=true
VITE_BIODIVERSITY_TRACKING=true

# P2P Configuration
VITE_WEBRTC_ENABLED=true
VITE_SIGNALING_SERVER=ws://localhost:3003

# Storage Configuration
VITE_STORAGE_MODE=hybrid
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_REDIS_URL=redis://localhost:6379

# Development Settings
VITE_DEBUG_MODE=true
VITE_AI_ASSISTANCE=true
VITE_KNOWLEDGE_GRAPH=true
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
else
    echo -e "${YELLOW}⚠️ Environment file already exists${NC}"
fi

echo ""

# Setup project structure
echo -e "${BLUE}📁 Setting up project structure...${NC}"

# Create necessary directories
mkdir -p src/projects
mkdir -p src/data
mkdir -p public/assets
mkdir -p docs/examples

# Create sample project
if [ ! -f "src/projects/sample-carbon-marketplace.json" ]; then
    cat > src/projects/sample-carbon-marketplace.json << EOF
{
  "name": "Sample Carbon Marketplace",
  "type": "carbon_credit_marketplace",
  "description": "A simple carbon credit marketplace for learning regenerative development",
  "target_impact": {
    "carbon_sequestration": 100,
    "farmers_supported": 10,
    "economic_value": 50000
  },
  "contracts": [
    {
      "name": "CarbonCreditToken",
      "type": "ERC20",
      "regenerative_features": ["impact_based_minting", "biodiversity_bonus"]
    }
  ],
  "stakeholders": [
    {"type": "farmer", "count": 10},
    {"type": "corporate_buyer", "count": 5},
    {"type": "verifier", "count": 2}
  ],
  "created_at": "$(date -Iseconds)",
  "status": "template"
}
EOF
    echo -e "${GREEN}✅ Sample project created${NC}"
fi

echo ""

# Check if MCP server is available
echo -e "${BLUE}🔍 Checking MCP server availability...${NC}"

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP server is running${NC}"
else
    echo -e "${YELLOW}⚠️ MCP server not detected${NC}"
    echo -e "${YELLOW}   You can start it later with: npm run start:mcp${NC}"
fi

echo ""

# Final setup
echo -e "${BLUE}🏁 Finalizing setup...${NC}"

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🌍 Starting HyperDev IDE..."

# Start MCP server in background
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "🤖 Starting MCP server..."
    npm run start:mcp &
    sleep 2
fi

# Start main application
echo "🚀 Starting main application..."
npm run dev

echo "✅ HyperDev IDE is running at http://localhost:3000"
EOF

chmod +x start.sh

echo -e "${GREEN}✅ Startup script created${NC}"

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}🚀 To start HyperDev IDE:${NC}"
echo -e "   ${YELLOW}./start.sh${NC}"
echo ""
echo -e "   ${BLUE}Or manually:${NC}"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo -e "   1. Open http://localhost:3000 in your browser"
echo -e "   2. Connect your Web3 wallet (MetaMask recommended)"
echo -e "   3. Create your first regenerative project"
echo -e "   4. Start coding for the planet! 🌱"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   • Getting Started: ${YELLOW}./GETTING_STARTED.md${NC}"
echo -e "   • Technical Architecture: ${YELLOW}./TECHNICAL_ARCHITECTURE.md${NC}"
echo -e "   • Demo Walkthrough: ${YELLOW}./REGENERATIVE_DEMO.md${NC}"
echo ""
echo -e "${BLUE}🤝 Need help?${NC}"
echo -e "   • Discord: https://discord.gg/hyperdev-regenerative"
echo -e "   • Documentation: https://docs.hyperdev.io"
echo -e "   • Issues: https://github.com/hyperdev/issues"
echo ""
echo -e "${GREEN}Welcome to regenerative programming! 🌍✨${NC}"

