import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { setupTestDatabase, teardownTestDatabase } from './test-utils';

describe('{{ModuleName}} Integration', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(pool);
  });

  it('should perform CRUD operations successfully', async () => {
    // Arrange
    const testData = {{testData}};

    // Act
    const created = await createRecord(pool, testData);
    const read = await getRecord(pool, created.id);
    const updated = await updateRecord(pool, created.id, {{updateData}});
    const deleted = await deleteRecord(pool, created.id);

    // Assert
    expect(created.id).toBeDefined();
    expect(read).toEqual(created);
    expect(updated.name).toBe('{{expectedUpdatedName}}');
    expect(deleted).toBe(true);
  });
});
