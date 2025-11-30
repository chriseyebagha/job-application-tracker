import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Helper to check Google Calendar for interview events
export const checkCalendarForInterviews = async (auth, companyName) => {
    const calendar = google.calendar({ version: 'v3', auth });

    try {
        // Search for events in the next 60 days
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            q: companyName,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const interviews = (res.data.items || []).filter(event => {
            const summary = (event.summary || '').toLowerCase();
            const description = (event.description || '').toLowerCase();

            return summary.includes('interview') ||
                summary.includes('screen') ||
                summary.includes('call') ||
                description.includes('interview');
        });

        if (interviews.length > 0) {
            const firstInterview = interviews[0];
            const interviewDate = firstInterview.start?.dateTime || firstInterview.start?.date;
            return {
                hasInterview: true,
                interviewDate: new Date(interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                eventSummary: firstInterview.summary
            };
        }

        return { hasInterview: false };
    } catch (error) {
        console.error(`Error checking calendar for ${companyName}:`, error.message);
        return { hasInterview: false };
    }
};

// Helper to extract interview date from calendar invitation in email
export const extractInterviewDateFromEmail = (subject, snippet) => {
    // Match patterns like "Mon Dec 1, 2025", "Dec 1, 2025", etc.
    const datePatterns = [
        /(\w{3,9}\s+\w{3,9}\s+\d{1,2},?\s+\d{4})/i,  // Mon Dec 1, 2025
        /(\w{3,9}\s+\d{1,2},?\s+\d{4})/i,             // Dec 1, 2025
        /@\s+(\w{3,9}\s+\d{1,2},?\s+\d{4})/i,        // @ Dec 1, 2025
    ];

    const fullText = subject + ' ' + snippet;

    for (const pattern of datePatterns) {
        const match = fullText.match(pattern);
        if (match) {
            try {
                const date = new Date(match[1]);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
            } catch (e) {
                continue;
            }
        }
    }

    return null;
};
