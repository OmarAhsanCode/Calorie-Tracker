# Google Authentication Setup Instructions

This document provides step-by-step instructions for setting up Google Authentication for the Hill Calories AI application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Environment Variables](#environment-variables)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment](#production-deployment)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- A Google account
- Access to Google Cloud Console
- Node.js and npm installed locally
- The Hill Calories AI application running locally

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "hill-calories-ai")
5. Click "Create"

### Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Sign-In API"
3. Click on "Google+ API" and then click "Enable"
4. Also enable "Google Identity and Access Management (IAM) API" if prompted

### Step 3: Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Hill Calories AI
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: Your domain (e.g., hillcalories.com)
   - **Authorized domains**: Add your domain(s)
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Save and Continue" (default scopes are sufficient)
7. On the "Test users" page, add test email addresses if in development mode
8. Review and click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Enter a name for your OAuth client (e.g., "Hill Calories AI Web Client")
5. Add Authorized JavaScript origins:
   - For local development: `http://localhost:3000`, `http://localhost:3003`, `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - For local development: `http://localhost:3000`, `http://localhost:3003`, `http://localhost:5173`
   - For production: `https://yourdomain.com`
7. Click "Create"
8. Copy the **Client ID** - you'll need this for the environment variables

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Optional: For development/staging
VITE_APP_ENV=development
```

### Required Environment Variables

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth 2.0 Client ID | `123456789-abcdefg.apps.googleusercontent.com` |

**Important Notes:**
- The `VITE_` prefix is required for Vite to expose the variable to the client-side code
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file

## Local Development Setup

### Step 1: Install Dependencies

The required dependencies should already be installed. If not, run:

```bash
npm install google-auth-library js-cookie
```

### Step 2: Configure Environment Variables

1. Create a `.env` file in your project root
2. Add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
   ```

### Step 3: Update Authorized Origins

In Google Cloud Console, ensure your local development URLs are added:
- `http://localhost:3000`
- `http://localhost:3003` (Your current dev server)
- `http://localhost:5173` (Vite default)
- Any other local ports you're using

### Step 4: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Open your browser to `http://localhost:3000` (or the port shown in your terminal)
3. Click the "Login" button
4. You should see the Google authentication modal

## Production Deployment

### Step 1: Update OAuth Settings

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Edit your OAuth 2.0 client
3. Add your production domain to:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com`

### Step 2: Environment Variables for Production

Set the environment variable in your hosting platform:

**Vercel:**
```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

**Netlify:**
```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

**Other platforms:**
Follow your hosting provider's documentation for setting environment variables.

### Step 3: Build and Deploy

```bash
npm run build
```

Deploy the built files to your hosting platform.

## Testing the Integration

### Test Cases

1. **Login Flow:**
   - Click "Login" button
   - Google authentication modal appears
   - Select Google account
   - Successfully redirected to home page
   - User profile shows in navigation

2. **Logout Flow:**
   - Click "Logout" button
   - User is signed out
   - "Login" button appears again

3. **Session Persistence:**
   - Login to the application
   - Refresh the page
   - User should remain logged in

4. **Cross-Tab Behavior:**
   - Login in one tab
   - Open application in another tab
   - User should be logged in automatically

## Troubleshooting

### Common Issues

**1. "Google Sign-In not loaded yet" Error**
- **Cause**: Google's JavaScript library hasn't loaded
- **Solution**: Check internet connection and ensure the script is loading from `https://accounts.google.com/gsi/client`

**2. "Invalid Client ID" Error**
- **Cause**: Incorrect or missing client ID
- **Solution**: Verify `VITE_GOOGLE_CLIENT_ID` in your `.env` file matches the one from Google Cloud Console

**3. "redirect_uri_mismatch" Error**
- **Cause**: The domain you're accessing doesn't match authorized origins
- **Solution**: Add your current domain to Authorized JavaScript origins in Google Cloud Console

**4. "Access Blocked" Error**
- **Cause**: OAuth consent screen not configured or app not verified
- **Solution**: Complete OAuth consent screen setup and add test users during development

**5. Modal Doesn't Close After Login**
- **Cause**: Authentication state not updating properly
- **Solution**: Check browser console for errors and ensure the authentication context is working

### Debug Steps

1. **Check Environment Variables:**
   ```javascript
   console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
   ```

2. **Verify Google Script Loading:**
   ```javascript
   console.log('Google object:', window.google)
   ```

3. **Check Authentication State:**
   ```javascript
   // In browser console
   console.log('Auth state:', JSON.parse(localStorage.getItem('hill_calories_user')))
   ```

### Getting Help

- [Google Identity Documentation](https://developers.google.com/identity)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Troubleshooting](https://developers.google.com/identity/protocols/oauth2/web-server#troubleshooting)

## Security Considerations

1. **Client ID Exposure**: The client ID is exposed to the frontend, which is normal and expected for web applications
2. **Token Storage**: User authentication tokens are stored in secure HTTP-only cookies when possible
3. **HTTPS**: Always use HTTPS in production for secure token transmission
4. **Domain Restrictions**: Properly configure authorized domains to prevent unauthorized usage

## Future Enhancements

Once Google Authentication is working, you can:
1. Integrate with Supabase for user data storage
2. Add user profile management
3. Implement nutrition history tracking
4. Add social features
5. Implement offline capabilities with service workers

---

**Need Help?** If you encounter issues not covered in this guide, please check the browser developer console for error messages and refer to the Google Identity documentation.
