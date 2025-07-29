#!/usr/bin/env node

const { Client } = require('pg');

// Only load .env.local in local development (not in production/CI)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

// Use secure SSL configuration based on environment
const useSSL = process.env.NODE_ENV === 'production';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: true } : false,
});

async function listAllTables() {
  try {
    console.log('🔄 Connecting to PostgreSQL database (READ-ONLY)...');
    await client.connect();
    console.log('✅ Database connection successful!');

    // List all tables in all schemas
    const allTables = await client.query(`
      SELECT schemaname, tablename, tableowner
      FROM pg_tables
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
      ORDER BY schemaname, tablename;
    `);

    console.log('\n📋 All tables in the database:');
    if (allTables.rows.length === 0) {
      console.log('  No tables found');
    } else {
      allTables.rows.forEach(row => {
        console.log(`  - ${row.schemaname}.${row.tablename} (owner: ${row.tableowner})`);
      });
    }

    // Also check specifically for exercise-related tables
    const exerciseTables = await client.query(`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE tablename ILIKE '%exercise%'
      ORDER BY schemaname, tablename;
    `);

    console.log('\n🏋️ Exercise-related tables:');
    if (exerciseTables.rows.length === 0) {
      console.log('  No exercise-related tables found');
    } else {
      exerciseTables.rows.forEach(row => {
        console.log(`  - ${row.schemaname}.${row.tablename}`);
      });
    }

    // Check the current schema
    const currentSchema = await client.query('SELECT current_schema();');
    console.log(`\n🎯 Current schema: ${currentSchema.rows[0].current_schema}`);

    // Check if there are any tables with similar names
    const similarTables = await client.query(`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE tablename SIMILAR TO '%(exercise|workout|fitness|gym)%'
      ORDER BY schemaname, tablename;
    `);

    console.log('\n🔍 Tables with similar names:');
    if (similarTables.rows.length === 0) {
      console.log('  No similar tables found');
    } else {
      similarTables.rows.forEach(row => {
        console.log(`  - ${row.schemaname}.${row.tablename}`);
      });
    }

    console.log('\n🎉 Table listing completed successfully!');
    
  } catch (error) {
    console.error('❌ Database listing failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

listAllTables(); 