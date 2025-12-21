// Simple in-memory database for development
// In production, this would be replaced with actual PiPilot DB calls

interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

class SimpleDatabase {
  private users: Map<string, User> = new Map();

  // Query users
  async queryUsers(where: { field: string; operator: string; value: any }[]): Promise<User[]> {
    const results: User[] = [];

    for (const user of Array.from(this.users.values())) {
      let matches = true;

      for (const condition of where) {
        const fieldValue = (user as any)[condition.field];

        switch (condition.operator) {
          case '=':
            if (fieldValue !== condition.value) {
              matches = false;
            }
            break;
          // Add more operators as needed
        }

        if (!matches) break;
      }

      if (matches) {
        results.push(user);
      }
    }

    return results;
  }

  // Insert user
  async insertUser(userData: Partial<User>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const user: User = {
      id,
      email: userData.email!,
      password_hash: userData.password_hash!,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url,
      created_at: now,
      updated_at: now,
    };

    this.users.set(id, user);
    return user;
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  // Check if user exists by email
  async userExists(email: string): Promise<boolean> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return true;
      }
    }
    return false;
  }
}

// Export singleton instance
export const simpleDb = new SimpleDatabase();