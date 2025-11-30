import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MCP_DIR = path.join(process.env.HOME, 'Personal Agent/mcp-servers/mcp-google-workspace');
const ACCOUNTS_FILE = path.join(MCP_DIR, '.accounts.json');
const CATALOG_FILE = path.join(process.env.HOME, 'Documents/job_applications.html');
const BACKUP_CATALOG_FILE = path.join(process.env.HOME, 'Personal Agent/job_applications.html');
const TEMPLATE_FILE = path.join(__dirname, 'catalog_template.html');

// Helper to read JSON file
const readJson = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
};

// Authenticate with stored tokens
const getAuthClient = (email) => {
    const tokenFile = path.join(MCP_DIR, `.oauth2.${email}.json`);
    const tokenData = readJson(tokenFile);

    if (!tokenData) {
        console.error(`No token found for ${email}`);
        return null;
    }

    // If client_id/client_secret are missing, get them from personal account
    let clientId = tokenData.client_id;
    let clientSecret = tokenData.client_secret;

    if (!clientId || !clientSecret) {
        console.log(`Missing OAuth credentials for ${email}, using personal credentials...`);
        const fallbackTokenFile = path.join(MCP_DIR, '.oauth2.personal@gmail.com.json');
        const fallbackData = readJson(fallbackTokenFile);
        if (fallbackData) {
            clientId = fallbackData.client_id;
            clientSecret = fallbackData.client_secret;
        }
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);

    oAuth2Client.setCredentials({
        refresh_token: tokenData.refresh_token,
        access_token: tokenData.access_token,
        expiry_date: tokenData.expiry_date
    });

    return oAuth2Client;
};

