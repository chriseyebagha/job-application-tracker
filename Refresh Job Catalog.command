#!/bin/bash
echo "🔄 Refreshing Job Catalog..."
cd "/Users/{{USER_SYSTEM_USERNAME}}/Documents/Projects/Personal Agent/job-catalog-automation"
/opt/homebrew/bin/node job_catalog_updater.js
echo "✅ Done! You can close this window."
# Keep window open for a moment
read -t 5 -p "Closing in 5 seconds..."
