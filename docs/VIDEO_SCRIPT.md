# 🎥 Quick-Start Video Script
**Personal Job Application Tracker Setup**

**Total Length:** ~8-10 minutes  
**Target Audience:** Non-technical users  
**Tone:** Friendly, encouraging, step-by-step

---

## 📋 Pre-Production Notes

**What You'll Need to Record:**
- Screen recording software (Loom, OBS, QuickTime)
- Browser open to GitHub repo
- Terminal/Command Prompt ready
- Gmail account logged in
- AI assistant (Cursor or Claude) open

**Recommended Setup:**
- 1080p or higher resolution
- Clear audio (use good mic)
- Show cursor movements
- Zoom in on important areas
- Add captions for accessibility

---

## 🎬 SCRIPT

### INTRO (0:00 - 0:45)

**[VISUAL: Show finished dashboard with real data]**

**NARRATOR:**
"Hey there! Are you job hunting and tired of losing track of all your applications? Wondering which companies you've applied to, which ones have responded, and what your interview rate actually is?

I'm going to show you how to set up a personal job tracker that automatically reads your Gmail, finds all your job applications, and displays everything in a beautiful dashboard - all without writing a single line of code.

The best part? It updates automatically every day, so you always know exactly where you stand in your job search.

Let's get started!"

**[TITLE CARD: "Personal Job Tracker - Quick Start Guide"]**

---

### SECTION 1: What You'll Get (0:45 - 1:30)

**[VISUAL: Tour of the dashboard - hover over each feature]**

**NARRATOR:**
"Here's what your tracker will show you:

- **[Point to total applications]** Your total number of applications
- **[Point to interview rate]** How many applications lead to interviews
- **[Point to average days]** Average time from application to interview request
- **[Point to table]** A searchable table of every application with company, role, date, and status

Plus, it automatically detects when you get interview requests and updates the status for you.

All of this data comes directly from your Gmail - no manual entry required!"

---

### SECTION 2: Prerequisites (1:30 - 2:15)

**[VISUAL: Show checklist on screen]**

**NARRATOR:**
"Before we begin, make sure you have:

✓ A Gmail account where you receive job application emails
✓ About 15 minutes of time
✓ Node.js installed - we'll check this in a moment

And here's the secret weapon: we're going to use an AI assistant to help with setup. I recommend Cursor or Claude Desktop - they're free and make this super easy.

Don't worry if you're not technical - the AI will guide you through everything step by step.

Let's check if you have Node.js installed."

**[VISUAL: Open Terminal/Command Prompt]**

---

### SECTION 3: Check Node.js (2:15 - 3:00)

**[VISUAL: Terminal window]**

**NARRATOR:**
"Open your Terminal on Mac or Command Prompt on Windows, and type:

```
node --version
```

**[TYPE IT OUT SLOWLY]**

If you see a version number like 'v20' something, great! You're all set.

**[PAUSE]**

If you get 'command not found', no problem - just go to nodejs.org...

**[VISUAL: Show nodejs.org in browser]**

...download the LTS version, install it, and come back here.

**[VISUAL: Back to terminal showing successful version check]**

Perfect! Now we're ready to download the tracker."

---

### SECTION 4: Download the Project (3:00 - 3:45)

**[VISUAL: GitHub repository page]**

**NARRATOR:**
"Head over to github.com/yourusername/job-application-tracker

**[VISUAL: Slowly navigate to the repo]**

Click the green 'Code' button, then 'Download ZIP'.

**[VISUAL: Show download and unzip]**

Save it somewhere easy to find - I'm putting mine in Documents/job-tracker.

Once it's downloaded, unzip the file.

**[VISUAL: Show the unzipped folder contents]**

Great! Now we need to open this in our AI assistant."

---

### SECTION 5: AI-Assisted Setup (3:45 - 5:30)

**[VISUAL: Open Cursor or Claude Desktop]**

**NARRATOR:**
"I'm using Cursor here, but Claude Desktop works exactly the same way.

Open your AI assistant and add this folder to your workspace.

