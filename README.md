# 🎮 GameListAI - Web Tools & Games Collection

<div align="center">

![GameListAI Logo](https://img.shields.io/badge/GameListAI-Web%20Tools%20%26%20Games-blue?style=for-the-badge&logo=node.js)
![Node.js](https://img.shields.io/badge/Node.js-22.0.0-green?style=flat-square&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.21.0-lightgrey?style=flat-square&logo=express)
![License](https://img.shields.io/badge/License-ISC-yellow?style=flat-square)

**A comprehensive collection of AI-powered web tools and games built with Node.js and Express**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bangunx/weblist)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-brightgreen?style=for-the-badge)](https://gamelist-kw82gvs4b-bangunxs-projects.vercel.app)

</div>

---

## 🌟 Features

### 🤖 AI-Powered Tools
- **📝 Merangkum AI** - Advanced text summarization using Groq AI
- **🌱 Plant Agen AI** - Intelligent plant care consultation
- **📰 The Hacker News AI** - Tech news with AI-generated summaries
- **🔧 Various AI Tools** - Multiple utility tools with AI integration

### 🎮 Games Collection
- **🎯 Interactive Games** - Engaging web-based games
- **📚 Educational Games** - Learning-focused applications
- **🎪 Entertainment** - Fun and relaxing games

### 🛠️ Additional Tools
- **💻 Code Editors** - Online coding environments
- **📄 Text Processors** - Document manipulation tools
- **🎨 Media Converters** - File format conversion utilities
- **🔒 Security Tools** - Privacy and security utilities

---

## 🚀 One-Click Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bangunx/weblist)

**Steps:**
1. Click the "Deploy with Vercel" button above
2. Sign in to your Vercel account
3. Import the repository
4. Add environment variables:
   - `GROQ_API_KEY` - Your Groq API key
   - `GEMINI_API_KEY` - Your Gemini API key (optional)
5. Click "Deploy"

### Other Deployment Options

<details>
<summary><strong>📋 Manual Deployment</strong></summary>

#### Prerequisites
- Node.js (v22 or higher)
- npm or yarn
- Groq API key (for AI features)

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bangunx/weblist.git
   cd weblist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

</details>

---

## 🔑 API Keys Setup

### 🔥 Groq API Key (Required for AI features)
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create an account and generate an API key
3. Add the key to your environment variables:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

### 🤖 Gemini API Key (Optional)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   ```

---

## 📁 Project Structure

```
GameListAI/
├── 📁 src/
│   ├── ⚙️  config.js          # Configuration settings
│   ├── 🛣️  routes.js          # Express routes
│   ├── 📁 services/          # Service modules
│   └── 📁 templates/         # HTML templates
├── 🛠️  tools/                 # AI tools and utilities
├── 🎮 game/                  # Game collection
├── 🧠 mind/                  # Mind tools and utilities
├── 🎲 random/                # Random utilities
├── 📁 public/                # Static assets
├── 🚀 index.js               # Main server file
├── 📦 package.json           # Dependencies
├── 🔧 vercel.json            # Vercel configuration
├── 📋 .env.example          # Environment variables template
└── 📖 README.md             # This file
```

---

## 🛠️ Available Scripts

```bash
# Start the development server
npm start

# Start development mode
npm run dev

# Install dependencies
npm install

# Build for production
npm run build

# Run tests
npm test
```

---

## 🌐 Deployment Platforms

### ✅ Vercel (Recommended)
- **One-click deploy** with the button above
- Automatic HTTPS
- Global CDN
- Serverless functions
- Environment variables support

### 🔧 Other Platforms

<details>
<summary><strong>Heroku</strong></summary>

1. Create `Procfile`:
   ```
   web: node index.js
   ```
2. Deploy via Heroku CLI or GitHub integration

</details>

<details>
<summary><strong>Railway</strong></summary>

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

</details>

<details>
<summary><strong>DigitalOcean App Platform</strong></summary>

1. Create new app from GitHub
2. Configure build settings
3. Set environment variables

</details>

---

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `GROQ_API_KEY` | Groq API key for AI features | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | No | - |

### Customization
Edit `src/config.js` to modify:
- Server settings
- Directory paths
- Default configurations

---

## 📱 Usage Guide

### 🤖 AI Tools
1. Navigate to `/tools/` directory
2. Select an AI-powered tool
3. Enter your input
4. Get AI-generated results instantly

### 🎮 Games
1. Go to `/game/` directory
2. Choose your favorite game
3. Start playing and have fun!

### 🧠 Mind Tools
1. Visit `/mind/` directory
2. Explore cognitive tools
3. Enhance your mental capabilities

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Bug Reports
1. Check existing [issues](https://github.com/bangunx/weblist/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the bug

### ✨ Feature Requests
1. Open an issue with the "enhancement" label
2. Describe the feature and its benefits
3. Provide mockups or examples if possible

### 🔧 Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Adding New Tools

### 🛠️ For AI Tools
1. Create HTML file in `tools/` directory
2. Use environment variables for API keys:
   ```javascript
   const apiKey = process.env.GROQ_API_KEY || 'YOUR_API_KEY_HERE';
   ```
3. Follow existing code patterns
4. Test thoroughly before committing

### 🎮 For Games
1. Create game files in `game/` directory
2. Use responsive design principles
3. Include proper error handling
4. Add instructions for users

---

## 🔒 Security Best Practices

- **🔐 Never commit API keys** to the repository
- **📁 Use `.env` file** for sensitive data
- **🚫 `.env` is automatically ignored** by git
- **🌐 Always use environment variables** in production
- **🛡️ Validate all user inputs**
- **🔍 Regular security updates**

---

## 📊 Performance

- **⚡ Fast loading** with optimized static assets
- **🌐 Global CDN** delivery via Vercel
- **📱 Mobile responsive** design
- **♿ Accessibility** compliant
- **🔧 SEO optimized**

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**BangunX**
- 🌐 GitHub: [@bangunx](https://github.com/bangunx)
- 📧 Contact: [Create an issue](https://github.com/bangunx/weblist/issues)

---

## 🙏 Acknowledgments

- [**Groq**](https://groq.com/) for powerful AI API services
- [**Express.js**](https://expressjs.com/) for the robust web framework
- [**Node.js**](https://nodejs.org/) for the amazing runtime environment
- [**Vercel**](https://vercel.com/) for seamless deployment platform

---

## 📞 Support

### 🆘 Need Help?

1. **📋 Check the [Issues](https://github.com/bangunx/weblist/issues)** page
2. **🐛 Create a new issue** with detailed description
3. **📝 Include error messages** and steps to reproduce
4. **🏷️ Use appropriate labels** for better organization

### 💬 Community

- **⭐ Star the repository** if you find it useful
- **🍴 Fork and contribute** to make it better
- **📢 Share with others** who might benefit

---

## 🔄 Updates & Changelog

Stay updated with the latest features and improvements:

- **👀 Watch the repository** for notifications
- **🏷️ Check [releases](https://github.com/bangunx/weblist/releases)** for version updates
- **📋 Follow the [changelog](CHANGELOG.md)** for detailed changes

---

<div align="center">

**🌟 If you found this project helpful, please give it a star! 🌟**

[![GitHub stars](https://img.shields.io/github/stars/bangunx/weblist?style=social)](https://github.com/bangunx/weblist)
[![GitHub forks](https://img.shields.io/github/forks/bangunx/weblist?style=social)](https://github.com/bangunx/weblist)

**Happy coding! 🚀**

</div>