// Fetch ALL application emails (for initial population)
const fetchAllApplications = async (auth, email) => {
    const gmail = google.gmail({ version: 'v1', auth });
    // Broadened query to catch rejections and other job-related emails
    // Extended to 14 days back from Nov 22, 2025
    const query = 'after:2025/11/08 (subject:"application" OR subject:"applied" OR subject:"interview" OR subject:"opportunity" OR subject:"position" OR "thank you for applying" OR "received your application" OR "application received" OR "unfortunately" OR "not selected" OR "moving forward")';

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 100
        });

        const messages = res.data.messages || [];
        const applications = [];

        console.log(`  Found ${messages.length} messages for ${email}`);

        for (const msg of messages) {
            const details = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id
            });

            const headers = details.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const dateStr = headers.find(h => h.name === 'Date')?.value;
            const date = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Basic extraction logic
            let company = 'Unknown';
            if (from.includes('<')) {
                const namePart = from.split('<')[0].trim();
                company = namePart.replace(/"/g, '').replace('Recruiting', '').replace('Careers', '').replace('Team', '').trim();
            } else {
                company = from;
            }

            // Infer role from subject
            let role = 'Unknown Role';
            const lowerSubject = subject.toLowerCase();
            if (lowerSubject.includes('application for')) {
                const parts = lowerSubject.split('application for');
                if (parts.length > 1) role = parts[1].trim();
            } else if (lowerSubject.includes('applied to')) {
                const parts = lowerSubject.split('applied to');
                if (parts.length > 1) role = parts[1].trim();
            } else if (lowerSubject.includes('position')) {
                const parts = subject.split(':');
                if (parts.length > 1) role = parts[1].trim();
            } else if (lowerSubject.includes('applying to')) {
                role = 'See Email';
            }

            // Capitalize role
            if (role !== 'Unknown Role' && role !== 'See Email') {
                role = role.charAt(0).toUpperCase() + role.slice(1);
            }

            // Check for status using semantic categorization
            const snippet = details.data.snippet || '';
            const fullText = (subject + ' ' + snippet).toLowerCase();
            let status = 'Applied';

            // Filter out MBA/graduate school recruitment (not job applications)
            const isMBARecruit = fullText.includes('mba program') ||
                fullText.includes('graduate program') ||
                fullText.includes('apply to our mba') ||
                fullText.includes('admissions') ||
                (fullText.includes('mba') && (fullText.includes('application deadline') || fullText.includes('apply now'))) ||
                from.toLowerCase().includes('admissions');

            if (isMBARecruit) {
                continue; // Skip this email
            }

            // First check if email is job-related
            const isJobRelated = fullText.includes('opportunity') ||
                fullText.includes('job') ||
                fullText.includes('interview') ||
                fullText.includes('application') ||
                fullText.includes('applied') ||
                fullText.includes('position') ||
                fullText.includes('role') ||
                fullText.includes('career') ||
                fullText.includes('hiring') ||
                fullText.includes('candidate');

            // Check for ACTIVE interview scheduling (direct requests, not future conditionals)
            // Look for phrases that indicate immediate next steps, not "we'll contact you if..."
            const hasDirectScheduling =
                (fullText.includes('schedule') && (fullText.includes('time') || fullText.includes('call') || fullText.includes('chat') || fullText.includes('meeting'))) ||
                (fullText.includes('next step') && (fullText.includes('love to') || fullText.includes('would like') || fullText.includes('let\'s') || fullText.includes('calendar'))) ||
                fullText.includes('book a time') ||
                fullText.includes('schedule an interview') ||
                fullText.includes('schedule a call') ||
                fullText.includes('schedule a time') ||
                (fullText.includes('interview') && fullText.includes('calendly')) ||
                (fullText.includes('interview') && fullText.includes('when are you available'));

            // Exclude passive/conditional phrases that indicate they'll reach out LATER
            const isPassiveConfirmation =
                fullText.includes('will reach out') ||
                fullText.includes('will contact') ||
                fullText.includes('will be in touch') ||
                fullText.includes('reviewing your application') ||
                fullText.includes('we are currently reviewing') ||
                fullText.includes('if your profile');

            if (isJobRelated && hasDirectScheduling && !isPassiveConfirmation) {
                status = 'Interviewing';
            }
            // Check for rejection with comprehensive keywords
            else if (fullText.includes('unfortunately') ||
                fullText.includes('not moving forward') ||
                fullText.includes('we have decided') ||
                fullText.includes('moving forward with other candidates') ||
                fullText.includes('filled the role') ||
                fullText.includes('won\'t be proceeding') ||
                fullText.includes('will not be proceeding') ||
                fullText.includes('not be proceeding') ||
                fullText.includes('not selected') ||
                fullText.includes('other candidates') ||
                fullText.includes('decided to move forward with') ||
                fullText.includes('pursue other candidates')) {
                status = 'Rejected';
            }

            // Extract interview date from calendar invitation emails
            // Use the DATE OF THE EMAIL (confirmation date), not the scheduled interview date
            let interviewDate = null;
            if (subject.toLowerCase().includes('invitation') &&
                (subject.toLowerCase().includes('interview') || subject.toLowerCase().includes('screen'))) {
                // Use the email's date as the interview confirmation date
                interviewDate = date;  // This is when they sent the invitation
                status = 'Interviewing';  // Mark as interviewing
            }

            const appData = {
                company,
                role,
                date,
                account: email.split('@')[0],
                status
            };

            // Add interview date if found
            if (interviewDate) {
                appData.interviewDate = interviewDate;
            }

            applications.push(appData);
        }
        return applications;
    } catch (error) {
        console.error(`Error fetching emails for ${email}:`, error.message);
        return [];
    }
};

