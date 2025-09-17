# Supabase Configuration Diagnostic

## Issues Identified:

### 1. **Environment Variable Mismatch**
- **Server-side**: Uses `process.env.VITE_SUPABASE_URL` and `process.env.VITE_SUPABASE_ANON_KEY`
- **Client-side**: Uses `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
- **Problem**: Server-side should use different env var names for deployment

### 2. **Missing Environment Variables**
- No `.env` file exists in the project
- Deployed version likely doesn't have env vars set

### 3. **Database Connection Issues**
- RLS policies blocking access
- UUID extension not enabled
- Tables might not exist in deployed database

## Solutions:

### Step 1: Fix Environment Variables
Create `.env` file with your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Fix Server-side Environment Variables
Update `app/utils/supabase.server.ts` to use proper server env vars:
```typescript
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
```

### Step 3: Run Database Setup
Execute the migration files in your Supabase dashboard:
1. `20250224170000_create_therapists_table.sql`
2. `20250224170001_insert_initial_data.sql`

### Step 4: Fix RLS Policies
Run the RLS fix script in Supabase SQL Editor.

## Deployment Checklist:
- [ ] Environment variables set in deployment platform
- [ ] Database migrations executed
- [ ] RLS policies disabled
- [ ] UUID extension enabled
- [ ] Tables created with data
