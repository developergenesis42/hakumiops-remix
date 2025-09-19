# SQL Files Organization

This directory contains all SQL scripts organized by purpose for better maintainability.

## 📁 Directory Structure

### `/setup/` - Database Setup Scripts
- **`complete-database-setup.sql`** - Complete database schema setup (run this first)
- **`apply-session-metadata-migration.sql`** - Adds discount, WOB, and VIP columns to sessions

### `/maintenance/` - Database Maintenance Scripts
- **`fix-rls-policies.sql`** - Comprehensive RLS policy fixes for deployed instances
- **`fix-rls-only.sql`** - Quick RLS disable script

### `/diagnostics/` - Database Diagnostic Scripts
- **`check-database-types.sql`** - Check actual column types and structure

### `/supabase/migrations/` - Supabase Migration Files
- **13 migration files** - Chronological database changes (managed by Supabase CLI)

## 🚀 Quick Start

1. **Initial Setup**: Run `sql/setup/complete-database-setup.sql` in Supabase SQL Editor
2. **Apply Migrations**: Run `sql/setup/apply-session-metadata-migration.sql` if needed
3. **Fix RLS Issues**: Run `sql/maintenance/fix-rls-policies.sql` if you have access issues

## 📋 Migration History

The Supabase migrations show the evolution of your database:

1. `20250224161427` - Create members table
2. `20250224170000` - Create therapists table  
3. `20250224170001` - Insert initial data
4. `20250224180000` - Add session metadata
5. `20250224190000` - Update VIP to number
6. `20250224200000` - Add origination and addons
7. `20250224210000` - Add room_id to bookings
8. `20250224220000` - Rename origination to nationality
9. `20250224230000` - Add payment method to sessions
10. `20250224240000` - Add payment amounts to sessions
11. `20250224250000` - Simplify payment tracking
12. `20250224260000` - Add notes to sessions
13. `20250224270000` - Remove sample therapists

## 🔧 Troubleshooting

- **"0 rooms" issue**: Run `sql/maintenance/fix-rls-policies.sql`
- **Type mismatches**: Run `sql/diagnostics/check-database-types.sql`
- **Missing tables**: Run `sql/setup/complete-database-setup.sql`

## 📝 Notes

- Supabase migrations are automatically managed by the Supabase CLI
- Standalone scripts are for manual database operations
- Always backup your database before running maintenance scripts
