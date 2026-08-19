import '../config/dns.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars
dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB Atlas...');
console.log(`URI: ${uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined'}`);

if (!uri) {
  console.error('Error: MONGODB_URI is not set in server/.env file');
  process.exit(1);
}

const check = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
    console.log('\n=========================================');
    console.log('🎉 SUCCESS: Connected to MongoDB Atlas!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log('=========================================\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n=========================================');
    console.error('❌ CONNECTION FAILED!');
    console.error(`Error details: ${error.message}`);
    
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('querySrv') || error.message.includes('timeout')) {
      console.error('\nPossible Causes & Fixes:');
      console.error('1. IP NOT WHITELISTED: Log into MongoDB Atlas, go to "Network Access", and add your current IP address (or 0.0.0.0/0 to allow access from anywhere for development).');
      console.error('2. SRV DNS LOOKUP FAILURE: On some Windows environments, Node.js can fail MongoDB+SRV lookups. Try uncommenting `dns.setServers` in server/src/config/dns.js.');
      console.error('3. INCORRECT PASSWORD: Check that your database username and password in the MONGODB_URI are correct.');
    }
    console.error('=========================================\n');
    process.exit(1);
  }
};

check();
