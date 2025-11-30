# 🤖 AI Assistant Prompts Guide

**The secret to easy setup:** Good prompts! This guide contains copy-paste prompts for every step.

Use these with Cursor, Claude Desktop, ChatGPT, or any AI coding assistant.

---

## 🎯 Initial Setup Prompts

### Starting the Project

```
I'm setting up a {{USER_EMAIL_PREFIX}} job application tracker that reads from Gmail.
I have the repository downloaded to [path/to/folder].

Can you help me verify:
1. Node.js is installed correctly
2. The project structure looks correct
3. What my next steps should be

I'm a [beginner/intermediate/advanced] with coding.
```

---

## 📧 Gmail MCP Setup Prompts

### Step 1: Creating Google Cloud Project

```
I need to set up Gmail API access for a {{USER_EMAIL_PREFIX}} project.
Can you walk me through:

1. Creating a Google Cloud project
2. Enabling the Gmail API
3. Setting up OAuth 2.0 credentials for a desktop app

Please give me step-by-step instructions like I'm explaining it to someone
who's never used Google Cloud Console before.
```

### Step 2: Configuring MCP

```
I have my Gmail API credentials.json file.
Now I need to configure the MCP server for Gmail access.

Here's my current .mcp/config.json:
[paste your config]

Can you help me:
1. Verify this configuration is correct
2. Set the right paths for my system
3. Explain what each part does

My project is at: [full/path/to/project]
```

### Step 3: Testing Gmail Connection

```
I've configured Gmail MCP and want to test the connection.
Can you write me a simple test script that:

1. Connects to Gmail using the MCP server
2. Fetches the last 5 email subjects
3. Prints them to console
4. Handles errors gracefully

This will help me verify everything is working before running the full tracker.
```

---

## 🔧 Installation & Dependencies

### Installing Node Modules

```
I need to install the dependencies for this job tracker.
I'm in the job-catalog-automation directory.

Can you:
1. Show me the exact command to run
2. Explain what npm install does
3. Help me troubleshoot if I get any errors
4. Verify the installation was successful

Current directory: [paste pwd output]
```

---

## 🐛 Debugging Prompts

### General Error

```
I'm getting an error when running the job tracker.
Here's the full error message:

[paste entire error]

Here's what I've tried:
- [list what you tried]

My setup:
- OS: [Mac/Windows/Linux]
- Node version: [run: node --version]
- Current directory: [run: pwd]

Can you help me understand what's wrong and how to fix it?
```

### OAuth / Authentication Errors

```
I'm having trouble with Gmail authentication.
Error: [paste error]

Current token files: [run: ls config/token*]
Credentials file exists: [yes/no]

Questions:
1. Do I need to delete and regenerate tokens?
2. Is my credentials.json configured correctly?
3. What permissions should I be granting?

Can you walk me through fixing this?
```

### No Emails Being Fetched

```
The tracker runs but shows 0 applications fetched.

Here's the output: [paste output]

I definitely have job application emails in my Gmail from the last 14 days.
Examples of subject lines:
- [paste 2-3 real subject lines]

Can you help me:
1. Check if the email patterns are detecting these
2. Modify the detection logic if needed
3. Test the changes
```

---

## ✏️ Customization Prompts

### Changing Detection Patterns

```
I want to add custom email detection for applications from [company name].

Their emails have these characteristics:
- Sender: [sender email/name]
- Subject pattern: [typical subject]
- Common keywords: [list keywords]

Can you help me modify job_catalog_updater.js to detect these emails?
Show me exactly what code to add and where.
```

### Adjusting Time Windows

```
I want to change the email search window from 14 days to [X] days
because [reason].

Can you:
1. Show me where to make this change
2. Explain any performance implications
3. Make the change for me
4. Help me test it
```

### UI Customization

```
I want to customize the dashboard appearance:

Changes I want:
- [list desired changes, e.g., "different colors", "add company logos", etc.]

Can you:
1. Show me what files to edit
2. Make the CSS/HTML changes
3. Ensure it still works after changes
```

---

## 🔄 Automation Setup Prompts

### macOS LaunchAgent

