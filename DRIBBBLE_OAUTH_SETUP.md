# Dribbble OAuth Setup Guide

## Overview

Connect your Dribbble account to fetch real-time design trends and inspiration for AI-generated designs.

## Benefits of Connecting Dribbble

✅ **Real-time design trends** - Get the latest popular designs  
✅ **Fresh inspiration** - AI learns from current Dribbble shots  
✅ **Better designs** - More variety and modern aesthetics  
✅ **Automatic updates** - Always uses trending patterns  

## Setup Instructions

### Step 1: Register Your Application on Dribbble

1. Go to [Dribbble Applications](https://dribbble.com/account/applications/new)

2. Fill in the registration form:

   ```
   Name: Pixelstack (or your app name)
   Description: AI design generation tool that uses Dribbble trends for inspiration
   Website URL: https://yourdomain.com (or http://localhost:3000 for development)
   Callback URL: https://yourdomain.com/api/dribbble/callback
   ```

3. **Important**: The Callback URL must be:
   - **Production**: `https://yourdomain.com/api/dribbble/callback`
   - **Development**: `http://localhost:3000/api/dribbble/callback`

4. Click "Register application"

5. You'll receive:
   - **Client ID** (e.g., `abc123def456...`)
   - **Client Secret** (e.g., `xyz789uvw012...`)

### Step 2: Add Credentials to Environment Variables

Add these to your `.env` file:

```bash
# Dribbble OAuth Credentials
DRIBBBLE_CLIENT_ID=your_client_id_here
DRIBBBLE_CLIENT_SECRET=your_client_secret_here

# Your app URL (for OAuth callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL in production
```

**Example**:

```bash
DRIBBBLE_CLIENT_ID=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
DRIBBBLE_CLIENT_SECRET=xyz789uvw012abc345def678ghi901jkl234mno567pqr890st
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Update Database Schema

Run Prisma migration to add the Settings table:

```bash
npx prisma generate
npx prisma db push
```

This creates the `Setting` model for storing the OAuth token.

### Step 4: Connect Dribbble Account

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the admin settings page:

   ```
   http://localhost:3000/admin/settings
   ```

3. Click **"Connect Dribbble Account"**

4. You'll be redirected to Dribbble's authorization page

5. Click **"Authorize"** to grant access

6. You'll be redirected back to your app with a success message

7. ✅ **Done!** Your app is now connected to Dribbble

## How It Works

### OAuth Flow

```
1. User clicks "Connect Dribbble"
   ↓
2. Redirected to /api/dribbble/connect
   ↓
3. Redirected to Dribbble authorization page
   ↓
4. User authorizes the app
   ↓
5. Dribbble redirects to /api/dribbble/callback with code
   ↓
6. App exchanges code for access token
   ↓
7. Token is stored in database
   ↓
8. ✅ Connected! App can now fetch design trends
```

### Design Inspiration Flow

```
1. User creates a new project
   ↓
2. System checks for Dribbble token in database
   ↓
3. If token exists:
   - Fetches 12 popular shots from Dribbble API
   - Extracts design patterns (colors, styles, layouts)
   - Generates inspiration text for AI
   ↓
4. If no token:
   - Uses curated design trends (fallback)
   ↓
5. AI receives inspiration and generates design
```

## API Endpoints

### `/api/dribbble/connect` (GET)

Initiates OAuth flow by redirecting to Dribbble authorization page.

### `/api/dribbble/callback` (GET)

Receives authorization code from Dribbble and exchanges it for access token.

**Query Parameters**:

- `code` - Authorization code from Dribbble
- `state` - CSRF protection token

### `/api/dribbble/status` (GET)

Checks if Dribbble is connected.

**Response**:

```json
{
  "connected": true
}
```

### `/api/dribbble/disconnect` (POST)

Removes stored Dribbble token.

**Response**:

```json
{
  "success": true
}
```

## Admin Settings Page

Access at: `/admin/settings`

Features:

- ✅ View connection status
- ✅ Connect Dribbble account
- ✅ Disconnect Dribbble account
- ✅ Setup instructions
- ✅ Success/error notifications

## Troubleshooting

### "Dribbble credentials not configured"

**Solution**: Add `DRIBBBLE_CLIENT_ID` and `DRIBBBLE_CLIENT_SECRET` to `.env`

### "Redirect URI mismatch"

**Solution**: Make sure the Callback URL in Dribbble matches exactly:

- Development: `http://localhost:3000/api/dribbble/callback`
- Production: `https://yourdomain.com/api/dribbble/callback`

### "Token exchange failed"

**Solution**:

- Check that Client ID and Client Secret are correct
- Verify environment variables are loaded (restart server)
- Check Dribbble application status

### "No authorization code received"

**Solution**: User may have denied authorization. Try connecting again.

### Connection shows "Not connected" after authorizing

**Solution**:

- Check database connection
- Verify Prisma schema is up to date (`npx prisma generate`)
- Check server logs for errors

## Security Best Practices

✅ **Never commit credentials** - Keep `.env` in `.gitignore`  
✅ **Use HTTPS in production** - Required for OAuth  
✅ **Rotate secrets regularly** - Generate new credentials periodically  
✅ **Validate state parameter** - Prevents CSRF attacks  
✅ **Store tokens securely** - Database with proper access controls  

## Rate Limits

Dribbble API limits:

- **60 requests per minute** per authenticated user
- **1,440 requests per day** per authenticated user

Our implementation:

- Fetches inspiration only for **new projects** (not regenerations)
- Fetches only **12 shots** per request
- Well within rate limits for normal usage

## Fallback Behavior

If Dribbble is not connected or API fails:

- ✅ System automatically uses **curated design trends**
- ✅ No errors or interruptions
- ✅ AI still generates high-quality designs
- ✅ Seamless user experience

## Testing

### Test OAuth Flow

1. Clear any existing tokens:

   ```bash
   # In your database, delete from Setting table
   ```

2. Go to `/admin/settings`

3. Click "Connect Dribbble Account"

4. Authorize on Dribbble

5. Verify success message appears

6. Check status shows "Connected"

### Test Design Generation

1. Create a new project

2. Check server logs for:

   ```
   Fetched 12 shots from Dribbble API
   ```

3. Verify AI receives inspiration in prompt

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
DRIBBBLE_CLIENT_ID=your_production_client_id
DRIBBBLE_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Callback URL

Update Dribbble application settings:

```
Callback URL: https://yourdomain.com/api/dribbble/callback
```

### Database

Ensure `Setting` table exists:

```bash
npx prisma migrate deploy
```

## Monitoring

Check these logs to monitor Dribbble integration:

```bash
# Successful connection
"Dribbble OAuth successful, token stored"

# Fetching inspiration
"Fetched 12 shots from Dribbble API"

# Fallback
"No Dribbble access token found, using curated trends"

# Errors
"Dribbble API error: 401" # Token expired or invalid
"Dribbble API error: 429" # Rate limit exceeded
```

## FAQ

**Q: Do I need to connect Dribbble?**  
A: No, it's optional. The system works with curated trends if not connected.

**Q: Can multiple users connect their Dribbble accounts?**  
A: Currently, one Dribbble account per application. The token is shared across all users.

**Q: What happens if the token expires?**  
A: Dribbble tokens don't expire, but if revoked, the system falls back to curated trends.

**Q: Can I use this in development and production?**  
A: Yes, register separate applications for each environment with different callback URLs.

**Q: Is this legal and safe?**  
A: Yes, we use the official Dribbble API and only extract metadata (not actual designs).

## Support

For issues or questions:

1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test OAuth flow in development first
4. Check Dribbble API status: <https://dribbble.com/api>

## Summary

✅ **Easy setup** - Just 4 steps  
✅ **Secure** - OAuth 2.0 standard  
✅ **Reliable** - Automatic fallback  
✅ **Legal** - Official API usage  
✅ **Optional** - Works without connection  

Connect Dribbble to get the best AI-generated designs with real-time inspiration! 🎨
