import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { hash } from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { OracleAgentService } from '../../../lib/services/OracleAgentService';

// Storage options for beta testing
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'json'; // 'json', 'sqlite', or 'memory'
const DATA_PATH = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_PATH, 'users.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// JSON File Storage Helper
class JSONStorage {
  static async loadUsers(): Promise<any[]> {
    try {
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static async saveUsers(users: any[]): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  }

  static async findUser(username: string): Promise<any | null> {
    const users = await this.loadUsers();
    return users.find(u => u.username === username) || null;
  }

  static async addUser(userData: any): Promise<void> {
    const users = await this.loadUsers();
    users.push(userData);
    await this.saveUsers(users);
  }
}

// SQLite Storage Helper
class SQLiteStorage {
  private static db: any = null;

  static async init() {
    if (this.db) return this.db;
    
    try {
      const sqlite3 = (await import('sqlite3')).default;
      await ensureDataDir();
      
      this.db = new sqlite3.Database(path.join(DATA_PATH, 'onboarding.db'));
      
      // Create users table
      return new Promise((resolve, reject) => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            oracle_data TEXT,
            created_at TEXT,
            onboarding_completed BOOLEAN,
            last_login_at TEXT,
            login_count INTEGER
          )
        `, (err: any) => {
          if (err) reject(err);
          else resolve(this.db);
        });
      });
    } catch (error) {
      console.warn('SQLite not available, falling back to JSON storage');
      return null;
    }
  }

  static async findUser(username: string): Promise<any | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err: any, row: any) => {
          if (err || !row) resolve(null);
          else {
            resolve({
              ...row,
              oracle: JSON.parse(row.oracle_data || '{}')
            });
          }
        }
      );
    });
  }

  static async addUser(userData: any): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('SQLite not available');

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, username, password, oracle_data, created_at, onboarding_completed, last_login_at, login_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userData.id,
          userData.username,
          userData.password,
          JSON.stringify(userData.oracle),
          userData.createdAt,
          userData.onboardingCompleted,
          userData.lastLoginAt,
          userData.loginCount
        ],
        (err: any) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

// In-memory storage fallback (for demo purposes)
const memoryUsers: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, oracleName, voiceProvider = 'maya', gamificationEnabled = true } = body;

    // Validate input
    if (!username || !password || !oracleName) {
      return NextResponse.json(
        { error: 'Missing required fields: username, password, and oracleName are required' },
        { status: 400 }
      );
    }

    // Validate username (alphanumeric, 3-20 chars)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, alphanumeric and underscores only' },
        { status: 400 }
      );
    }

    // Validate password (min 6 chars)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists based on storage type
    let existingUser = null;
    switch (STORAGE_TYPE) {
      case 'json':
        existingUser = await JSONStorage.findUser(username);
        break;
      case 'sqlite':
        existingUser = await SQLiteStorage.findUser(username);
        break;
      default:
        existingUser = memoryUsers.get(username);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create oracle agent using the service
    const oracle = OracleAgentService.createOracle(userId, oracleName);

    // Create complete user record
    const userData = {
      id: userId,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      onboardingCompleted: true,
      oracle,
      // Session data for future use
      lastLoginAt: new Date().toISOString(),
      loginCount: 1
    };

    // Store user based on storage type
    switch (STORAGE_TYPE) {
      case 'json':
        await JSONStorage.addUser(userData);
        break;
      case 'sqlite':
        await SQLiteStorage.addUser(userData);
        break;
      default:
        memoryUsers.set(username, userData);
    }


    // Return success response (don't send password hash back)
    return NextResponse.json({
      success: true,
      message: 'Account and oracle created successfully',
      user: {
        id: userData.id,
        username: userData.username,
        onboardingCompleted: true,
        oracle: {
          id: oracle.id,
          name: oracle.name,
          voice: oracle.voice,
          level: oracle.level,
          experience: oracle.experience,
          totalInteractions: oracle.gamification.totalInteractions,
          achievements: oracle.gamification.achievements
        },
        createdAt: userData.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if username is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter required' }, { status: 400 });
    }

    // Check if username exists based on storage type
    let existingUser = null;
    switch (STORAGE_TYPE) {
      case 'json':
        existingUser = await JSONStorage.findUser(username);
        break;
      case 'sqlite':
        existingUser = await SQLiteStorage.findUser(username);
        break;
      default:
        existingUser = memoryUsers.get(username);
    }

    const isAvailable = !existingUser;
    
    return NextResponse.json({ 
      available: isAvailable,
      suggestions: isAvailable ? [] : [
        `${username}1`,
        `${username}_oracle`,
        `${username}${Math.floor(Math.random() * 100)}`,
        `${username}_${new Date().getFullYear()}`
      ]
    });

  } catch (error) {
    console.error('❌ Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}