// PiPilot DB - List Tables Tool
export async function list_tables(params: any) {
  console.log('Listing tables with params:', params);
  // Mock response with users table
  return [
    {
      id: 1,
      name: 'users',
      schema: {
        columns: [
          { name: 'id', type: 'uuid', primary_key: true },
          { name: 'email', type: 'text', unique: true },
          { name: 'password_hash', type: 'text' },
          { name: 'full_name', type: 'text' },
          { name: 'avatar_url', type: 'text' },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' }
        ]
      }
    }
  ];
}