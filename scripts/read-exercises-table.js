#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function examineExercisesTable() {
  try {
    console.log('🔄 Connecting to PostgreSQL database (READ-ONLY)...');
    await client.connect();
    console.log('✅ Database connection successful!');

    console.log('✅ examining exercises table...');

    // Get table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'exercises'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // Get row count
    const countResult = await client.query('SELECT COUNT(*) FROM exercises');
    console.log(`\n📊 Total exercises: ${countResult.rows[0].count}`);

    // Sample a few rows to understand the data structure
    const sampleResult = await client.query('SELECT * FROM exercises LIMIT 5');
    console.log('\n🔍 Sample data (first 5 rows):');
    sampleResult.rows.forEach((row, index) => {
      console.log(`\n--- Exercise ${index + 1} ---`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    });

    // Check unique values for key fields
    const uniqueTypes = await client.query('SELECT DISTINCT type FROM exercises WHERE type IS NOT NULL ORDER BY type');
    console.log('\n🏷️  Unique exercise types:');
    uniqueTypes.rows.forEach(row => console.log(`  - ${row.type}`));

    const uniqueMuscleGroups = await client.query('SELECT DISTINCT primary_muscle_group FROM exercises WHERE primary_muscle_group IS NOT NULL ORDER BY primary_muscle_group');
    console.log('\n💪 Unique primary muscle groups:');
    uniqueMuscleGroups.rows.forEach(row => console.log(`  - ${row.primary_muscle_group}`));

    const uniqueDifficulties = await client.query('SELECT DISTINCT difficulty FROM exercises WHERE difficulty IS NOT NULL ORDER BY difficulty');
    console.log('\n📈 Unique difficulties:');
    uniqueDifficulties.rows.forEach(row => console.log(`  - ${row.difficulty}`));

    // Check for push_or_pull column
    const pushPullData = await client.query('SELECT DISTINCT push_or_pull FROM exercises WHERE push_or_pull IS NOT NULL ORDER BY push_or_pull');
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

examineExercisesTable(); 