# 🎮 GameListAI - Web Tools & Games Collection

A comprehensive collection of web-based tools and games powered by AI, built with Node.js and Express.

## 🌟 Features

### 🤖 AI-Powered Tools
- **Merangkum AI** - Text summarization using Groq AI
- **Plant Agen AI** - Plant care consultation with AI
- **The Hacker News AI** - Tech news with AI-generated summaries
- **Various AI Tools** - Multiple utility tools with AI integration

### 🎮 Games Collection
- Interactive web games
- Educational games
- Entertainment applications

### 🛠️ Additional Tools
- Code editors
- Text processors
- Media converters
- Security tools
- And many more utilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Groq API key (for AI features)

### Installation

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

## 🔑 API Keys Setup

### Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create an account and generate an API key
3. Add the key to your `.env` file:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

### Gemini API Key (Optional)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   ```

## 📁 Project Structure

```
GameListAI/
├── src/
│   ├── config.js          # Configuration settings
│   ├── routes.js          # Express routes
│   ├── services/          # Service modules
│   └── templates/         # HTML templates
├── tools/                 # AI tools and utilities
├── game/                  # Game collection
├── public/                # Static assets
├── index.js               # Main server file
├── package.json           # Dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🛠️ Available Scripts

```bash
# Start the development server
npm start

# Install dependencies
npm install

# Run tests (if available)
npm test
```

## 🌐 Deployment

### Vercel (Recommended)
This project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Heroku**: Add `Procfile` with `web: node index.js`
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `GROQ_API_KEY`: Groq API key for AI features
- `GEMINI_API_KEY`: Google Gemini API key

### Customization
Edit `src/config.js` to modify:
- Server settings
- Directory paths
- Default configurations

## 📱 Usage

### AI Tools
1. Navigate to `/tools/` directory
2. Select an AI-powered tool
3. Enter your input
4. Get AI-generated results

### Games
1. Go to `/game/` directory
2. Choose a game
3. Start playing!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Adding New Tools

1. Create HTML file in `tools/` directory
2. Use environment variables for API keys:
   ```javascript
   const apiKey = process.env.GROQ_API_KEY || 'YOUR_API_KEY_HERE';
   ```
3. Follow existing code patterns
4. Test thoroughly before committing

## 🔒 Security

- **Never commit API keys** to the repository
- Use `.env` file for sensitive data
- `.env` is automatically ignored by git
- Always use environment variables in production

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**BangunX**
- GitHub: [@bangunx](https://github.com/bangunx)

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for AI API services
- [Express.js](https://expressjs.com/) for the web framework
- [Node.js](https://nodejs.org/) for the runtime environment

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/bangunx/weblist/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Watching the repository
- Checking releases
- Following the changelog

---

**Happy coding! 🚀**
