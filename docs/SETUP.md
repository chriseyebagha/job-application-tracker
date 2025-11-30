# 🚀 Complete Setup Guide

**Time needed: 15-20 minutes**  
**Difficulty: Easy (with AI assistant) | Medium (without)**

This guide will help you set up your {{USER_EMAIL_PREFIX}} job application tracker. **We recommend using an AI assistant** (Cursor, Claude Desktop, or ChatGPT) to help you through the process.

---

## 📦 Prerequisites

Before starting, make sure you have:

- [ ] **Gmail account** (where you receive job application emails)
- [ ] **Computer** with internet connection
- [ ] **Node.js** installed ([Download here](https://nodejs.org/) - choose "LTS" version)
- [ ] **AI assistant** (optional but highly recommended):
  - [Cursor](https://cursor.sh/) - Best for coding tasks
  - [Claude Desktop](https://claude.ai/download) - Great for guidance
  - [ChatGPT Plus](https://chat.openai.com/) - Works well too

---

## 🎯 Setup Process

### Step 1: Install Node.js (5 minutes)

Node.js is the software that runs the job tracker.

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version
3. Run the installer
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Type: `node --version`
6. You should see something like `v20.x.x` ✅

**Need help?** Tell your AI assistant: *"I need to install Node.js. Can you guide me through it?"*

---

### Step 2: Download This Project (2 minutes)

1. Click the green **"Code"** button at the top of this page
2. Click **"Download ZIP"**
3. Unzip the file to a location you'll remember (like `Documents/job-tracker`)
4. Open Terminal/Command Prompt and navigate to the folder:
   ```bash
   cd ~/Documents/job-tracker
   ```

**AI Prompt:** *"Help me download and navigate to the job-tracker folder"*

---

### Step 3: Connect to Gmail (10 minutes)

This is the most important step! We need to give the tracker permission to read your job emails.

#### Option A: Using AI Assistant (Recommended) 🤖

1. Open this project in Cursor or Claude Desktop
2. Say to the AI:
   ```
   "I need to set up Gmail MCP access for this job tracker.
   Please follow the instructions in docs/GMAIL_SETUP.md and
   help me configure it step by step."
   ```
3. The AI will guide you through getting:
   - Gmail API credentials
   - OAuth tokens
   - Proper configuration

#### Option B: Manual Setup 📝

Follow the detailed guide: [Gmail MCP Setup](GMAIL_SETUP.md)

**Key files to configure:**
- `.mcp/config.json` - MCP server configuration
- `job-catalog-automation/config/` - OAuth tokens

---

### Step 4: Install Dependencies (1 minute)

In Terminal/Command Prompt, run:

```bash
cd job-catalog-automation
npm install
```

This installs all the required software packages.

**AI Prompt:** *"Help me install the npm dependencies"*

---

### Step 5: Test the Tracker (2 minutes)

Let's make sure everything works!

```bash
node job_catalog_updater.js
```

You should see output like:
```
Fetched 25 apps for youremail@gmail.com
Added 25 new applications
```

If you see errors, check the [Troubleshooting Guide](TROUBLESHOOTING.md).

**AI Prompt:** *"I'm getting an error when running the tracker. Here's the error: [paste error]"*

---

### Step 6: View Your Dashboard (instant!)

1. Open the file `job_applications.html` in your web browser
2. You should see all your applications displayed beautifully! 🎉

**Tips:**
- Use the search box to find specific companies
- Click column headers to sort
- Bookmark this page for easy access

---

### Step 7: Set Up Daily Auto-Updates (5 minutes)

Make the tracker run automatically every day.

#### macOS

The AI assistant can help set up the `launchd` service:

**AI Prompt:**
```
"Help me set up automatic daily updates using the launchd plist file
in job-catalog-automation/com.your-username.jobcatalog.plist.
It should run at 6 PM daily."
```

#### Windows

The AI can help create a Task Scheduler task:

**AI Prompt:**
```
"Help me create a Windows Task Scheduler task to run
job_catalog_updater.js daily at 6 PM."
```

#### Linux

Use cron:

**AI Prompt:**
```
"Help me add a cron job to run job_catalog_updater.js daily at 6 PM."
```

---

## ✅ Verification Checklist

Make sure everything is working:

- [ ] Node.js installed and version shows
- [ ] Project downloaded and unzipped
- [ ] Gmail MCP configured with valid tokens
- [ ] `npm install` completed without errors
- [ ] `node job_catalog_updater.js` runs successfully
- [ ] `job_applications.html` displays your applications
- [ ] Daily auto-update scheduled

---

## 🎨 Next Steps

Now that it's set up:

1. **Customize it**: Check [Customization Guide](CUSTOMIZATION.md)
2. **Share feedback**: Open an issue if something's unclear
3. **Tell friends**: Help others automate their job search!

---

## 🆘 Having Issues?

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Ask your AI assistant for help
3. Open an [issue on GitHub](../../issues)

Remember: **The AI assistant is your best friend for setup!** Don't hesitate to ask it questions at every step.

---

**You did it! 🎉 Your job tracker is now running!**