// Create HTML catalog with all applications, preserving status upgrades
const createCatalog = (allApps) => {
    let targetFile = CATALOG_FILE;

    try {
        fs.accessSync(path.dirname(CATALOG_FILE), fs.constants.W_OK);
    } catch (err) {
        console.warn(`Cannot write to ${CATALOG_FILE}, using fallback: ${BACKUP_CATALOG_FILE}`);
        targetFile = BACKUP_CATALOG_FILE;
    }

    // Read existing applications to preserve manual status updates
    let existingApps = [];
    if (fs.existsSync(targetFile)) {
        const htmlContent = fs.readFileSync(targetFile, 'utf8');
        // The placeholder is `[/*DATA_PLACEHOLDER*/]`, so we need to extract the JSON array that replaces it.
        // The template likely has a script tag where this data is injected.
        // Assuming the template looks something like: <script>const applications = [/*DATA_PLACEHOLDER*/];</script>
        // The instruction's regex `const applications = \[(.*?)\];` is a good guess for the final rendered HTML.
        const dataMatch = htmlContent.match(/const applications = (\[.*?\]);/s);
        if (dataMatch && dataMatch[1]) {
            try {
                existingApps = JSON.parse(dataMatch[1]);
                console.log(`Found ${existingApps.length} existing applications`);
            } catch (e) {
                console.warn('Could not parse existing applications from HTML:', e.message);
            }
        }
    }

    // Remove duplicates and merge with existing (keeping higher status)
    const seen = new Set();
    // Define status priority: Rejected (3) > Interviewing (2) > Applied (1)
    const statusPriority = { 'Rejected': 3, 'Interviewing': 2, 'Applied': 1 };
    const mergedApps = [];

    allApps.forEach(app => {
        const key = `${app.company}|${app.role}`;

        // Check if this app (company+role) has already been processed from new data
        // This handles duplicates within the `allApps` array itself, similar to the original `uniqueApps` filter.
        if (seen.has(key)) {
            return;
        }

        // Find if this application (company+role) already exists in the catalog
        const existingApp = existingApps.find(e =>
            e.company === app.company && e.role === app.role
        );

        if (existingApp) {
            // If an existing entry is found, compare statuses
            const currentAppStatusPriority = statusPriority[app.status] || 0; // Default to 0 if status not in map
            const existingAppStatusPriority = statusPriority[existingApp.status] || 0;

            let finalStatus = app.status;
            if (existingAppStatusPriority > currentAppStatusPriority) {
                // Preserve the existing (higher priority) status
                finalStatus = existingApp.status;
                console.log(`Preserved status for ${app.company} - ${app.role}: ${finalStatus} (new data was ${app.status})`);
            } else if (existingAppStatusPriority < currentAppStatusPriority) {
                // New status is higher, so upgrade
                console.log(`Upgraded status for ${app.company} - ${app.role}: ${finalStatus} (was ${existingApp.status})`);
            }
            // If priorities are equal, `finalStatus` remains `app.status` (which is fine)

            mergedApps.push({
                ...app,
                status: finalStatus
            });
        } else {
            // If it's a new application not found in existing, add it directly
            mergedApps.push(app);
        }

        seen.add(key); // Mark this company+role as processed
    });

    // Add any existing applications that were not updated by new data (i.e., no new email for them)
    existingApps.forEach(existingApp => {
        const key = `${existingApp.company}|${existingApp.role}`;
        if (!seen.has(key)) {
            mergedApps.push(existingApp);
            seen.add(key); // Mark as processed
        }
    });

    // Read template
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    // Generate JSON data for the applications
    const appsData = mergedApps.map(app => ({
        company: app.company,
        role: app.role,
        date: app.date,
        account: app.account,
        status: app.status
    }));

    // Replace placeholder with data
    const htmlOutput = template.replace(
        '[/*DATA_PLACEHOLDER*/]',
        JSON.stringify(appsData, null, 2)
    );

    // Write HTML file
    fs.writeFileSync(targetFile, htmlOutput);
    console.log(`\nCreated catalog with ${mergedApps.length} unique applications at ${targetFile}`);
};

// Main execution
const main = async () => {
    console.log('===== ONE-TIME HISTORY POPULATION =====\n');

    const accountsData = readJson(ACCOUNTS_FILE);
    if (!accountsData || !accountsData.accounts) {
        console.error('Could not load accounts.');
        return;
    }

    let allApps = [];
    for (const account of accountsData.accounts) {
        console.log(`Fetching history from ${account.email}...`);
        const auth = getAuthClient(account.email);
        if (auth) {
            const apps = await fetchAllApplications(auth, account.email);
            allApps = [...allApps, ...apps];
        }
    }

    if (allApps.length > 0) {
        createCatalog(allApps);
    } else {
        console.log('No applications found.');
    }
};

main();
