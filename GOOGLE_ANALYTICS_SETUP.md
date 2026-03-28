# Google Analytics Setup Guide

## Overview
Your Student Help Tool now includes Google Analytics integration to track user visits, page views, and feature usage.

## Google Analytics Measurement ID
**Measurement ID: G-MY48Y5CKC6**

## What's Being Tracked

### 1. **Page Views**
- Automatic tracking of all page visits
- User journey across the application
- Time spent on each page
- Page entry and exit rates

### 2. **Feature Usage**
- Cover Letter AI generation events
- Tool usage (Copy, Download operations)
- Feature success/failure tracking
- Tool interaction events

### 3. **User Behavior**
- Real-time user count
- User demographics
- Device information
- Geographic location
- Browser and OS information

## Implementation Details

### Files Added/Modified
1. **index.html** - Google Analytics script tag with your measurement ID
2. **src/lib/gaConfig.ts** - Centralized analytics configuration
3. **src/lib/usePageTracking.ts** - React hook for automatic page tracking
4. **src/lib/analytics.ts** - Enhanced with page view tracking
5. **.env.example** - Added VITE_GA_MEASUREMENT_ID variable
6. **src/App.tsx** - Integrated PageTracker component

### How It Works

#### Automatic Page View Tracking
```javascript
// Automatically triggers when user navigates to a new page
- Page path is recorded
- Page title is captured
- Timestamp is logged
```

#### Custom Event Tracking
```javascript
import { trackAiFeature, trackToolUsage } from './lib/analytics';

// Track AI feature usage
trackAiFeature('cover_letter_generation', true);

// Track tool actions
trackToolUsage('cover_letter_generator', 'copy');
```

## Viewing Your Analytics

### Access Google Analytics Dashboard
1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Select your property
4. Navigate to your reports

### Key Reports to Check
1. **Real-time Dashboard** - See active users right now
2. **Pages & Screens** - Most popular pages
3. **User Journey** - How users navigate your app
4. **Events** - Custom event tracking (feature usage)
5. **Geography** - Where your users are from

## Event Categories Being Tracked

| Event Type | Description | Example |
|-----------|-------------|---------|
| `page_view` | User visits a page | Home, /ai/cover-letter |
| `ai_feature` | AI feature executed | cover_letter_generation |
| `tool_usage` | Tool interaction | copy, download |
| `cover_letter_copy` | Copy button clicked | Copy to clipboard |
| `cover_letter_download` | Download button clicked | Export as file |

## Environment Configuration

### Using Environment Variables (Optional)
If you want to change the measurement ID in the future:

```bash
# In .env file
VITE_GA_MEASUREMENT_ID=G-YOUR-NEW-ID
```

The app will automatically load this ID instead of the hardcoded one.

## Testing Analytics

### In Development
```javascript
// Analytics logs will appear in browser console
// Example output:
// [Analytics] { type: 'page_view', page: 'Home', timestamp: '2026-03-28T...' }
```

### In Production
1. Visit your website: https://yourdomain.com
2. Open Google Analytics Debug View
3. See real-time tracking data
4. Generate some events (click buttons, navigate pages)
5. Check dashboard after 24-48 hours for full report generation

## Privacy Considerations

### Data Protection
- ✅ IP anonymization enabled
- ✅ No personal data collected
- ✅ Compliant with GDPR basics
- ✅ Anonymous user identification

### Cookies
- GA uses first-party cookies for tracking
- Users should be informed via cookie policy
- Consider adding cookie consent banner

## Troubleshooting

### Analytics Not Showing Data
1. **Check Measurement ID** - Ensure G-MY48Y5CKC6 is correct
2. **Verify Script Loading** - Check browser console for errors
3. **Check Filters** - GA might be filtering out your IP
4. **Wait 24 Hours** - Initial data takes time to process

### Data Takes a While to Appear
- Real-time events show immediately
- Historical reports: 24-48 hours delay
- This is normal GA behavior

## Next Steps

1. **Create Custom Dashboards** - Set up personalized reports
2. **Set Goals/Conversions** - Track important actions
3. **Add Alerts** - Get notified of traffic spikes
4. **Create Audiences** - Segment users by behavior
5. **Integrate with Google Search Console** - Track SEO performance

## Support

For more information about Google Analytics:
- [Google Analytics Documentation](https://support.google.com/analytics)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/10089681)
- [Event Tracking Guide](https://support.google.com/analytics/answer/9216061)

---

**Measurement ID:** G-MY48Y5CKC6  
**Last Updated:** March 28, 2026  
**Analytics Provider:** Google Analytics 4
