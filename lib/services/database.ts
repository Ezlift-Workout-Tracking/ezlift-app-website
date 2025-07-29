import { Pool } from 'pg';
import { config } from '../config/environment';
import { DatabaseExercise, ExerciseFilters, FilterOptions } from '../../types/exercise';

class DatabaseService {
  private pool: Pool;
  
  constructor() {
    // Use secure SSL configuration based on environment
    const useSSL = process.env.NODE_ENV === 'production';
    
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: useSSL ? { rejectUnauthorized: true } : false,
    });
  }

  // Get all exercises with optional filtering (READ-ONLY)
  async getExercises(
    filters: ExerciseFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM exercise';
    let countQuery = 'SELECT COUNT(*) FROM exercise';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions using production column names
    if (filters.search) {
      // Search in name and aliases with flexible space/hyphen matching
      const searchTerm = `%${filters.search}%`;
      const searchTermWithHyphens = `%${filters.search.replace(/\s+/g, '-')}%`;
      const searchTermWithSpaces = `%${filters.search.replace(/-/g, ' ')}%`;
      
      conditions.push(`(
        name ILIKE $${paramIndex} OR 
        aliases::text ILIKE $${paramIndex} OR 
        name ILIKE $${paramIndex + 1} OR 
        aliases::text ILIKE $${paramIndex + 1} OR 
        name ILIKE $${paramIndex + 2} OR 
        aliases::text ILIKE $${paramIndex + 2}
      )`);
      params.push(searchTerm, searchTermWithHyphens, searchTermWithSpaces);
      paramIndex += 3;
    }

    if (filters.exerciseType) {
      conditions.push(`"exerciseType" = $${paramIndex}`);
      params.push(filters.exerciseType);
      paramIndex++;
    }

    if (filters.primaryMuscleGroup) {
      conditions.push(`"primaryMuscleGroup" = $${paramIndex}`);
      params.push(filters.primaryMuscleGroup);
      paramIndex++;
    }

    if (filters.otherMuscleGroups) {
      conditions.push(`$${paramIndex} = ANY("otherMuscleGroups")`);
      params.push(filters.otherMuscleGroups);
      paramIndex++;
    }

    if (filters.force) {
      conditions.push(`force = $${paramIndex}`);
      params.push(filters.force);
      paramIndex++;
    }

    if (filters.level) {
      conditions.push(`level = $${paramIndex}`);
      params.push(filters.level);
      paramIndex++;
    }

    if (filters.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.equipment) {
      conditions.push(`equipment = $${paramIndex}`);
      params.push(filters.equipment);
      paramIndex++;
    }

    if (filters.mechanic) {
      conditions.push(`mechanic = $${paramIndex}`);
      params.push(filters.mechanic);
      paramIndex++;
    }

    if (filters.userId !== undefined) {
      if (filters.userId === null) {
        conditions.push(`"userId" IS NULL`);
      } else {
        conditions.push(`"userId" = $${paramIndex}`);
        params.push(filters.userId);
        paramIndex++;
      }
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    // Add ordering and pagination
    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    try {
      // Execute both queries
      const [exercisesResult, countResult] = await Promise.all([
        this.pool.query(query, params),
        this.pool.query(countQuery, params.slice(0, -2)) // Remove limit/offset for count
      ]);

      return {
        exercises: exercisesResult.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Database query error:', error);
      console.log('⚠️ Database unavailable, returning empty exercise results');
      return {
        exercises: [],
        total: 0
      };
    }
  }

  // Get single exercise by ID (READ-ONLY)
  async getExerciseById(id: string): Promise<DatabaseExercise | null> {
    const query = 'SELECT * FROM exercise WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database query error:', error);
      console.log('⚠️ Database unavailable, returning null for exercise');
      return null;
    }
  }

  // Get filter options for the UI (READ-ONLY)
  async getFilterOptions(): Promise<FilterOptions> {
    const queries = [
      'SELECT DISTINCT "primaryMuscleGroup" FROM exercise WHERE "primaryMuscleGroup" IS NOT NULL ORDER BY "primaryMuscleGroup"',
      'SELECT DISTINCT "exerciseType" FROM exercise WHERE "exerciseType" IS NOT NULL ORDER BY "exerciseType"',
      'SELECT DISTINCT level FROM exercise WHERE level IS NOT NULL ORDER BY level',
      'SELECT DISTINCT force FROM exercise WHERE force IS NOT NULL ORDER BY force',
      'SELECT DISTINCT category FROM exercise WHERE category IS NOT NULL ORDER BY category',
      'SELECT DISTINCT equipment FROM exercise WHERE equipment IS NOT NULL ORDER BY equipment',
      'SELECT DISTINCT mechanic FROM exercise WHERE mechanic IS NOT NULL ORDER BY mechanic'
    ];

    try {
      const [
        primaryMuscleGroups,
        exerciseTypes,
        levels,
        forces,
        categories,
        equipment,
        mechanics
      ] = await Promise.all(queries.map(query => this.pool.query(query)));

      return {
        primaryMuscleGroups: primaryMuscleGroups.rows.map(row => row.primaryMuscleGroup),
        exerciseTypes: exerciseTypes.rows.map(row => row.exerciseType),
        levels: levels.rows.map(row => row.level),
        forces: forces.rows.map(row => row.force),
        categories: categories.rows.map(row => row.category),
        equipment: equipment.rows.map(row => row.equipment),
        mechanics: mechanics.rows.map(row => row.mechanic)
      };
    } catch (error) {
      console.error('Database query error:', error);
      console.log('⚠️ Database unavailable, returning empty filter options');
      return {
        primaryMuscleGroups: [],
        exerciseTypes: [],
        levels: [],
        forces: [],
        categories: [],
        equipment: [],
        mechanics: []
      };
    }
  }

  // Search exercises by name and aliases (READ-ONLY)
  async searchExercises(
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    const filters: ExerciseFilters = { search: searchTerm };
    return this.getExercises(filters, page, limit);
  }

  // Get exercises by primary muscle group (READ-ONLY)
  async getExercisesByMuscleGroup(
    muscleGroup: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    const filters: ExerciseFilters = { primaryMuscleGroup: muscleGroup };
    return this.getExercises(filters, page, limit);
  }

  // Get exercises by type (READ-ONLY)
  async getExercisesByType(
    exerciseType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    const filters: ExerciseFilters = { exerciseType };
    return this.getExercises(filters, page, limit);
  }

  // Get exercises by force/movement pattern (READ-ONLY)
  async getExercisesByForce(
    force: 'Push' | 'Pull' | 'Static',
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    const filters: ExerciseFilters = { force };
    return this.getExercises(filters, page, limit);
  }

  // Get user-created exercises (READ-ONLY)
  async getUserCreatedExercises(
    page: number = 1,
    limit: number = 20
  ): Promise<{ exercises: DatabaseExercise[], total: number }> {
    // Use a direct query for user-created exercises (userId IS NOT NULL)
    const offset = (page - 1) * limit;
    
    const query = 'SELECT * FROM exercise WHERE "userId" IS NOT NULL ORDER BY name ASC LIMIT $1 OFFSET $2';
    const countQuery = 'SELECT COUNT(*) FROM exercise WHERE "userId" IS NOT NULL';
    
    try {
      const [exercisesResult, countResult] = await Promise.all([
        this.pool.query(query, [limit, offset]),
        this.pool.query(countQuery)
      ]);

      return {
        exercises: exercisesResult.rows,
        total: parseInt(countResult.rows[0].count)
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch user-created exercises');
    }
  }

  // Get exercise statistics (READ-ONLY)
  async getExerciseStats(): Promise<{
    total: number;
    byExerciseType: Record<string, number>;
    byPrimaryMuscleGroup: Record<string, number>;
    byLevel: Record<string, number>;
    byForce: Record<string, number>;
    byCategory: Record<string, number>;
    byEquipment: Record<string, number>;
    withImages: number;
    userCreated: number;
  }> {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM exercise',
        'SELECT "exerciseType", COUNT(*) as count FROM exercise GROUP BY "exerciseType"',
        'SELECT "primaryMuscleGroup", COUNT(*) as count FROM exercise GROUP BY "primaryMuscleGroup"',
        'SELECT level, COUNT(*) as count FROM exercise WHERE level IS NOT NULL GROUP BY level',
        'SELECT force, COUNT(*) as count FROM exercise WHERE force IS NOT NULL GROUP BY force',
        'SELECT category, COUNT(*) as count FROM exercise WHERE category IS NOT NULL GROUP BY category',
        'SELECT equipment, COUNT(*) as count FROM exercise GROUP BY equipment',
        'SELECT COUNT(*) as count FROM exercise WHERE image IS NOT NULL',
        'SELECT COUNT(*) as count FROM exercise WHERE "userId" IS NOT NULL'
      ];

      const [
        totalResult,
        byExerciseTypeResult,
        byPrimaryMuscleGroupResult,
        byLevelResult,
        byForceResult,
        byCategoryResult,
        byEquipmentResult,
        withImagesResult,
        userCreatedResult
      ] = await Promise.all(queries.map(query => this.pool.query(query)));

      const byExerciseType: Record<string, number> = {};
      byExerciseTypeResult.rows.forEach(row => {
        byExerciseType[row.exerciseType] = parseInt(row.count);
      });

      const byPrimaryMuscleGroup: Record<string, number> = {};
      byPrimaryMuscleGroupResult.rows.forEach(row => {
        byPrimaryMuscleGroup[row.primaryMuscleGroup] = parseInt(row.count);
      });

      const byLevel: Record<string, number> = {};
      byLevelResult.rows.forEach(row => {
        byLevel[row.level] = parseInt(row.count);
      });

      const byForce: Record<string, number> = {};
      byForceResult.rows.forEach(row => {
        byForce[row.force] = parseInt(row.count);
      });

      const byCategory: Record<string, number> = {};
      byCategoryResult.rows.forEach(row => {
        byCategory[row.category] = parseInt(row.count);
      });

      const byEquipment: Record<string, number> = {};
      byEquipmentResult.rows.forEach(row => {
        byEquipment[row.equipment] = parseInt(row.count);
      });

      return {
        total: parseInt(totalResult.rows[0].total),
        byExerciseType,
        byPrimaryMuscleGroup,
        byLevel,
        byForce,
        byCategory,
        byEquipment,
        withImages: parseInt(withImagesResult.rows[0].count),
        userCreated: parseInt(userCreatedResult.rows[0].count)
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Failed to fetch exercise statistics');
    }
  }

  // Test database connection (READ-ONLY)
  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  // Close database connection
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export default new DatabaseService(); 