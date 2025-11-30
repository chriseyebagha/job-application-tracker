# 📊 Personal Job Application Tracker

**Automatically track your job applications from Gmail and visualize your job search progress in a beautiful dashboard.**

![Job Tracker Dashboard](https://img.shields.io/badge/Status-Active-success)
![No Code Required](https://img.shields.io/badge/Setup-AI--Assisted-blue)

## 🎯 What Does This Do?

This tool automatically:
- 📧 Reads your Gmail to find job application emails
- 🎯 Tracks which companies you've applied to
- 📅 Monitors interview requests
- 📊 Displays beautiful metrics (response rate, average time to interview, etc.)
- 🔄 Updates daily automatically

**Best part?** You don't need to know how to code! Just follow the setup guide and use an AI assistant (like Claude, ChatGPT, or Gemini) to help.

## ✨ Live Example

Your dashboard will show:
- **Total applications** sent
- **Interview rate** (how many lead to interviews)
- **Average days to interview request** 
- **Status breakdown** (Applied, Interviewing, Rejected)
- **Searchable table** of all applications

## 🚀 Quick Start (AI-Assisted)

**Perfect for non-technical users!**

1. **Set up Gmail access** (5 minutes)
   - Follow [Gmail MCP Setup Guide](docs/GMAIL_SETUP.md)
   
2. **Run the setup with an AI assistant** (10 minutes)
   - Open this project folder in [Cursor](https://cursor.sh/) or [Claude Desktop](https://claude.ai/download)
   - Ask the AI: *"Help me set up the job tracker by following SETUP.md"*
   - The AI will guide you through everything!

3. **View your dashboard** (instant)
   - Open `job_applications.html` in your browser
   - See your job search visualized!

## 📋 What You Need

- **Gmail account** (where you receive job emails)
- **Computer** (Mac, Windows, or Linux)
- **10-15 minutes** of setup time
- **AI assistant** (Cursor, Claude Desktop, or ChatGPT) - recommended but not required

## 📚 Documentation

- **[Complete Setup Guide](docs/SETUP.md)** - Step-by-step instructions
- **[Gmail MCP Configuration](docs/GMAIL_SETUP.md)** - How to connect Gmail
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues & solutions
- **[Customization Guide](docs/CUSTOMIZATION.md)** - Make it yours!

## 🎨 Features

### Smart Email Detection
- Automatically identifies job application confirmations
- Detects interview requests (even from recruiters like BrightHire)
- Filters out non-job emails (payments, notifications, etc.)

### Beautiful Dashboard
- Clean, modern interface
- Real-time search
- Sortable columns
- Status-based color coding

### Daily Auto-Updates
- Runs automatically every day at 6 PM
- No manual data entry required
- Always up-to-date metrics

## 🛠️ Technical Details (Optional)

**For developers or curious users:**

- **Backend**: Node.js with Gmail API
- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Data Storage**: Local JSON in HTML file
- **Authentication**: OAuth 2.0 via MCP servers
- **Automation**: macOS launchd / Windows Task Scheduler

## 🤝 Contributing

Found a bug? Have an idea? Contributions welcome!

1. Fork this repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this for personal or commercial projects!

## 🙏 Acknowledgments

Built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Gmail MCP Server](https://github.com/modelcontextprotocol/servers)
- Love for automating tedious tasks ❤️

## 💬 Need Help?

- Open an [issue](../../issues) on GitHub
- Ask an AI assistant to help debug
- Check the [troubleshooting guide](docs/TROUBLESHOOTING.md)

---

**Made with 💼 by job seekers, for job seekers.**