```
I need to set up automatic daily updates using macOS launchd.

Requirements:
- Run at 6:00 PM daily
- Script location: [full/path/to/job_catalog_updater.js]
- Log output to: [desired log location]

Can you:
1. Create the .plist file with correct configuration
2. Show me where to save it
3. Give me the commands to load and test it
4. Help me verify it's working
```

### Windows Task Scheduler

```
I need to set up a Windows Task Scheduler task to run the tracker daily.

Requirements:
- Run at 6:00 PM daily
- Script: [full\path\to\job_catalog_updater.js]
- Run whether user is logged in or not

Can you provide:
1. Step-by-step Task Scheduler setup instructions
2. The exact command/action to configure
3. How to test it's working
4. How to view logs/results
```

### Linux Cron

```
I need to add a cron job to run the tracker daily at 6:00 PM.

My setup:
- Script location: [full/path/to/job_catalog_updater.js]
- Node location: [run: which node]
- Want to log output

Can you:
1. Write the cron expression
2. Show me how to edit crontab
3. Include proper PATH and logging
4. Help me verify it's scheduled correctly
```

---

## 🎨 Feature Requests

### Adding New Metrics

```
I want to add a new metric to the dashboard that shows [describe metric].

Current metrics code is around lines [X-Y] in job_applications.html.

Can you:
1. Write the JavaScript to calculate this metric
2. Add the HTML to display it
3. Style it to match existing metrics
4. Test it with sample data
```

### Email Filtering

```
I want to filter out certain types of emails from being tracked.

Specifically:
- Emails from: [list senders]
- Keywords to exclude: [list keywords]

Can you modify the filtering logic in job_catalog_updater.js to
exclude these while keeping all legitimate job applications?
```

---

## 📊 Data Management

### Backing Up Data

```
I want to create a backup system for my job tracker data.

Can you help me:
1. Identify what files contain data
2. Create a backup script
3. Set it up to run automatically
4. Show me how to restore from backup if needed
```

### Exporting Data

```
I want to export my job application data to [CSV/Excel/JSON].

Can you create a script that:
1. Reads the current data from job_applications.html
2. Converts it to [format]
3. Saves it with today's date
4. Includes all fields (company, role, date, status, etc.)
```

---

## 🔍 Specific Problem Solving

### Duplicate Detection Issues

```
I'm seeing duplicate entries for the same application.

Examples:
- [paste example 1]
- [paste example 2]

Can you help me:
1. Understand why these aren't being merged
2. Improve the deduplication logic
3. Run a one-time cleanup of existing duplicates
```

### Interview Detection Not Working

```
I received an interview request from [company] but it's not being
detected as "Interviewing" status.

Email details:
- Subject: [subject]
- Sender: [sender]
- Key phrases: [paste relevant text]

Can you help me add detection for this type of interview email?
```

---

## 🎓 Learning Prompts

### Understanding the Code

```
I want to understand how the job tracker works.

Can you explain:
1. The overall architecture (which files do what)
2. How Gmail data flows through the system
3. How the dashboard gets updated
4. Where I should look to make [specific change]

Please explain like I'm learning to code.
```

### Security Review

```
Can you review the security aspects of this job tracker?

Specifically:
1. How is my Gmail data protected?
2. What data is stored and where?
3. Could this data be accessed by others?
4. Are there any security improvements I should make?
```

---

## 💡 Pro Tips for Better Prompts

### Be Specific
❌ "It's not working"
✅ "Getting error 'invalid_grant' when running node job_catalog_updater.js"

### Provide Context
Include:
- What you were trying to do
- What you expected to happen
- What actually happened
- Error messages (full text)
- Your system info (OS, Node version)

### Share Code/Config
Paste relevant sections (remove sensitive data like tokens!)

### Break Down Complex Tasks
Instead of "Set up everything", ask for help with specific steps.

---

## 🤝 Contributing Your Prompts

Found a great prompt that helped you? Share it!

1. Add it to this file
2. Submit a pull request
3. Help other users!

---

**Remember:** The AI assistant is your pair programmer. Don't hesitate to ask for clarification, examples, or different approaches!

[← Back to Documentation](../README.md)
