#!/usr/bin/env node
// Quick test script to validate role extraction

const testSubjects = [
    "Your application for Senior Analytics Engineer at Company Name",
    "Application for Data Analyst - Season role",
    "Thank you for applying to LaunchDarkly!",
    "Analytics Engineer (L4) - Experiences at Meta",
    "Your application for the Analytics Engineer position at Coinbase",
    "Business Intelligence Engineer - Google",
    "Data Engineer at GitLab",
    "Senior Data Analyst role - HubSpot",
    "Application received: Staff Analytics Engineer",
    "Principal Data Engineer - Netflix"
];

// Test patterns (same as in updated job_catalog_updater.js)
const rolePatterns = [
    /(?:application|applied)\s+(?:for|to)\s+(?:the\s+)?(?:position\s+of\s+)?(.+?)(?:\s+(?:at|with|position|role|job)|$)/i,
    /(?:position|role|job)\s*:\s*(.+?)(?:\s+(?:at|with|-)|$)/i,
    /-\s+(.+?)\s+(?:application|position|role)/i,
    /as\s+(?:a\s+)?(.+?)(?:\s+(?:at|with)|$)/i,
    /((?:senior|sr|lead|staff|principal|junior|jr|associate|entry[\s-]level)\s+(?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer))/i,
    /((?:analytics?|data|business\s+intelligence|bi)\s+(?:engineer|analyst|scientist|developer)(?:\s+[-,]\s+.+)?)/i,
    /^(.+?)\s+at\s+\w+/i,
];

console.log("Testing Role Extraction:\n");

testSubjects.forEach(subject => {
    let role = 'Unknown Role';

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

    // Capitalize
    if (role !== 'Unknown Role') {
        role = role.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    console.log(`Subject: ${subject}`);
    console.log(`Extracted Role: ${role}`);
    console.log('---');
});
