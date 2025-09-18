#!/usr/bin/env node

// Test script to verify PrintNode integration
const { getPrintNodeService } = require('./app/utils/printnode.server.ts');

async function testPrinting() {
  try {
    console.log('🔍 Testing PrintNode integration...');
    
    // Test 1: Initialize service
    console.log('1. Initializing PrintNode service...');
    const printNodeService = getPrintNodeService();
    console.log('✅ Service initialized successfully');
    
    // Test 2: Fetch printers
    console.log('2. Fetching available printers...');
    const printers = await printNodeService.getPrinters();
    console.log('✅ Printers fetched:', printers.length, 'printers found');
    
    if (printers.length > 0) {
      console.log('📋 Available printers:');
      printers.forEach((printer, index) => {
        console.log(`   ${index + 1}. ${printer.name} (ID: ${printer.id}) - ${printer.state}`);
      });
      
      // Test 3: Test receipt printing
      console.log('3. Testing receipt printing...');
      const testReceiptData = {
        service: 'Test Massage',
        duration: 60,
        price: 1000,
        payout: 500,
        therapist: 'Test Therapist',
        room: 'Room 1',
        timestamp: new Date().toLocaleString(),
        sessionId: 'TEST-001'
      };
      
      const defaultPrinter = printers.find(p => p.default) || printers[0];
      console.log(`   Using printer: ${defaultPrinter.name} (ID: ${defaultPrinter.id})`);
      
      const result = await printNodeService.printReceipt(defaultPrinter.id, testReceiptData);
      console.log('✅ Test receipt printed successfully!');
      console.log('   Print job ID:', result.id);
      console.log('   Printer:', result.printer.name);
      
    } else {
      console.log('⚠️  No printers found. Please check your PrintNode setup.');
    }
    
    console.log('\n🎉 PrintNode integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testPrinting();
