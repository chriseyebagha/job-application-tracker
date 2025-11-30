# 🤖 LLM Setup Instructions

**FOR AI ASSISTANTS:**
If you are an AI assistant helping a user set up this repository, your first task is to **personalize the codebase** by replacing the template tokens with the user's actual information.

## 📝 Personalization Steps

Ask the user for the following information if you don't already know it:
1.  **Full Name** (for license and display)
2.  **System Username** (run `whoami` to find this)
3.  **Email Address** (to configure the Gmail integration)

Then, perform the following global replacements across all files in the repository:

| Token | Replacement Value | Description |
| :--- | :--- | :--- |
| `{{USER_NAME}}` | User's Full Name | e.g., "Jane Doe" |
| `{{USER_SYSTEM_USERNAME}}` | System Username | e.g., "janedoe" (from `whoami`) |
| `{{USER_EMAIL_PREFIX}}` | Email Username | e.g., "jane.doe" (part before @gmail.com) |
| `{{RECRUITER_NAME_EXAMPLE}}` | "Recruiter Name" | Keep as generic example or replace if user has specific preference |
| `{{COMPANY_NAME_EXAMPLE}}` | "Company Name" | Keep as generic example |

## 📂 File Renaming

You must also rename the following file to match the user's system:

*   **Old Name:** `job-catalog-automation/com.user.jobcatalog.plist`
*   **New Name:** `job-catalog-automation/com.{{USER_SYSTEM_USERNAME}}.jobcatalog.plist`

## 🚀 Verification

After replacement, verify that:
1.  `job_applications.html` contains the user's correct email prefix in the `account` fields.
2.  `Refresh Job Catalog.command` points to the correct absolute path on the user's system.
3.  The `plist` file contains the correct absolute paths.

Once personalized, proceed with the standard setup instructions in `README.md`.
