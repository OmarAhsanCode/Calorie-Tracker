# Calorie Tracker App Setup Instructions

## Database Setup Complete! ✅

Your Supabase database has been successfully created with the following structure:

### Tables Created:
1. **profiles** - User profile information (age, weight, goals, etc.)
2. **food_items** - Database of food items with nutritional information (26 items pre-loaded)
3. **food_entries** - User's daily food intake logs
4. **weight_logs** - User's weight tracking over time

### Security Features:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Proper authentication integration with Google Auth

## What Happens When Users Sign Up:

1. **First Time Login**: User signs in with Google → Sees onboarding form
2. **Onboarding Form**: Collects user's basic info, physical stats, activity level, and goals
3. **Automatic Setup**: 
   - Creates user profile in database
   - Calculates personalized daily calorie goal
   - Logs initial weight
4. **Ready to Use**: User can start tracking their food and calories!

## Environment Variables Needed:

Copy `.env.example` to `.env` and fill in:

```env
# Google OAuth (you already have this)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Supabase (get these from your Supabase dashboard)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Your Supabase Credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "Project API keys" (anon/public key)

## Features Now Available:

### ✅ Completed:
- Complete database structure
- User authentication with Google
- Onboarding flow for new users
- Profile management
- Data security with RLS

### 🚧 Ready to Build:
- Food logging interface
- Daily calorie tracking
- Weight progress charts
- Nutrition analysis integration
- Goal tracking and progress

Your app is now ready for users to sign up and start their calorie tracking journey!
