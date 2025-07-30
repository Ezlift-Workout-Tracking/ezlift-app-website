#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

async function testExerciseLibrary() {
  console.log('🧪 Testing Exercise Library Setup...\n');

  try {
    // Test database connection
    const databaseService = require('../lib/services/database.ts').default;
    const dbConnected = await databaseService.testConnection();
    console.log(`📊 Database: ${dbConnected ? '✅ Connected' : '❌ Failed'}`);

    if (dbConnected) {
      // Test getting exercises
      const { exercises, total } = await databaseService.getExercises({}, 1, 5);
      console.log(`   📝 Found ${total} exercises (showing first 5):`);
      exercises.forEach((exercise, index) => {
        console.log(`   ${index + 1}. ${exercise.name} (${exercise.primaryMuscleGroup})`);
      });

      // Test filter options
      const filterOptions = await databaseService.getFilterOptions();
      console.log(`   🏷️  ${filterOptions.exerciseTypes.length} exercise types available`);
      console.log(`   💪 ${filterOptions.primaryMuscleGroups.length} muscle groups available`);
    }

    // Test exercise data service
    const exerciseDataService = require('../lib/services/exercise-data').default;
    const serviceStatus = exerciseDataService.getServiceStatus();
    console.log(`\n🔧 Service Status:`);
    console.log(`   Database: ${serviceStatus.database ? '✅ Available' : '❌ Not available'}`);
    console.log(`   S3: ${serviceStatus.s3 ? '✅ Available' : '⚠️ Not configured'}`);
    console.log(`   Contentful: ${serviceStatus.contentful ? '✅ Available' : '⚠️ Not configured'}`);

    // Test connections
    const connections = await exerciseDataService.testConnections();
    console.log(`\n🔗 Connection Tests:`);
    console.log(`   Database: ${connections.database ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   S3: ${connections.s3 ? '✅ Connected' : '⚠️ Skipped'}`);
    console.log(`   Contentful: ${connections.contentful ? '✅ Connected' : '⚠️ Skipped'}`);

    // Test getting exercises through the main service
    const exerciseResponse = await exerciseDataService.getExercises({}, 1, 3);
    console.log(`\n📋 Exercise Library Test:`);
    console.log(`   Total exercises: ${exerciseResponse.total}`);
    console.log(`   Sample exercises:`);
    exerciseResponse.exercises.forEach((exercise, index) => {
      console.log(`   ${index + 1}. ${exercise.name}`);
      console.log(`      Type: ${exercise.exerciseType}`);
      console.log(`      Muscle: ${exercise.primaryMuscleGroup}`);
      console.log(`      Media: ${exercise.media ? (exercise.media.imageExists ? 'Image available' : 'No image') : 'No media service'}`);
      console.log(`      Content: ${exercise.content ? 'Rich content available' : 'No rich content'}`);
    });

    console.log('\n🎉 Exercise Library test completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Visit http://localhost:3000/exercise-library to see your exercises');
    console.log('   2. Test search and filtering functionality');
    console.log('   3. Click on exercises to view details');
    if (!serviceStatus.s3) {
      console.log('   4. [Optional] Configure S3 for exercise images/videos');
    }
    if (!serviceStatus.contentful) {
      console.log('   4. [Optional] Add exercise content in Contentful for rich instructions');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testExerciseLibrary(); 