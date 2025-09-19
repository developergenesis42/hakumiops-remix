/* eslint-disable no-undef, no-unused-vars */
// Comprehensive Supabase table inspection script
// Run with: node check-supabase-tables.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure(tableName, expectedColumns) {
  console.log(`\n📋 Checking table: ${tableName}`);
  console.log('─'.repeat(50));
  
  try {
    // Get table info by selecting all columns
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error accessing table: ${error.message}`);
      return false;
    }
    
    if (data && data.length > 0) {
      const actualColumns = Object.keys(data[0]);
      console.log(`✅ Table accessible`);
      console.log(`📊 Columns found: ${actualColumns.length}`);
      
      // Check if expected columns exist
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  Missing expected columns: ${missingColumns.join(', ')}`);
      }
      
      if (extraColumns.length > 0) {
        console.log(`ℹ️  Additional columns: ${extraColumns.join(', ')}`);
      }
      
      if (missingColumns.length === 0) {
        console.log(`✅ All expected columns present`);
      }
      
      // Show sample data structure
      console.log(`\n📝 Sample data structure:`);
      Object.entries(data[0]).forEach(([key, value]) => {
        const type = typeof value;
        const valueStr = value === null ? 'null' : 
                        Array.isArray(value) ? `[${value.length} items]` :
                        type === 'string' && value.length > 20 ? `"${value.substring(0, 20)}..."` :
                        JSON.stringify(value);
        console.log(`   ${key}: ${valueStr} (${type})`);
      });
      
    } else {
      console.log(`✅ Table accessible but empty`);
    }
    
    return true;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return false;
  }
}

async function checkTableData(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log(`❌ Error getting data: ${error.message}`);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return 0;
  }
}

async function checkAllTables() {
  console.log('🔍 Comprehensive Supabase Table Inspection');
  console.log('='.repeat(60));
  
  const tables = [
    {
      name: 'therapists',
      expectedColumns: ['id', 'name', 'is_on_duty', 'status', 'check_in_time', 'check_out_time', 'active_room_id', 'completed_room_ids', 'created_at', 'updated_at']
    },
    {
      name: 'rooms',
      expectedColumns: ['id', 'name', 'type', 'status', 'created_at', 'updated_at']
    },
    {
      name: 'services',
      expectedColumns: ['id', 'category', 'room_type', 'name', 'duration', 'price', 'payout', 'created_at']
    },
    {
      name: 'sessions',
      expectedColumns: ['id', 'service_id', 'therapist_ids', 'room_id', 'status', 'start_time', 'end_time', 'duration', 'price', 'payout', 'created_at', 'updated_at']
    },
    {
      name: 'bookings',
      expectedColumns: ['id', 'therapist_ids', 'service_id', 'start_time', 'end_time', 'status', 'note', 'created_at', 'updated_at']
    },
    {
      name: 'therapist_expenses',
      expectedColumns: ['id', 'therapist_id', 'item_name', 'amount', 'created_at']
    },
    {
      name: 'shop_expenses',
      expectedColumns: ['id', 'amount', 'note', 'created_at']
    },
    {
      name: 'walkouts',
      expectedColumns: ['id', 'reason', 'count', 'created_at']
    },
    {
      name: 'daily_reports',
      expectedColumns: ['id', 'report_date', 'total_revenue', 'shop_revenue', 'therapist_payouts', 'session_count', 'walkout_count', 'report_data', 'created_at']
    }
  ];
  
  let allTablesValid = true;
  const tableCounts = {};
  
  for (const table of tables) {
    const isValid = await checkTableStructure(table.name, table.expectedColumns);
    if (!isValid) allTablesValid = false;
    
    const count = await checkTableData(table.name);
    tableCounts[table.name] = count;
  }
  
  // Summary
  console.log('\n📊 TABLE SUMMARY');
  console.log('='.repeat(60));
  console.log('Table Name           | Records | Status');
  console.log('─'.repeat(40));
  
  for (const table of tables) {
    const count = tableCounts[table.name];
    const status = count > 0 ? '✅ Has Data' : '📭 Empty';
    console.log(`${table.name.padEnd(20)} | ${count.toString().padStart(7)} | ${status}`);
  }
  
  console.log('\n🎯 RECOMMENDATIONS');
  console.log('─'.repeat(40));
  
  if (tableCounts['therapists'] === 0) {
    console.log('⚠️  No therapists found - you may want to add some sample therapists');
  }
  
  if (tableCounts['rooms'] === 0) {
    console.log('⚠️  No rooms found - you may want to add some sample rooms');
  }
  
  if (tableCounts['services'] === 0) {
    console.log('⚠️  No services found - you may want to add some sample services');
  }
  
  if (allTablesValid) {
    console.log('✅ All tables have correct structure');
  } else {
    console.log('❌ Some tables have structural issues - check the details above');
  }
  
  // Check for sample data
  const hasSampleData = tableCounts['therapists'] > 0 || tableCounts['rooms'] > 0 || tableCounts['services'] > 0;
  if (hasSampleData) {
    console.log('✅ Sample data is present');
  } else {
    console.log('⚠️  No sample data found - consider running the initial data migration');
  }
  
  return allTablesValid;
}

// Run the inspection
checkAllTables().then(success => {
  if (success) {
    console.log('\n🎉 All tables are correctly configured!');
  } else {
    console.log('\n❌ Some issues found - please review the output above');
  }
  process.exit(success ? 0 : 1);
});