**[VISUAL: Show adding folder to Cursor]**

Now, here's where the magic happens. We're going to ask the AI to help us.

**[VISUAL: Show typing in the chat]**

Type this message - and you can pause the video to copy it exactly:

**[SHOW ON SCREEN:]**
```
I need to set up the job tracker from this repository.
Please guide me through the Gmail MCP setup step by step.
I'm at the beginning and need help with everything.
```

**[VISUAL: AI responds with instructions]**

See? The AI immediately starts guiding you through the Gmail setup.

For the next few minutes, you'll be following the AI's instructions to:
1. Create a Google Cloud project
2. Enable the Gmail API
3. Get your OAuth credentials
4. Configure the MCP server

**[VISUAL: Speed through these steps with captions]**

The AI will ask you questions, show you exactly what to click, and even help if you get errors.

**[TEXT OVERLAY: "Follow AI instructions for Gmail setup - ~5 minutes"]**

Once you have your credentials set up, ask the AI:

**[SHOW ON SCREEN:]**
```
Now help me install the dependencies and run the tracker for the first time.
```

**[VISUAL: Terminal running npm install]**

The AI will walk you through running:

```
cd job-catalog-automation
npm install
```

This installs all the required packages."

---

### SECTION 6: First Run (5:30 - 6:30)

**[VISUAL: Terminal ready to run]**

**NARRATOR:**
"Now for the moment of truth! Ask the AI to help you run the tracker:

```
node job_catalog_updater.js
```

**[VISUAL: Script running, showing output]**

You should see something like:

```
Fetched 25 apps for youremail@gmail.com
Added 25 new applications
```

**[VISUAL: Show successful completion]**

If you see this - congratulations! It worked!

If you get an error, don't panic. Just copy the error message and paste it into the AI chat. It will help you fix it.

**[VISUAL: Example of asking AI about an error]**

Most errors are simple fixes like re-authenticating with Gmail or updating a file path."

---

### SECTION 7: View Your Dashboard (6:30 - 7:15)

**[VISUAL: Open job_applications.html in browser]**

**NARRATOR:**
"Now let's see your data! 

In the project folder, find the file called 'job_applications.html' and open it in your browser.

**[VISUAL: Double-click the file, browser opens]**

And there it is! Your personal job tracker dashboard!

**[VISUAL: Tour the dashboard]**

- Here are all your applications
- Your interview rate
- Average time to get interview requests
- And you can search by company name, role, or status

**[VISUAL: Use the search feature]**

Try searching for a company name...

See how it filters instantly? Pretty cool, right?

**[VISUAL: Click column headers to sort]**

You can also click any column header to sort. Need to see your most recent applications? Click the date column."

---

### SECTION 8: Set Up Auto-Updates (7:15 - 8:30)

**[VISUAL: Back to AI assistant]**

**NARRATOR:**
"Right now, the tracker only runs when you manually run the script. Let's make it automatic!

Ask the AI:

**[SHOW ON SCREEN:]**
```
Help me set up automatic daily updates at 6 PM using [launchd/Task Scheduler/cron]
depending on my operating system.
```

**[VISUAL: AI provides OS-specific instructions]**

The AI will give you exact instructions for your operating system.

For Mac users, it will help you set up a launchd agent.
For Windows, it'll configure Task Scheduler.
For Linux, it'll create a cron job.

**[VISUAL: Follow AI instructions, show confirmation]**

Once this is set up, your tracker will automatically check Gmail every day at 6 PM and update your dashboard.

Set it and forget it!"

---

### SECTION 9: Customization & Tips (8:30 - 9:15)

**[VISUAL: Show the docs folder]**

**NARRATOR:**
"Want to customize your tracker? Check out the docs folder.

**[VISUAL: Show AI_PROMPTS.md]**

The AI_PROMPTS file has ready-to-use prompts for:
- Changing the time window (if you want to see older applications)
- Customizing the dashboard colors
- Adding new metrics
- Filtering out certain emails

**[VISUAL: Show TROUBLESHOOTING.md]**

