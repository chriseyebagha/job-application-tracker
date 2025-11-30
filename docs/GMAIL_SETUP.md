# 📧 Gmail MCP Setup Guide

This guide walks you through connecting the job tracker to your Gmail account using Model Context Protocol (MCP).

**Time needed:** 10 minutes  
**Difficulty:** Medium (Easy with AI assistant)

---

## 🤔 What is MCP?

**Model Context Protocol (MCP)** is a secure way to let applications access your data (like Gmail) without giving them full access to your account. Think of it as a "valet key" for your email - limited, specific access.

---

## 🎯 Two Setup Options

### Option A: AI-Assisted Setup (Recommended) 🤖

**Best for non-technical users!**

1. Open this project in Cursor, Claude Desktop, or ChatGPT
2. Use this prompt:

```
I need to set up Gmail MCP access for a job tracker. Here's what I need help with:

1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Configure the credentials for desktop application
4. Set up the MCP server configuration
5. Get the OAuth tokens

Please guide me step-by-step. I'm at step [1/2/3/etc].
```

3. Follow the AI's guidance - it will walk you through each step

---

### Option B: Manual Setup 📝

#### Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing):
   - Click "Select a project" → "New Project"
   - Name it "Job Tracker" or similar
   - Click "Create"

3. Enable Gmail API:
   - In the search bar, type "Gmail API"
   - Click "Gmail API"
   - Click "Enable"

#### Step 2: Create OAuth Credentials

1. Go to "Credentials" in the left sidebar
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted to configure consent screen:
   - Click "Configure Consent Screen"
   - Choose "External"
   - Fill in:
     - App name: "Job Tracker"  
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue" through the steps

4. Create OAuth Client ID:
   - Application type: **"Desktop app"**
   - Name: "Job Tracker Desktop"
   - Click "Create"

5. **Download credentials**:
   - Click the download icon (⬇️) next to your new credential
   - Save as `credentials.json`

#### Step 3: Set Up MCP Configuration

1. Create MCP config directory:
   ```bash
   mkdir -p ~/.mcp
   ```

2. Create config file `~/.mcp/config.json`:
   ```json
   {
     "mcpServers": {
       "gmail": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-gmail"
         ],
         "env": {
           "GMAIL_CREDENTIALS_PATH": "/path/to/your/credentials.json",
           "GMAIL_TOKEN_PATH": "/path/to/your/tokens/directory"
         }
       }
     }
   }
   ```

3. Replace `/path/to/your/credentials.json` with the actual path where you saved the credentials file

#### Step 4: Set Up Token Directory

1. Create a tokens directory in your project:
   ```bash
   cd ~/Documents/job-tracker
   mkdir -p job-catalog-automation/config
   ```

2. Copy your `credentials.json` to this folder:
   ```bash
   cp ~/Downloads/credentials.json job-catalog-automation/config/
   ```

3. Update the MCP config to point to this location:
   ```json
   "env": {
     "GMAIL_CREDENTIALS_PATH": "~/Documents/job-tracker/job-catalog-automation/config/credentials.json",
     "GMAIL_TOKEN_PATH": "~/Documents/job-tracker/job-catalog-automation/config"
   }
   ```

#### Step 5: Get OAuth Tokens

1. Run the tracker for the first time:
   ```bash
   cd job-catalog-automation
   node job_catalog_updater.js
   ```

2. A browser window will open asking you to:
   - Sign in to Google
   - Grant permissions to the app
   - **Important**: Click "Allow" when it asks for Gmail access

3. Tokens will be saved automatically in `job-catalog-automation/config/`

---

## 🔒 Security Notes

### What Access Does This Have?

The tracker can:
- ✅ Read your Gmail messages
- ✅ Search for specific emails

The tracker **CANNOT**:
- ❌ Send emails
- ❌ Delete emails
- ❌ Access other Google services
- ❌ Share your data

### Where Are Credentials Stored?

- **Credentials**: Stored locally on your computer only
- **Tokens**: Saved in `job-catalog-automation/config/`
- **Dashboard data**: Saved in `job_applications.html` (local file)

**Your data never leaves your computer!**

---

## ✅ Verification

Test that Gmail access works:

```bash
node job_catalog_updater.js
```

You should see:
```
Query for youremail@gmail.com: newer_than:14d...
Fetched XX apps for youremail@gmail.com
```

If you see errors about authentication, check:
1. Credentials file path is correct
2. Tokens directory exists
3. You granted all permissions in the OAuth flow

---

## 🔄 Managing Multiple Gmail Accounts

Want to track applications from multiple email accounts?

1. Create separate credentials for each account
2. Configure each in the MCP config:

```json
{
  "mcpServers": {
    "gmail-personal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gmail"],
      "env": {
        "GMAIL_CREDENTIALS_PATH": "~/job-tracker/config/personal-credentials.json",
        "GMAIL_TOKEN_PATH": "~/job-tracker/config/personal"
      }
    },
    "gmail-work": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-gmail"],
      "env": {
        "GMAIL_CREDENTIALS_PATH": "~/job-tracker/config/work-credentials.json",
        "GMAIL_TOKEN_PATH": "~/job-tracker/config/work"
      }
    }
  }
}
```

---

## 🆘 Troubleshooting

### "Error: invalid_grant"

**Solution**: Your tokens expired. Delete the token files and re-run:
```bash
rm job-catalog-automation/config/token_*.json
node job_catalog_updater.js
```

### "Error: Access blocked"

**Solution**: Make sure you clicked "Allow" during OAuth flow. Try again and grant all requested permissions.

### "Cannot find credentials file"

**Solution**: Check that the path in `~/.mcp/config.json` is correct and the file exists.

---

## 🤖 AI Assistance Prompts

### If credentials setup fails:
```
"I'm having trouble setting up Gmail API credentials.
The error is: [paste error]
My config.json looks like this: [paste config]"
```

### If OAuth flow doesn't work:
```
"The OAuth flow isn't opening in my browser when I run the tracker.
How do I manually trigger it?"
```

### If tokens keep expiring:
```
"My Gmail tokens keep expiring and I have to re-authenticate.
How do I get long-lived tokens?"
```

---

**Once this is set up, you'll never have to touch it again!** The tracker will automatically use these credentials every time it runs.

[← Back to Setup Guide](SETUP.md)
