# Scripts Directory

This directory contains utility scripts organized by purpose for better maintainability.

## 📁 Directory Structure

### `/testing/` - Test and Diagnostic Scripts
- **`test-printing.js`** - Test PrintNode integration and printing functionality
- **`test-db-connection.js`** - Test Supabase database connection and basic operations
- **`check-supabase-tables.js`** - Comprehensive database table inspection and validation

### `/config/` - Configuration Files
- **`postcss.config.js`** - PostCSS configuration for Tailwind CSS

## 🚀 Usage

### Testing Scripts

```bash
# Test database connection
node scripts/testing/test-db-connection.js

# Test printing functionality
node scripts/testing/test-printing.js

# Check database tables and structure
node scripts/testing/check-supabase-tables.js
```

### Configuration

The PostCSS config is automatically used by the build system. No manual intervention needed.

## 🔧 What Each Script Does

### `test-db-connection.js`
- Verifies Supabase connection
- Tests basic CRUD operations
- Checks environment variables
- Validates table structure

### `test-printing.js`
- Tests PrintNode service initialization
- Fetches available printers
- Tests print job creation
- Validates printing workflow

### `check-supabase-tables.js`
- Comprehensive table inspection
- Column type validation
- Data integrity checks
- Performance analysis
- RLS policy verification

## 📋 Prerequisites

All testing scripts require:
- `.env.local` file with Supabase credentials
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- For printing tests: `PRINTNODE_API_KEY` environment variable

## 🐛 Troubleshooting

- **Connection errors**: Check your `.env.local` file
- **Permission errors**: Ensure RLS policies are properly configured
- **Printing errors**: Verify PrintNode API key and printer setup
