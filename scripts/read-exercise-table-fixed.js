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

    // Get row count
    const countResult = await client.query('SELECT COUNT(*) FROM exercise');
    console.log(`📊 Total exercises: ${countResult.rows[0].count}`);

    // Check unique values for key fields with correct column names
    const uniqueTypes = await client.query('SELECT DISTINCT "exerciseType" FROM exercise WHERE "exerciseType" IS NOT NULL ORDER BY "exerciseType"');
    console.log('\n🏷️  Unique exercise types:');
    uniqueTypes.rows.forEach(row => console.log(`  - ${row.exerciseType}`));

    const uniqueMuscleGroups = await client.query('SELECT DISTINCT "primaryMuscleGroup" FROM exercise WHERE "primaryMuscleGroup" IS NOT NULL ORDER BY "primaryMuscleGroup"');
    console.log('\n💪 Unique primary muscle groups:');
    uniqueMuscleGroups.rows.forEach(row => console.log(`  - ${row.primaryMuscleGroup}`));

    const uniqueLevels = await client.query('SELECT DISTINCT level FROM exercise WHERE level IS NOT NULL ORDER BY level');
    console.log('\n📈 Unique levels (difficulty):');
    uniqueLevels.rows.forEach(row => console.log(`  - ${row.level}`));

    const uniqueForces = await client.query('SELECT DISTINCT force FROM exercise WHERE force IS NOT NULL ORDER BY force');
    console.log('\n🔄 Unique forces (push/pull):');
    uniqueForces.rows.forEach(row => console.log(`  - ${row.force}`));

    const uniqueCategories = await client.query('SELECT DISTINCT category FROM exercise WHERE category IS NOT NULL ORDER BY category');
    console.log('\n📂 Unique categories:');
    uniqueCategories.rows.forEach(row => console.log(`  - ${row.category}`));

    const uniqueEquipment = await client.query('SELECT DISTINCT equipment FROM exercise WHERE equipment IS NOT NULL ORDER BY equipment');
    console.log('\n🛠️  Unique equipment:');
    uniqueEquipment.rows.forEach(row => console.log(`  - ${row.equipment}`));

    const uniqueMechanics = await client.query('SELECT DISTINCT mechanic FROM exercise WHERE mechanic IS NOT NULL ORDER BY mechanic');
    console.log('\n⚙️  Unique mechanics:');
    uniqueMechanics.rows.forEach(row => console.log(`  - ${row.mechanic}`));

    // Check some sample otherMuscleGroups arrays
    const muscleGroupArrays = await client.query('SELECT "otherMuscleGroups" FROM exercise WHERE "otherMuscleGroups" IS NOT NULL LIMIT 10');
    console.log('\n🔗 Sample otherMuscleGroups arrays:');
    muscleGroupArrays.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.otherMuscleGroups}`);
    });

    // Check some sample aliases
    const aliasArrays = await client.query('SELECT aliases FROM exercise WHERE aliases IS NOT NULL LIMIT 10');
    console.log('\n📝 Sample aliases arrays:');
    aliasArrays.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.aliases}`);
    });

    // Check for exercises with images
    const imageCount = await client.query('SELECT COUNT(*) FROM exercise WHERE image IS NOT NULL');
    console.log(`\n🖼️  Exercises with images: ${imageCount.rows[0].count}`);

    // Check for user-created exercises
    const userExercises = await client.query('SELECT COUNT(*) FROM exercise WHERE "userId" IS NOT NULL');
    console.log(`👤 User-created exercises: ${userExercises.rows[0].count}`);

    console.log('\n🎉 Table examination completed successfully!');
    
  } catch (error) {
    console.error('❌ Database examination failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

examineExerciseTable(); 