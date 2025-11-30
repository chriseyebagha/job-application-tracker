# 🔧 Troubleshooting Guide

Having issues? Don't worry! This guide covers common problems and solutions.

**💡 Pro Tip:** Copy the error message and ask your AI assistant for help!

---

## 🚨 Common Issues

### 1. "Node is not recognized as a command"

**Problem:** Node.js isn't installed or not in your PATH.

**Solutions:**
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal after installation
3. Verify installation: `node --version`

**AI Prompt:**
```
"I'm getting 'node is not recognized'. 
I've installed Node.js from nodejs.org but it's still not working.
My OS is [Mac/Windows/Linux]."
```

---

### 2. "Error: invalid_grant" or "Token has been expired or revoked"

**Problem:** Your Gmail OAuth tokens expired.

**Solution:**
```bash
# Delete old tokens
cd job-catalog-automation/config
rm token_*.json

# Re-run to get new tokens
node job_catalog_updater.js
```

A browser window will open - sign in and grant permissions again.

---

### 3. "Cannot find module 'googleapis'"

**Problem:** Dependencies weren't installed.

**Solution:**
```bash
cd job-catalog-automation
npm install
```

**AI Prompt:**
```
"Getting 'Cannot find module' errors.
Here's the exact error: [paste error]"
```

---

### 4. No Applications Showing Up

**Problem:** The tracker isn't finding your job emails.

**Possible Causes:**

#### A. Wrong Email Account
Check which account is configured in your credentials.

**Solution:** Verify in `job_catalog_updater.js` that the correct email is being queried.

#### B. Emails Are Too Old
The tracker looks at emails from the last 14 days by default.

**Solution:** If your applications are older, modify the search window:
```javascript
// In job_catalog_updater.js, line ~122
query = 'newer_than:30d';  // Changed from 14d to 30d
```

#### C. Emails Aren't Recognized as Job Applications
Some company emails might not match the detection patterns.

**Solution:** Check `job_catalog_updater.js` around line 70-120 for email patterns. Ask AI:
```
"My applications from [company name] aren't being detected.
Here's a sample subject line: [paste subject]
Can you help me add it to the detection patterns?"
```

---

### 5. "Access blocked" During OAuth

**Problem:** Google blocked the app from accessing Gmail.

**Solution:**
1. In Google Cloud Console, make sure Gmail API is **enabled**
2. Check that OAuth consent screen is configured
3. Add yourself as a test user:
   - Go to OAuth consent screen
   - Click "Add Users"
   - Add your email address

---

### 6. Dashboard Shows Duplicates

**Problem:** Same application appears multiple times.

**Causes:**
- Multiple confirmation emails from same company
- Forwarded emails
- Different sender addresses

**Solution:** The deduplication logic should handle this. If you see duplicates:

**AI Prompt:**
```
"I'm seeing duplicate entries for [company name] in my dashboard.
One shows as [email1] and another as [email2].
How do I merge these?"
```

---

### 7. "Permission denied" When Running Script

**Problem:** Script doesn't have execution permissions (Mac/Linux).

**Solution:**
```bash
chmod +x job-catalog-automation/job_catalog_updater.js
```

---

### 8. Auto-Update Not Working

**Problem:** Daily updates aren't running automatically.

**Solutions by OS:**

#### macOS (launchd)
Check if the service is loaded:
```bash
launchctl list | grep jobcatalog
```

If not loaded:
```bash
launchctl load ~/Library/LaunchAgents/com.yourname.jobcatalog.plist
```

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Find "Job Tracker Update" task
3. Right-click → Run to test
4. Check "Last Run Result" - should be 0x0

#### Linux (cron)
Check cron logs:
```bash
grep CRON /var/log/syslog
```

**AI Prompt:**
```
"My auto-update isn't running on [Mac/Windows/Linux].
Here's my launchd/task/cron configuration: [paste config]"
```

---

### 9. Metrics Look Wrong

**Problem:** Interview rate, days calculations seem off.

**Checks:**
1. Are interview dates being captured correctly?
2. Is the `interviewRequestedDate` field present in interview entries?
3. Are dates in correct format?

**AI Prompt:**
```
"My metrics don't look right. Here's one application entry: [paste JSON]
What might be wrong?"
```

---

### 10. "Rate Limit Exceeded" Error

**Problem:** Too many Gmail API requests.

**Solution:**
- Gmail API has limits: 1000 requests/day for free tier
- The tracker should stay well under this
- If you hit the limit, wait 24 hours or:

**AI Prompt:**
```
"I'm hitting Gmail API rate limits.
Current maxResults setting: [value]
Can you help me optimize the queries?"
```

---

## 🐛 Debugging Steps

When something goes wrong:

### 1. Check the Logs

Run the tracker manually to see detailed output:
```bash
cd job-catalog-automation
node job_catalog_updater.js
```

Look for:
- `Fetched X apps for youremail@gmail.com`
- `Added X new applications`
- Any error messages

### 2. Verify File Permissions

Make sure config files exist:
```bash
ls -la job-catalog-automation/config/
```

You should see:
- `credentials.json`
- `token_youremail@gmail.com.json`

### 3. Test Gmail Connection

Ask AI to help you test the Gmail connection:
```
"Can you write a simple test script to verify my Gmail MCP connection is working?
It should just list the last 5 email subjects."
```

### 4. Validate HTML Output

Open `job_applications.html` and check browser console (F12):
- Any JavaScript errors?
- Is the data array populated?

---

## 🆘 Still Stuck?

### Option 1: Use AI Assistant
Copy the entire error message and ask:
```
"I'm setting up the job tracker and getting this error: [paste full error]

Here's what I've tried: [list steps]

My system: [Mac/Windows/Linux], Node version: [X.X.X]

Can you help me fix this?"
```

### Option 2: Open a GitHub Issue
[Create an issue](../../issues) with:
- Exact error message
- Steps to reproduce
- Your OS and Node version
- Relevant config (remove sensitive data!)

### Option 3: Check Existing Issues
Someone may have had the same problem: [Search issues](../../issues)

---

## 📋 Diagnostic Checklist

Before asking for help, gather this info:

```bash
# Node version
node --version

# NPM version
npm --version

# Check if Gmail API is accessible
curl https://gmail.googleapis.com/$discovery/rest?version=v1

# List installed packages
npm list --depth=0

# Check file structure
ls -R job-catalog-automation/
```

Share this info when asking for help!

---

## 🎓 Advanced Debugging

For developers or brave users:

### Enable Debug Mode

Add this to the top of `job_catalog_updater.js`:
```javascript
process.env.DEBUG = '*';
```

Run again to see detailed logs.

### Test Individual Components

Ask AI to help you test specific parts:
```
"Can you help me test just the email fetching part?
I want to see what emails are being retrieved."
```

---

**Remember:** No question is too small! Use your AI assistant or open a GitHub issue. We're here to help! 🤝

[← Back to Setup Guide](SETUP.md)
