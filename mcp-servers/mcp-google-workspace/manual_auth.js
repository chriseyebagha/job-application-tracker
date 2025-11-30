#!/usr/bin/env node

import { readFileSync } from 'fs';
import { google } from 'googleapis';
import http from 'http';
import { spawn } from 'child_process';
import url from 'url';

const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/calendar'
];

const REDIRECT_URI = 'http://localhost:4100/code';

async function authenticate() {
  try {
    // Read credentials
    const gauthContent = readFileSync('.gauth.json', 'utf8');
    const gauth = JSON.parse(gauthContent);
    const credentials = gauth.installed;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      REDIRECT_URI
    );

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });

    console.log('\n🔐 Opening browser for authentication...\n');
    console.log('If browser doesn\'t open, visit this URL:\n');
    console.log(authUrl + '\n');

    // Open browser
    spawn('open', [authUrl]);

    // Start local server to receive callback
    const server = http.createServer(async (req, res) => {
      const queryObject = url.parse(req.url, true).query;

      if (queryObject.code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>✅ Authentication successful!</h1><p>You can close this window and return to your terminal.</p>');

        // Exchange code for tokens
        try {
          const { tokens } = await oauth2Client.getToken(queryObject.code);
          oauth2Client.setCredentials(tokens);

          // Save tokens
          const fs = await import('fs');
          const accountsContent = fs.readFileSync('.accounts.json', 'utf8');
          const accounts = JSON.parse(accountsContent);
          const email = accounts.accounts[0].email;

          const tokenFile = `.oauth2.${email}.json`;
          fs.writeFileSync(tokenFile, JSON.stringify({
            type: 'authorized_user',
            client_id: credentials.client_id,
            client_secret: credentials.client_secret,
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expiry_date: tokens.expiry_date
          }, null, 2));

          console.log('\n✅ Authentication successful!');
          console.log(`📁 Tokens saved to: ${tokenFile}`);
          console.log('\nYou can now use the Gmail and Calendar MCP tools!\n');

          server.close();
          process.exit(0);
        } catch (error) {
          console.error('❌ Error exchanging code for tokens:', error.message);
          server.close();
          process.exit(1);
        }
      }
    });

    server.listen(4100, () => {
      console.log('🌐 Waiting for OAuth callback on http://localhost:4100/code\n');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

authenticate();
