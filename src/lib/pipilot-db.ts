import { create_database, create_table, list_tables, read_table, query_database, manipulate_table_data, manage_api_keys } from '@/lib/database-tools';

// PiPilot DB configuration
const DATABASE_NAME = '3a_skill_passport_auth';

// Helper function to get the users table ID
export const getUsersTableId = async (): Promise<number> => {
  try {
    const tables = await list_tables({ includeSchema: false });
    const usersTable = tables.find((table: any) => table.name === 'users');
    if (!usersTable) {
      throw new Error('Users table not found');
    }
    return usersTable.id;
  } catch (error) {
    console.error('Error getting users table ID:', error);
    throw error;
  }
};

// Export all database functions with the correct database context
export {
  create_database,
  create_table,
  list_tables,
  read_table,
  query_database,
  manipulate_table_data,
  manage_api_keys,
};