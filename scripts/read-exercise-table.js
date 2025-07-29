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

async function examineExerciseTable() {
  try {
    console.log('🔄 Connecting to PostgreSQL database (READ-ONLY)...');
    await client.connect();
    console.log('✅ Database connection successful!');

    // Check if exercise table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ exercise table does not exist');
      return;
    }

    console.log('✅ exercise table exists');

    // Get table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'exercise'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Get row count
    const countResult = await client.query('SELECT COUNT(*) FROM exercise');
    console.log(`\n📊 Total exercises: ${countResult.rows[0].count}`);

    // Sample a few rows to understand the data structure
    const sampleResult = await client.query('SELECT * FROM exercise LIMIT 5');
    console.log('\n🔍 Sample data (first 5 rows):');
    sampleResult.rows.forEach((row, index) => {
      console.log(`\n--- Exercise ${index + 1} ---`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    });

    // Check unique values for key fields
    const uniqueTypes = await client.query('SELECT DISTINCT type FROM exercise WHERE type IS NOT NULL ORDER BY type');
    console.log('\n🏷️  Unique exercise types:');
    uniqueTypes.rows.forEach(row => console.log(`  - ${row.type}`));

    const uniqueMuscleGroups = await client.query('SELECT DISTINCT primary_muscle_group FROM exercise WHERE primary_muscle_group IS NOT NULL ORDER BY primary_muscle_group');
    console.log('\n💪 Unique primary muscle groups:');
    uniqueMuscleGroups.rows.forEach(row => console.log(`  - ${row.primary_muscle_group}`));

    const uniqueDifficulties = await client.query('SELECT DISTINCT difficulty FROM exercise WHERE difficulty IS NOT NULL ORDER BY difficulty');
    console.log('\n📈 Unique difficulties:');
    uniqueDifficulties.rows.forEach(row => console.log(`  - ${row.difficulty}`));

    // Check for push_or_pull column
    const pushPullData = await client.query('SELECT DISTINCT push_or_pull FROM exercise WHERE push_or_pull IS NOT NULL ORDER BY push_or_pull');
    console.log('\n🔄 Push/Pull classifications:');
    pushPullData.rows.forEach(row => console.log(`  - ${row.push_or_pull}`));

    console.log('\n🎉 Table examination completed successfully!');
    
  } catch (error) {
    console.error('❌ Database examination failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

examineExerciseTable(); 