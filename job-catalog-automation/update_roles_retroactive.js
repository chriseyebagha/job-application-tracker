#!/usr/bin/env node
/**
 * Retroactive Role Update Script
 * Re-fetches emails and updates role information for existing applications
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_FILE = path.join(__dirname, '..', 'job_applications.html');

console.log('===== RETROACTIVE ROLE UPDATE =====\n');

// Read accounts from MCP config
const accountsPath = path.join(__dirname, '..', 'mcp-servers', 'mcp-google-workspace', '.accounts.json');
let accounts = [];
try {
    const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
    accounts = accountsData.accounts || [];
    console.log(`Loaded ${accounts.length} Gmail account(s)\n`);
} catch (error) {
    console.error(`Error reading ${accountsPath}:`, error.message);
    process.exit(1);
}

// Read existing applications from HTML
let existingApps = [];
if (fs.existsSync(CATALOG_FILE)) {
    const htmlContent = fs.readFileSync(CATALOG_FILE, 'utf8');
    const dataMatch = htmlContent.match(/const applications = \[(.*?)\];/s);
    if (dataMatch) {
        try {
            existingApps = JSON.parse('[' + dataMatch[1] + ']');
            console.log(`Found ${existingApps.length} existing applications\n`);
        } catch (e) {
            console.error('Could not parse existing applications');
            process.exit(1);
        }
    }
}

// Role extraction function (same as in job_catalog_updater.js)
function extractRole(subject, snippet = '') {
    let role = 'Unknown Role';

    const rolePatterns = [
        /(?:application|applied)\s+(?:for|to)\s+(?:the\s+)?(?:position\s+of\s+)?(.+?)(?:\s+(?:at|with|position|role|job)|$)/i,
        /(?:position|role|job)\s*:\s*(.+?)(?:\s+(?:at|with|-)|$)/i,
        /-\s+(.+?)\s+(?:application|position|role)/i,
        /as\s+(?:a\s+)?(.+?)(?:\s+(?:at|with)|$)/i,
        /((?:senior|sr|lead|staff|principal|junior|jr|associate|entry[\s-]level)\s+(?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer))/i,
        /((?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer)(?:\s+[-,]\s+.+)?)/i,
        /^(.+?)\s+at\s+\w+/i,
    ];

    for (const pattern of rolePatterns) {
        const match = subject.match(pattern);
        if (match && match[1]) {
            let extractedRole = match[1].trim();

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

    // Try snippet if still unknown
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

    // Capitalize properly
    if (role !== 'Unknown Role') {
        role = role.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    return role;
}

// Process each account
let updatedCount = 0;
for (const account of accounts) {
    const email = account.email;
    const tokenPath = path.join(__dirname, 'config', `token_${email}.json`);

    if (!fs.existsSync(tokenPath)) {
        console.log(`Skipping ${email} - no token file found`);
        continue;
    }

    console.log(`\nProcessing ${email}...`);

    const auth = new google.auth.GoogleAuth({
        keyFile: tokenPath,
        scopes: ['https://www.googleapis.com/auth/gmail.readonly']
    });

    const gmail = google.gmail({ version: 'v1', auth: await auth.getClient() });

    // Fetch emails from last 30 days
    const query = 'newer_than:30d';
    console.log(`Fetching emails with query: ${query}`);

    const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} emails`);

    // Create a map of company -> subject/snippet for matching
    const emailData = {};

    for (const msg of messages) {
        const details = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id
        });

        const headers = details.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const snippet = details.data.snippet || '';

        // Extract company name (simplified)
        let company = 'Unknown';
        if (from.includes('<')) {
            const namePart = from.split('<')[0].trim();
            company = namePart.replace(/"/g, '').replace('Recruiting', '').replace('Careers', '').replace('Team', '').trim();
        } else {
            company = from;
        }

        // Extract from subject patterns too
        const thankYouMatch = subject.match(/Thank you for applying to (.+)/i);
        if (thankYouMatch) {
            let extracted = thankYouMatch[1].trim();
            if (extracted.endsWith('!')) extracted = extracted.slice(0, -1);
            if (extracted.endsWith('.')) extracted = extracted.slice(0, -1);
            company = extracted;
        }

        const companyKey = company.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!emailData[companyKey]) {
            emailData[companyKey] = { subject, snippet, company };
        }
    }

    // Update roles for existing applications
    for (const app of existingApps) {
        if (app.account !== email.split('@')[0]) continue;

        const companyKey = app.company.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchingEmail = emailData[companyKey];

        if (matchingEmail && (app.role === 'Unknown Role' || app.role.includes('Unknown'))) {
            const newRole = extractRole(matchingEmail.subject, matchingEmail.snippet);
            if (newRole !== 'Unknown Role' && newRole !== app.role) {
                console.log(`  ${app.company}: "${app.role}" -> "${newRole}"`);
                app.role = newRole;
                updatedCount++;
            }
        }
    }
}

console.log(`\n✓ Updated ${updatedCount} role(s)\n`);

// Write back to HTML
if (updatedCount > 0) {
    const templatePath = path.join(__dirname, 'catalog_template.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    const lastUpdated = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const appData = existingApps.map(app => {
        const data = {
            company: app.company,
            role: app.role,
            date: app.date,
            account: app.account,
            status: app.status
        };
        if (app.interviewRequestedDate) {
            data.interviewRequestedDate = app.interviewRequestedDate;
        }
        return data;
    });

    template = template.replace(
        'const applications = [];',
        `const applications = ${JSON.stringify(appData, null, 2)};`
    );

    template = template.replace(
        'const lastUpdated = "";',
        `const lastUpdated = "${lastUpdated}";`
    );

    fs.writeFileSync(CATALOG_FILE, template);
    console.log(`Saved to ${CATALOG_FILE}`);
} else {
    console.log('No updates needed.');
}

console.log('\n===== UPDATE COMPLETE =====');
