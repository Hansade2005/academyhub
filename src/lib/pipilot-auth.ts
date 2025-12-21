// PiPilot Authentication Integration
// This replaces the existing simple JWT auth with PiPilot DB authentication

import { manipulate_table_data, query_database, getUsersTableId } from './pipilot-db';

export interface PiPilotUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  password_hash?: string; // Only for internal use, never expose to client
}

export class PiPilotAuth {
  private usersTableId: number | null = null;

  private async getUsersTableId(): Promise<number> {
    if (!this.usersTableId) {
      this.usersTableId = await getUsersTableId();
    }
    return this.usersTableId;
  }

  // Register a new user
  async register(email: string, password: string, fullName?: string): Promise<PiPilotUser> {
    try {
      const tableId = await this.getUsersTableId();

      // Check if user already exists
      const existingUsers = await query_database({
        tableId,
        where: { field: 'email', operator: '=', value: email }
      });

      if (existingUsers.data && existingUsers.data.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password (in production, use bcrypt)
      const passwordHash = await this.hashPassword(password);

      // Insert new user
      const result = await manipulate_table_data({
        tableId,
        operation: 'insert',
        data: {
          email,
          password_hash: passwordHash,
          full_name: fullName,
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      if (!result.success) {
        throw new Error('Failed to create user');
      }

      // Construct user object from input since tool doesn't return inserted data
      const user: PiPilotUser = {
        id: Date.now().toString(), // Temporary ID until we can get it from DB
        email,
        password_hash: passwordHash,
        full_name: fullName,
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Authenticate user
  async login(email: string, password: string): Promise<PiPilotUser> {
    try {
      const tableId = await this.getUsersTableId();

      // Find user by email
      const users = await query_database({
        tableId,
        where: { field: 'email', operator: '=', value: email }
      });

      if (!users.data || users.data.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users.data[0] as PiPilotUser;

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash || '');
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<PiPilotUser | null> {
    try {
      const tableId = await this.getUsersTableId();

      const users = await query_database({
        tableId,
        where: { field: 'id', operator: '=', value: userId }
      });

      if (!users.data || users.data.length === 0) {
        return null;
      }

      return this.sanitizeUser(users.data[0] as PiPilotUser);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<PiPilotUser>): Promise<PiPilotUser> {
    try {
      const tableId = await this.getUsersTableId();

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const result = await manipulate_table_data({
        tableId,
        operation: 'update',
        recordId: userId,
        data: updateData
      });

      if (!result.success) {
        throw new Error('Failed to update user');
      }

      // Since update doesn't return data, fetch the updated user
      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Remove sensitive data before sending to client
  private sanitizeUser(user: PiPilotUser): PiPilotUser {
    const { password_hash, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Simple password hashing (use bcrypt in production)
  private async hashPassword(password: string): Promise<string> {
    // In production, use: await bcrypt.hash(password, 12);
    // For now, using a simple hash for demonstration
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'pipilot_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password (use bcrypt.compare in production)
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // In production, use: await bcrypt.compare(password, hash);
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}

// Export singleton instance
export const pipilotAuth = new PiPilotAuth();