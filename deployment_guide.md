# Vercel Deployment Guide

Since you chose to deploy and test on Vercel, follow these steps to get everything working.

## 1. Push Your Code
Ensure all your latest changes (including the Google Client ID fix) are pushed to your Git repository (GitHub, GitLab, or Bitbucket).

## 2. Import into Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `lumynz` repository.

## 3. Configure Environment Variables (CRITICAL)
Before clicking "Deploy", look for the **"Environment Variables"** section.
Add the following variable:

-   **Name**: `GEMINI_API_KEY`
-   **Value**: *[Paste your actual Gemini API Key here]*

*If you don't have a key, get one here: [Google AI Studio](https://aistudio.google.com/app/apikey)*

## 4. Deploy
Click **"Deploy"**. Vercel will build your project.
-   The build command `tsc -b && vite build` will run.
-   The `vercel.json` file I added earlier will handle the routing.

## 5. Post-Deployment Configuration (Google Login)
Once deployed, you will get a production URL (e.g., `https://lumynz.vercel.app`).
**You must update your Google Cloud Console for login to work:**

1.  Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2.  Click on your **"Lumyn Web Client"** ID.
3.  Under **Authorized JavaScript origins**, click **ADD URI**.
4.  Paste your Vercel URL (e.g., `https://lumynz.vercel.app`).
    *   *Note: Do not add a trailing slash `/`.*
5.  Click **Save**.

## 6. Test
Open your Vercel URL.
-   **Test Login**: Click "Sign in with Google".
-   **Test AI**: Go to the Mentor or Flashcards page and try generating content. It should now connect using the key you set in Vercel.
