import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = 3306,
  DB_USER,
  DB_PASSWORD,
  DB_NAME = 'shikshan_db',
  ADMIN_EMAIL = 'admin@shikshan.org',
  ADMIN_PASSWORD = 'AdminSecurePassword123!',
  ADMIN_NAME = 'Shikshan Administrator',
  ADMIN_PHONE = '9876543210'
} = process.env;

if (!DB_USER) {
  console.error('ERROR: DB_USER is not configured in server/.env');
  process.exit(1);
}

async function initDatabase() {
  console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as user '${DB_USER}'...`);

  let connection;
  try {
    // Connect to server (without database name) to ensure database exists
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log(`✓ Successfully connected to MySQL server.`);

    // Read schema.sql
    const schemaPath = path.join(__dirname, '..', 'src', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Executing schema definitions...`);
    await connection.query(schemaSql);
    console.log(`✓ Database '${DB_NAME}' and all tables initialized successfully.`);

    // Check if initial admin exists
    const [existingAdmins] = await connection.query(
      `SELECT id, email FROM shikshan_db.users WHERE role = 'admin' LIMIT 1`
    );

    if (existingAdmins.length === 0) {
      console.log(`Seeding initial administrator account: ${ADMIN_EMAIL}...`);
      const adminId = crypto.randomUUID();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await connection.query(
        `INSERT INTO shikshan_db.users (id, email, password_hash, role, name, phone)
         VALUES (?, ?, ?, 'admin', ?, ?)`,
        [adminId, ADMIN_EMAIL, passwordHash, ADMIN_NAME, ADMIN_PHONE]
      );
      console.log(`✓ Initial admin created (${ADMIN_EMAIL})`);
    } else {
      console.log(`✓ Admin account already present (${existingAdmins[0].email})`);
    }

    console.log('\n=============================================');
    console.log('✓ SHIKSHAN DATABASE SETUP COMPLETE');
    console.log('=============================================\n');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
