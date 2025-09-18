# PrintNode Setup Guide

## Issue: Nothing prints from the printer

The printing system requires a PrintNode API key to be configured. Here's how to fix it:

## Step 1: Get PrintNode API Key

1. Go to [PrintNode Dashboard](https://app.printnode.com/account/api)
2. Log in to your PrintNode account
3. Navigate to **Account > API Keys**
4. Copy your API key

## Step 2: Create Environment File

Create a `.env.local` file in your project root:

```bash
# PrintNode API Configuration
PRINTNODE_API_KEY=your_actual_api_key_here

# If you need Supabase config too:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Restart Development Server

After creating the `.env.local` file:

```bash
npm run dev
```

## Step 4: Test Printing

1. Create a new session in your app
2. The receipt should now print correctly

## Troubleshooting

### If you still get errors:

1. **Check API Key**: Make sure your PrintNode API key is correct
2. **Check Printer**: Ensure your printer is connected and online in PrintNode
3. **Check Environment**: Verify the `.env.local` file is in the project root
4. **Restart Server**: Always restart after changing environment variables

### Common Issues:

- **"PRINTNODE_API_KEY environment variable is required"**: API key not set
- **"PrintNode API error: 401"**: Invalid API key
- **"No printers found"**: No printers configured in PrintNode account

## What's Fixed

✅ **PDF Generation**: Now uses proper PDF format instead of raw text
✅ **Copy Printing**: Each copy is a separate PDF document
✅ **Lazy Loading**: PrintNode service only initializes when needed
✅ **Error Handling**: Better error messages for debugging

The receipt will now print exactly as shown in your photo with proper formatting and separate copies!
