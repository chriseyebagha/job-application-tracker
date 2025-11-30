#!/usr/bin/env node

import { GAuthService } from './dist/services/gauth.js';

const config = {
  gauthFile: './.gauth.json',
  accountsFile: './.accounts.json',
  credentialsDir: '.'
};

const gauth = new GAuthService(config);

async function authenticate() {
  try {
    console.log('Initializing OAuth client...');
    await gauth.initialize();
    
    console.log('Getting accounts...');
    const accounts = await gauth.getAccountInfo();
    
    if (accounts.length === 0) {
      console.error('No accounts found in .accounts.json');
      process.exit(1);
    }
    
    const email = accounts[0].email;
    console.log(`Authenticating for: ${email}`);
    
    // Check for existing credentials
    let credentials = await gauth.getStoredCredentials(email);
    
    if (!credentials) {
      console.log('No stored credentials found. Starting OAuth flow...');
      const authUrl = await gauth.getAuthorizationUrl(email, {});
      console.log(`\nPlease visit this URL to authorize:\n${authUrl}\n`);
      
      // You'll need to manually complete the flow and the server will handle the callback
      console.log('Waiting for OAuth callback on http://localhost:4100/code');
    } else {
      console.log('Credentials already exist!');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

authenticate();
