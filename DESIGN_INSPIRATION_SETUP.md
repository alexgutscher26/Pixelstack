# Design Inspiration System Setup

## Overview
The design inspiration system fetches trending design patterns from Dribbble to provide conceptual inspiration to the AI, helping it generate better, more modern designs.

## ⚠️ Important Legal Notes

### What This System Does (Legal & Safe):
✅ Fetches design **metadata** (titles, descriptions, tags, colors)  
✅ Extracts **design patterns** (layout types, style trends)  
✅ Provides **text-based inspiration** to AI  
✅ Uses **official Dribbble API**  
✅ Respects **rate limits** and terms of service  

### What This System Does NOT Do:
❌ Display Dribbble shots in our app  
❌ Copy or replicate specific designs  
❌ Store or cache Dribbble images  
❌ Build a competing design gallery  
❌ Scrape data outside the API  

**This system only uses design trends as conceptual inspiration - it never copies actual designs.**

## Setup Instructions

### 1. Get Dribbble API Access Token

1. Go to [Dribbble Applications](https://dribbble.com/account/applications/new)
2. Register a new application:
   - **Name**: Your app name (e.g., "Pixelstack Design Generator")
   - **Description**: "AI design generation tool that uses Dribbble trends for inspiration"
   - **Website URL**: Your website URL
   - **Callback URL**: Not needed for this use case
3. After registration, you'll receive an **Access Token**
4. Copy the access token

### 2. Add Environment Variable

Add the following to your `.env` file:

```bash
DRIBBBLE_ACCESS_TOKEN=your_access_token_here
```

### 3. Verify Setup

The system will automatically:
- Fetch trending designs when generating new projects
- Extract design patterns (colors, styles, layouts)
- Provide inspiration text to the AI
- Fall back to default best practices if API is unavailable

## How It Works

### 1. Fetch Trending Shots
```typescript
// Fetches 12 popular shots from Dribbble
const shots = await fetchTrendingShots("website", 12);
```

### 2. Extract Patterns
```typescript
// Analyzes metadata to identify:
// - Layout types (hero, dashboard, card-grid)
// - Style keywords (minimalist, gradient, glassmorphism)
// - Common elements (navigation, buttons, cards)
// - Popular colors
```

### 3. Generate Inspiration Text
```typescript
// Creates text-based inspiration:
"CURRENT DESIGN TRENDS:
- Popular styles: minimalist, gradient, glassmorphism
- Common layouts: hero-section, card-grid
- Trending elements: large hero images, feature cards
- Popular colors: #FF6B6B, #4ECDC4, #45B7D1"
```

### 4. Provide to AI
The inspiration text is added to the AI prompt, helping it understand current design trends without copying specific designs.

## Rate Limits

- **60 requests per minute** per authenticated user
- **1,440 requests per day** per authenticated user

The system is designed to stay well within these limits:
- Only fetches inspiration for **new projects** (not regenerations)
- Fetches only **12 shots** per request
- Caches results when possible

## Fallback Behavior

If the Dribbble API is unavailable or the token is not set:
- System falls back to **general design best practices**
- AI still generates high-quality designs
- No errors or interruptions to user experience

## Testing

To test if the system is working:

```bash
# Check if environment variable is set
echo $DRIBBBLE_ACCESS_TOKEN

# Test API access (replace TOKEN with your token)
curl -H "Authorization: Bearer TOKEN" https://api.dribbble.com/v2/user
```

## Benefits

1. **Better Designs**: AI learns from current design trends
2. **Modern Aesthetics**: Designs reflect what's popular now
3. **Variety**: More diverse design outputs
4. **Legal & Safe**: Only uses metadata, never copies designs
5. **Automatic**: Works seamlessly in the background

## Privacy & Security

- Access token is stored securely in environment variables
- Never exposed to client-side code
- Only used server-side in Inngest functions
- No user data is sent to Dribbble

## Troubleshooting

### "DRIBBBLE_ACCESS_TOKEN not set" warning
- Add the token to your `.env` file
- Restart your development server

### "Dribbble API error: 401"
- Your access token is invalid or expired
- Generate a new token from Dribbble

### "Dribbble API error: 429"
- Rate limit exceeded
- Wait for the rate limit to reset (shown in response headers)
- System will automatically fall back to default inspiration

## Legal Compliance

This system complies with:
- ✅ Dribbble API Terms of Service
- ✅ Dribbble Terms & Guidelines
- ✅ Copyright law (no copying of actual designs)
- ✅ Fair use principles (inspiration only)

**Reference**: [Dribbble API Terms](https://developer.dribbble.com/terms/)

## Future Enhancements

Potential improvements:
- Cache inspiration data to reduce API calls
- Support for category-specific inspiration (e.g., "SaaS", "E-commerce")
- Integration with other design platforms (Behance, Awwwards)
- User preference for inspiration sources