And if anything goes wrong, the troubleshooting guide has solutions for common issues.

Remember: whenever you're stuck, just ask the AI for help. That's what it's there for!"

---

### OUTRO (9:15 - 10:00)

**[VISUAL: Show dashboard one more time]**

**NARRATOR:**
"And that's it! You now have a personal job tracker that:
- Automatically monitors your Gmail
- Tracks all your applications
- Shows your interview metrics
- Updates itself daily

All without writing any code!

**[VISUAL: Show GitHub repo page]**

The link to the repository is in the description below, along with timestamps for each section if you need to review anything.

If this helped you, give it a star on GitHub and share it with other job seekers!

**[VISUAL: Show example of final dashboard with good data]**

Good luck with your job search! With this tracker, you'll always know exactly where you stand.

Happy job hunting, and may your interview rate be high!

**[FADE TO END SCREEN with:]**
- GitHub: github.com/yourusername/job-application-tracker
- Documentation: [link]
- Need help? Open an issue on GitHub
"

---

## 📝 Post-Production Checklist

- [ ] Add chapter markers at each section
- [ ] Add captions/subtitles
- [ ] Include links in video description
- [ ] Add timestamps in description:
  - 0:00 - Introduction
  - 0:45 - What You'll Get
  - 1:30 - Prerequisites
  - 2:15 - Check Node.js
  - 3:00 - Download Project
  - 3:45 - AI-Assisted Setup
  - 5:30 - First Run
  - 6:30 - View Dashboard
  - 7:15 - Auto-Updates
  - 8:30 - Customization
  - 9:15 - Outro

---

## 📎 Video Description Template

```
🎯 Automatically track your job applications with this personal dashboard!

No coding required - just follow along and use an AI assistant to help with setup.

⏱️ TIMESTAMPS:
0:00 - Introduction
0:45 - Features Overview
1:30 - Prerequisites
2:15 - Check Node.js Installation
3:00 - Download the Project
3:45 - AI-Assisted Gmail Setup
5:30 - First Run
6:30 - View Your Dashboard
7:15 - Set Up Auto-Updates
8:30 - Customization Tips
9:15 - Wrap Up

🔗 LINKS:
📦 GitHub Repository: https://github.com/yourusername/job-application-tracker
📖 Full Documentation: [link]
🤖 AI Prompts Guide: [link]
🔧 Troubleshooting: [link]

💡 WHAT YOU'LL NEED:
✓ Gmail account
✓ 15 minutes
✓ Node.js (free)
✓ AI assistant like Cursor or Claude (free)

🎨 FEATURES:
✨ Automatic Gmail monitoring
📊 Beautiful metrics dashboard
🔍 Searchable application table
📅 Auto-updates daily
🎯 Interview tracking
📈 Success rate calculations

❓ QUESTIONS?
Open an issue on GitHub or ask your AI assistant!

#jobsearch #automation #productivity #gmail #AI #opensource
```

---

## 🎬 B-Roll Suggestions

Include these shots between main sections:
- Close-up of clicking buttons
- Dashboard loading and populating with data
- Search feature in action
- Metrics updating
- Code running in terminal (aesthetic shots)
- Browser opening dashboard

---

## 🎨 Visual Style Guide

**Color Scheme:** Match dashboard colors (blues, greens)  
**Font:** Clean, modern, readable  
**Transitions:** Simple fades, no flashy effects  
**Pace:** Slow enough to follow, fast enough to stay engaging  
**Cursor:** Highlight or enlarge cursor when clicking important things

---

## 💡 Tips for Recording

1. **Practice first** - Run through once before recording
2. **Slow down** - Talk slower than you think you need to
3. **Pause between steps** - Give viewers time to follow
4. **Show mistakes** - If you make an error, show how to fix it (relatable!)
5. **Use captions** - Essential for accessibility
6. **Test audio** - Make sure you're clear and loud enough
7. **Clean desktop** - Hide personal info before recording

---

**Good luck with your video! This will help so many job seekers! 🎥**
