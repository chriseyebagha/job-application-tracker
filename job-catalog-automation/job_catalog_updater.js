import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MCP_DIR = path.join(process.env.HOME, 'Documents/Projects/Personal Agent/mcp-servers/mcp-google-workspace');
const ACCOUNTS_FILE = path.join(MCP_DIR, '.accounts.json');
const CATALOG_FILE = path.join(process.env.HOME, 'Documents/Projects/Personal Agent/job_applications.html');
const BACKUP_CATALOG_FILE = path.join(process.env.HOME, 'Documents/Projects/Personal Agent/job_applications.html'); // Fallback
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

    // If client_id/client_secret are missing, try to get them from .gauth.json
    let clientId = tokenData.client_id;
    let clientSecret = tokenData.client_secret;

    if (!clientId || !clientSecret) {
        const gauthFile = path.join(MCP_DIR, '.gauth.json');
        const gauthData = readJson(gauthFile);
        if (gauthData && gauthData.installed) {
            clientId = gauthData.installed.client_id;
            clientSecret = gauthData.installed.client_secret;
        } else {
            // Fallback to {{USER_EMAIL_PREFIX}} token file (legacy behavior, might not be needed if .gauth.json exists)
            console.log(`Missing OAuth credentials for ${email}, checking fallback...`);
            const fallbackTokenFile = path.join(MCP_DIR, '.oauth2.{{USER_EMAIL_PREFIX}}@gmail.com.json');
            const fallbackData = readJson(fallbackTokenFile);
            if (fallbackData) {
                clientId = fallbackData.client_id;
                clientSecret = fallbackData.client_secret;
            }
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

// Intelligent classification patterns instead of company blocking
const ATS_DOMAINS = [
    'greenhouse-mail.io',
    'greenhouse.io',
    'gh-mail',
    'lever.co',
    'hire.lever.co',
    'myworkdayjobs.com',
    'wd5.myworkdayjobs.com',
    'icims.com',
    'taleo.net',
    'jobvite.com',
    'smartrecruiters.com',
    'bamboohr.com',
    'applytojob.com'
];

const JOB_SENDER_PATTERNS = [
    'careers@',
    'recruiting@',
    'jobs@',
    'talent@',
    'hr@',
    'hiring@',
    'recruitment@'
];

const NON_JOB_SENDER_PATTERNS = [
    'payments@',
    'billing@',
    'invoice@',
    'noreply@google.com',
    'no-reply@google.com',
    'statement@',
    'alerts@',
    'notifications@discover.com',
    'notifications@capitalone.com',
    'account-security-noreply@accountprotection.microsoft.com'
];

const FINANCIAL_KEYWORDS = [
    'credit card application',
    'credit limit',
    'loan application',
    '{{USER_EMAIL_PREFIX}} loan',
    'statement is ready',
    'payment received',
    'payment confirmation',
    'transaction alert',
    'balance transfer',
    'microsoft account',
    'welcome to microsoft'
];

// Fetch recent application-related emails (last 14 days to ensure comprehensive coverage)
const fetchRecentApplications = async (auth, email) => {
    const gmail = google.gmail({ version: 'v1', auth });

    // For {{USER_EMAIL_PREFIX}}, all emails are job-related, so use a broad query
    // For other accounts, use targeted keywords
    let query;
    if (email.includes('{{USER_EMAIL_PREFIX}}')) {
        query = 'newer_than:14d'; // All emails from last 14 days
    } else {
        query = 'newer_than:14d (subject:"application" OR subject:"applied" OR subject:"interview" OR subject:"opportunity" OR subject:"position" OR "thank you for applying" OR "received your application" OR "application received" OR "unfortunately" OR "not selected" OR "moving forward")';
    }
    console.log(`Query for ${email}: ${query.substring(0, 100)}...`);

    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 100
        });

        const messages = res.data.messages || [];
        const applications = [];

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

            // Basic extraction logic (can be improved with regex)
            let company = 'Unknown';
            if (from.includes('<')) {
                const namePart = from.split('<')[0].trim();
                company = namePart.replace(/"/g, '').replace('Recruiting', '').replace('Careers', '').replace('Team', '').trim();
            } else {
                company = from;
            }


            // Extract company from subject if it's a "Thank you for applying to [Company]" email
            const thankYouMatch = subject.match(/Thank you for applying to (.+)/i);
            if (thankYouMatch) {
                // Clean up company name (remove punctuation, etc.)
                let extracted = thankYouMatch[1].trim();
                if (extracted.endsWith('!')) extracted = extracted.slice(0, -1);
                if (extracted.endsWith('.')) extracted = extracted.slice(0, -1);
                if (extracted.endsWith('.')) extracted = extracted.slice(0, -1);
                company = extracted;
            }

            // Explicit overrides for known recruiters/senders
            const COMPANY_OVERRIDES = {
                '{{RECRUITER_NAME_EXAMPLE}}': '{{COMPANY_NAME_EXAMPLE}}',
                'Microsoft Account': 'Microsoft'
            };

            if (COMPANY_OVERRIDES[company]) {
                company = COMPANY_OVERRIDES[company];
            }


            // Infer role from subject if possible
            let role = 'Unknown Role';
            const snippet = details.data.snippet || '';
            const fullText = (subject + ' ' + snippet).toLowerCase();

            // Common role extraction patterns
            const rolePatterns = [
                // "Application for [role]" or "Your application for [role]"
                /(?:application|applied)\s+(?:for|to)\s+(?:the\s+)?(?:position\s+of\s+)?(.+?)(?:\s+(?:at|with|position|role|job)|$)/i,
                // "Position: [role]" or "Role: [role]"
                /(?:position|role|job)\s*:\s*(.+?)(?:\s+(?:at|with|-)|$)/i,
                // "[Company] - [Role]" format
                /-\s+(.+?)\s+(?:application|position|role)/i,
                // "Thank you for applying to [Company] as [Role]"
                /as\s+(?:a\s+)?(.+?)(?:\s+(?:at|with)|$)/i,
                // Direct role mentions with seniority levels
                /((?:senior|sr|lead|staff|principal|junior|jr|associate|entry[\s-]level)\s+(?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer))/i,
                // Role with team/area
                /((?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer)(?:\s+[-,]\s+.+)?)/i,
                // Greenhouse/ATS format: "Analytics Engineer at Company"
                /^(.+?)\s+at\s+\w+/i,
            ];

            // Try each pattern
            for (const pattern of rolePatterns) {
                const match = subject.match(pattern);
                if (match && match[1]) {
                    let extractedRole = match[1].trim();

                    // Clean up common artifacts
                    extractedRole = extractedRole
                        .replace(/\s+application$/i, '')
                        .replace(/^your\s+/i, '')
                        .replace(/^the\s+/i, '')
                        .replace(/^position\s+of\s+/i, '')
                        .replace(/\s+position$/i, '')
                        .replace(/\s+role$/i, '')
                        .replace(/\s+at\s+.+$/i, '')
                        .replace(/[.!,;]+$/, '')
                        .trim();

                    // Validate it looks like a role (not too long, has relevant keywords)
                    if (extractedRole.length > 5 && extractedRole.length < 100) {
                        const roleKeywords = [
                            'engineer', 'analyst', 'scientist', 'developer', 'manager',
                            'analytics', 'data', 'business intelligence', 'bi', 'ml', 'ai',
                            'senior', 'lead', 'staff', 'principal', 'associate', 'junior'
                        ];

                        const hasKeyword = roleKeywords.some(keyword =>
                            extractedRole.toLowerCase().includes(keyword)
                        );

                        if (hasKeyword) {
                            role = extractedRole;
                            break;
                        }
                    }
                }
            }

            // If still unknown, try to extract from snippet (email body preview)
            if (role === 'Unknown Role' && snippet) {
                const snippetPatterns = [
                    /position\s+of\s+(.+?)\s+(?:at|with)/i,
                    /role\s+of\s+(.+?)\s+(?:at|with)/i,
                    /for\s+the\s+(.+?)\s+position/i,
                    /as\s+(?:a|an)\s+(.+?)\s+(?:at|with|on)/i
                ];

                for (const pattern of snippetPatterns) {
                    const match = snippet.match(pattern);
                    if (match && match[1]) {
                        const extractedRole = match[1].trim();
                        const roleKeywords = ['engineer', 'analyst', 'scientist', 'developer', 'manager'];
                        if (roleKeywords.some(k => extractedRole.toLowerCase().includes(k))) {
                            role = extractedRole.charAt(0).toUpperCase() + extractedRole.slice(1);
                            break;
                        }
                    }
                }
            }

            // Capitalize first letter of each word if role found
            if (role !== 'Unknown Role') {
                role = role.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
            }


            // Check for status using semantic categorization
            let status = 'Applied';

            // Filter out MBA/graduate school recruitment (not job applications)
            const isMBARecruit = fullText.includes('mba program') ||
                fullText.includes('graduate program') ||
                fullText.includes('apply to our mba') ||
                fullText.includes('admissions') ||
                (fullText.includes('mba') && (fullText.includes('application deadline') || fullText.includes('apply now'))) ||
                from.toLowerCase().includes('admissions');

            if (isMBARecruit) {
                continue; // Skip this entry
            }

            // For {{USER_EMAIL_PREFIX}} account, skip filtering since all emails are job-related
            const skipFiltering = email.includes('{{USER_EMAIL_PREFIX}}');

            // Intelligent classification using pattern matching
            const fromLower = from.toLowerCase();
            let jobScore = 0;

            if (!skipFiltering) {
                // Check if from ATS platform (strong job indicator)
                const isFromATS = ATS_DOMAINS.some(domain => fromLower.includes(domain));
                if (isFromATS) {
                    jobScore += 3; // High confidence for ATS platforms
                }

                // Check sender email pattern
                const hasJobSenderPattern = JOB_SENDER_PATTERNS.some(pattern => fromLower.includes(pattern));
                const hasNonJobSenderPattern = NON_JOB_SENDER_PATTERNS.some(pattern => fromLower.includes(pattern));

                if (hasJobSenderPattern) {
                    jobScore += 2; // careers@, recruiting@, etc.
                }
                if (hasNonJobSenderPattern) {
                    jobScore -= 3; // payments@, billing@, etc.
                }

                // Check for financial transaction keywords (strong negative indicator)
                const hasFinancialKeywords = FINANCIAL_KEYWORDS.some(keyword => fullText.includes(keyword));
                if (hasFinancialKeywords) {
                    jobScore -= 3; // Financial emails are not job applications
                }

                // Skip if score is negative (likely not a job application)
                if (jobScore < 0) {
                    console.log(`FILTERED OUT: ${company} (score: ${jobScore}) - ${subject.substring(0, 60)}`);
                    continue;
                }
            }

            // First check if email is job-related
            let isJobRelated = true;

            if (!skipFiltering) {
                isJobRelated = fullText.includes('opportunity') ||
                    fullText.includes('job') ||
                    fullText.includes('interview') ||
                    fullText.includes('application') ||
                    fullText.includes('applied') ||
                    fullText.includes('position') ||
                    fullText.includes('role') ||
                    fullText.includes('career') ||
                    fullText.includes('hiring') ||
                    fullText.includes('candidate');

                // If not job-related and score is low, skip
                if (!isJobRelated && jobScore === 0) {
                    console.log(`NOT JOB RELATED: ${company} - ${subject.substring(0, 60)}`);
                    continue;
                }
            }

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

            // Extract interview date from calendar invitation emails OR interview scheduling emails
            // Use the DATE OF THE EMAIL (confirmation date), not the scheduled interview date
            let interviewRequestedDate = null;

            // Check for BrightHire interview scheduling emails
            if (fromLower.includes('brighthire')) {
                // Extract company name from patterns like "opportunity at [Company]" or "interview with [Company]"
                // Use more restrictive patterns to avoid over-matching
                const opportunityMatch = fullText.match(/(?:opportunity|position|role)\s+at\s+([A-Z][a-zA-Z0-9\s&.'-]{1,30}?)(?:\s*[!.]|\s+as\b|\s+to\b|\s+and\b|\n|$)/i);
                const interviewMatch = fullText.match(/(?:interview|call|meeting)\s+with\s+([A-Z][a-zA-Z0-9\s&.'-]{1,30}?)(?:\s*[!.\n]|$)/i);
                const subjectMatch = subject.match(/(?:interview|call)\s+with\s+([A-Z][a-zA-Z0-9\s&.'-]{1,30}?)(?:\s*$)/i);

                if (opportunityMatch || interviewMatch || subjectMatch) {
                    let extractedCompany = (opportunityMatch || interviewMatch || subjectMatch)[1].trim();
                    // Clean up extracted company name - remove trailing words and limit length
                    extractedCompany = extractedCompany
                        .replace(/\s+(team|inc|llc|corp|corporation|you|your|the)\.?$/i, '')
                        .replace(/\s+[a-z]{1,3}\s.*$/, '') // Remove lowercase words and everything after
                        .trim();
                    // Only update if we got a reasonable company name (not too long, not empty)
                    if (extractedCompany.length > 0 && extractedCompany.length < 50) {
                        company = extractedCompany;
                        interviewRequestedDate = date;
                        status = 'Interviewing';
                    }
                }
            }

            // Also check calendar invitation emails
            if (subject.toLowerCase().includes('invitation') &&
                (subject.toLowerCase().includes('interview') || subject.toLowerCase().includes('screen'))) {
                // Use the email's date as the interview confirmation date
                interviewRequestedDate = date;  // This is when they sent the invitation
                status = 'Interviewing';  // Mark as interviewing
            }

            const appData = {
                company,
                role,
                date,
                account: email.split('@')[0],
                status,
                subject
            };

            // Add interview date if found
            if (interviewRequestedDate) {
                appData.interviewRequestedDate = interviewRequestedDate;
            }

            applications.push(appData);
        }
        return applications.filter(app => app !== null);
    } catch (error) {
        console.error(`Error fetching emails for ${email}:`, error.message);
        return [];
    }
};

// Update HTML Catalog with smart status updates
const updateCatalog = (newApps) => {
    let targetFile = CATALOG_FILE;

    // Check if Documents folder is accessible, if not use fallback
    try {
        fs.accessSync(path.dirname(CATALOG_FILE), fs.constants.W_OK);
    } catch (err) {
        console.warn(`Cannot write to ${CATALOG_FILE}, using fallback: ${BACKUP_CATALOG_FILE}`);
        targetFile = BACKUP_CATALOG_FILE;
    }

    // Read existing applications from HTML if it exists
    let existingApps = [];
    if (fs.existsSync(targetFile)) {
        const htmlContent = fs.readFileSync(targetFile, 'utf8');
        const dataMatch = htmlContent.match(/const applications = \[(.*?)\];/s);
        if (dataMatch) {
            try {
                existingApps = JSON.parse('[' + dataMatch[1] + ']');
            } catch (e) {
                console.warn('Could not parse existing applications, starting fresh');
            }
        }
    }

    // Merge new apps with existing, handling both duplicates and status updates
    const allApps = [...existingApps];
    let addedCount = 0;
    let updatedCount = 0;

    newApps.forEach(newApp => {
        // Helper to normalize strings for comparison
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Helper to check if two company names are effectively the same
        // Handles cases where one is a name ("{{COMPANY_NAME_EXAMPLE}}") and one is an email ("no-reply@robinhood.com")
        const areCompaniesSame = (name1, name2) => {
            const n1 = name1.toLowerCase();
            const n2 = name2.toLowerCase();

            // Direct match
            if (n1 === n2) return true;
            if (normalize(n1) === normalize(n2)) return true;

            // Check if one is an email and contains the other
            if (n1.includes('@') && !n2.includes('@')) {
                const domain = n1.split('@')[1];
                return domain && domain.includes(normalize(n2));
            }
            if (n2.includes('@') && !n1.includes('@')) {
                const domain = n2.split('@')[1];
                return domain && domain.includes(normalize(n1));
            }

            return false;
        };

        // Try to find match based on company name
        const matchIndex = allApps.findIndex(app => areCompaniesSame(app.company, newApp.company));

        if (matchIndex >= 0) {
            // Found match - check if we should upgrade status or update details
            const existingApp = allApps[matchIndex];
            const statusPriority = { 'Rejected': 3, 'Interviewing': 2, 'Applied': 1 };

            // Upgrade status if new status is higher priority
            if (statusPriority[newApp.status] > statusPriority[existingApp.status]) {
                allApps[matchIndex].status = newApp.status;
                updatedCount++;
                console.log(`Updated ${existingApp.company} status: ${existingApp.status} -> ${newApp.status}`);
            }

            // If new app has interview date and existing doesn't, update it
            if (newApp.interviewRequestedDate && !existingApp.interviewRequestedDate) {
                allApps[matchIndex].interviewRequestedDate = newApp.interviewRequestedDate;
            }

            // Update role if existing is "Unknown Role" and new one is known
            if (existingApp.role === 'Unknown Role' && newApp.role !== 'Unknown Role') {
                allApps[matchIndex].role = newApp.role;
                updatedCount++;
                console.log(`Updated ${existingApp.company} role: "Unknown Role" -> "${newApp.role}"`);
            }

            // If existing company name is an email but new one is a proper name, update it
            // e.g. "no-reply@robinhood.com" -> "{{COMPANY_NAME_EXAMPLE}}"
            if (existingApp.company.includes('@') && !newApp.company.includes('@')) {
                allApps[matchIndex].company = newApp.company;
            }
        } else {
            // Completely new application
            allApps.push(newApp);
            addedCount++;
            console.log(`NEW APP: ${newApp.company} - ${newApp.role.substring(0, 30)} (${newApp.account})`);
        }
    });

    // Read template
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    // Generate JSON data for the applications
    const appsData = allApps.map(app => {
        const data = {
            company: app.company,
            role: app.role,
            date: app.date,
            account: app.account,
            status: app.status
        };
        // Include interview date if it exists
        if (app.interviewRequestedDate) {
            data.interviewRequestedDate = app.interviewRequestedDate;
        }
        return data;
    });

    // Replace placeholder with data
    let htmlOutput = template.replace(
        '[/*DATA_PLACEHOLDER*/]',
        JSON.stringify(appsData, null, 2)
    );

    // Replace last updated placeholder
    const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    htmlOutput = htmlOutput.replace('[/*LAST_UPDATED_PLACEHOLDER*/]', now);

    // Write HTML file
    fs.writeFileSync(targetFile, htmlOutput);

    if (addedCount > 0 || updatedCount > 0) {
        console.log(`Added ${addedCount} new applications, updated ${updatedCount} statuses to ${targetFile}`);
    } else {
        console.log('No new applications or status updates found.');
    }
};

// Main execution
const main = async () => {
    const accountsData = readJson(ACCOUNTS_FILE);
    if (!accountsData || !accountsData.accounts) {
        console.error('Could not load accounts.');
        return;
    }

    let allApps = [];
    for (const account of accountsData.accounts) {
        console.log(`Checking ${account.email}...`);
        const auth = getAuthClient(account.email);
        if (auth) {
            const apps = await fetchRecentApplications(auth, account.email);
            console.log(`Fetched ${apps ? apps.length : 'undefined'} apps for ${account.email}`);
            if (Array.isArray(apps)) {
                allApps = [...allApps, ...apps];
            } else {
                console.error('apps is not an array:', apps);
            }
        }
    }

    if (allApps.length > 0) {
        updateCatalog(allApps);
    } else {
        console.log('No relevant emails found in the last 24 hours.');
    }
};

main();
