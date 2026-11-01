import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shikshan-secure-jwt-dev-token-secret-change-in-prod';

// Enable CORS for web development, local Wi-Fi mobile access, and Capacitor
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Capacitor)
      if (!origin) return callback(null, true);
      // Allow localhost, 127.0.0.1, capacitor://, or any local network IP (192.168.*, 10.*, 172.16-31.*)
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.startsWith('capacitor://') ||
        origin.match(/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive for local network test
    },
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------------------------------------
// Auth Middleware
// --------------------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

// --------------------------------------------------------------------------
// Health & Diagnostic
// --------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as connected');
    res.json({
      status: 'ok',
      service: 'Shikshan Backend API',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'Shikshan Backend API',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// --------------------------------------------------------------------------
// Authentication Endpoints
// --------------------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;

  if (!email || !password || !name || !phone || !role) {
    return res.status(400).json({ error: 'All fields (email, password, name, phone, role) are required' });
  }

  if (!['student', 'tutor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, name, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email.trim().toLowerCase(), passwordHash, role, name.trim(), phone.trim()]
    );

    const token = jwt.sign({ id: userId, email: email.trim().toLowerCase(), role }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role, name, phone, photo_url FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo_url: user.photo_url || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed. Please check server connection.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, role, name, phone, photo_url FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// --------------------------------------------------------------------------
// User Profile Photo Endpoints
// --------------------------------------------------------------------------
app.post('/api/user/photo', authenticateToken, async (req, res) => {
  const photoUrl = req.body.photoUrl || req.body.photo_url || req.body.photoBase64;
  if (!photoUrl || typeof photoUrl !== 'string') {
    return res.status(400).json({ error: 'Valid photo URL or data is required' });
  }

  if (photoUrl.length > 2.5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Photo is too large. Maximum size is 2MB.' });
  }

  try {
    await pool.query('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, req.user.id]);
    if (req.user.role === 'student') {
      await pool.query('UPDATE student_profiles SET photo_url = ? WHERE user_id = ?', [photoUrl, req.user.id]);
    } else if (req.user.role === 'tutor') {
      await pool.query('UPDATE tutor_profiles SET photo_url = ? WHERE user_id = ?', [photoUrl, req.user.id]);
    }
    res.json({ success: true, photoUrl });
  } catch (err) {
    console.error('Photo update error:', err);
    res.status(500).json({ error: 'Failed to update profile photo' });
  }
});

app.delete('/api/user/photo', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE users SET photo_url = NULL WHERE id = ?', [req.user.id]);
    await pool.query('UPDATE student_profiles SET photo_url = NULL WHERE user_id = ?', [req.user.id]);
    await pool.query('UPDATE tutor_profiles SET photo_url = NULL WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Profile photo removed' });
  } catch (err) {
    console.error('Photo remove error:', err);
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
});

// --------------------------------------------------------------------------
// Student Profile Endpoints
// --------------------------------------------------------------------------
app.post('/api/student/profile', authenticateToken, requireRole(['student', 'admin']), async (req, res) => {
  const { class_level, board, learning_language, subjects, guardian_phone, learning_goals } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [userId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE student_profiles
         SET class_level = ?, board = ?, learning_language = ?, subjects = ?, guardian_phone = ?, learning_goals = ?
         WHERE user_id = ?`,
        [class_level, board, learning_language, JSON.stringify(subjects || []), guardian_phone || null, learning_goals || null, userId]
      );
    } else {
      const profileId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO student_profiles (id, user_id, class_level, board, learning_language, subjects, guardian_phone, learning_goals)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [profileId, userId, class_level, board, learning_language, JSON.stringify(subjects || []), guardian_phone || null, learning_goals || null]
      );
    }

    res.json({ success: true, message: 'Student profile saved successfully' });
  } catch (err) {
    console.error('Save student profile error:', err);
    res.status(500).json({ error: 'Failed to save student profile' });
  }
});

app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) return res.json({ profile: null });
    const profile = rows[0];
    if (typeof profile.subjects === 'string') profile.subjects = JSON.parse(profile.subjects);
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// --------------------------------------------------------------------------
// Tutor Application & Profile Endpoints
// --------------------------------------------------------------------------
app.post('/api/tutor/profile', authenticateToken, requireRole(['tutor', 'admin']), async (req, res) => {
  const {
    education_level,
    course_qualification,
    institution_name,
    subjects,
    class_levels,
    board_familiarity,
    teaching_languages,
    bio_intro,
    teaching_experience,
    available_days,
    time_windows,
    hours_per_day,
    fee_amount,
    fee_unit,
  } = req.body;

  const userId = req.user.id;

  try {
    const [existing] = await pool.query('SELECT id, status FROM tutor_profiles WHERE user_id = ?', [userId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE tutor_profiles
         SET education_level = ?, course_qualification = ?, institution_name = ?, subjects = ?, class_levels = ?,
             board_familiarity = ?, teaching_languages = ?, bio_intro = ?, teaching_experience = ?,
             available_days = ?, time_windows = ?, hours_per_day = ?, fee_amount = ?, fee_unit = ?
         WHERE user_id = ?`,
        [
          education_level,
          course_qualification,
          institution_name,
          JSON.stringify(subjects || []),
          JSON.stringify(class_levels || []),
          JSON.stringify(board_familiarity || []),
          JSON.stringify(teaching_languages || []),
          bio_intro,
          teaching_experience,
          JSON.stringify(available_days || []),
          JSON.stringify(time_windows || []),
          hours_per_day || 2,
          fee_amount || 3000,
          fee_unit || 'per_month',
          userId,
        ]
      );
    } else {
      const appId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO tutor_profiles
         (id, user_id, education_level, course_qualification, institution_name, subjects, class_levels,
          board_familiarity, teaching_languages, bio_intro, teaching_experience, available_days, time_windows,
          hours_per_day, fee_amount, fee_unit, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          appId,
          userId,
          education_level,
          course_qualification,
          institution_name,
          JSON.stringify(subjects || []),
          JSON.stringify(class_levels || []),
          JSON.stringify(board_familiarity || []),
          JSON.stringify(teaching_languages || []),
          bio_intro,
          teaching_experience,
          JSON.stringify(available_days || []),
          JSON.stringify(time_windows || []),
          hours_per_day || 2,
          fee_amount || 3000,
          fee_unit || 'per_month',
        ]
      );
    }

    res.json({ success: true, message: 'Tutor application submitted successfully' });
  } catch (err) {
    console.error('Save tutor application error:', err);
    res.status(500).json({ error: 'Failed to submit tutor application' });
  }
});

app.get('/api/tutor/my-status', authenticateToken, requireRole(['tutor', 'admin']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.email, u.phone
       FROM tutor_profiles t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ application: null });
    }

    const app = rows[0];
    ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
      (k) => {
        if (typeof app[k] === 'string') {
          try {
            app[k] = JSON.parse(app[k]);
          } catch (e) {}
        }
      }
    );

    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve application status' });
  }
});

// --------------------------------------------------------------------------
// Student Discovery: ONLY APPROVED TUTORS (Authenticated Students/Users)
// --------------------------------------------------------------------------
app.get('/api/tutors', authenticateToken, async (req, res) => {
  try {
    const { subject, classLevel, search } = req.query;

    let query = `
      SELECT t.id, t.user_id, t.education_level, t.course_qualification, t.institution_name,
             t.subjects, t.class_levels, t.board_familiarity, t.teaching_languages,
             t.bio_intro, t.teaching_experience, t.available_days, t.time_windows,
             t.hours_per_day, t.fee_amount, t.fee_unit, t.status, t.created_at,
             u.name, u.email, u.phone
      FROM tutor_profiles t
      JOIN users u ON t.user_id = u.id
      WHERE t.status = 'approved'
      ORDER BY t.created_at DESC
    `;

    const [rows] = await pool.query(query);

    const tutors = rows.map((t) => {
      ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
        (k) => {
          if (typeof t[k] === 'string') {
            try {
              t[k] = JSON.parse(t[k]);
            } catch (e) {
              t[k] = [];
            }
          }
        }
      );
      return {
        id: t.id,
        tutor_id: t.user_id,
        education_level: t.education_level,
        course_qualification: t.course_qualification,
        institution_name: t.institution_name,
        subjects: t.subjects,
        class_levels: t.class_levels,
        board_familiarity: t.board_familiarity,
        teaching_languages: t.teaching_languages,
        bio_intro: t.bio_intro,
        teaching_experience: t.teaching_experience,
        available_days: t.available_days,
        time_windows: t.time_windows,
        hours_per_day: t.hours_per_day,
        fee_amount: Number(t.fee_amount),
        fee_unit: t.fee_unit,
        proposed_rate: Number(t.fee_amount),
        status: t.status,
        created_at: t.created_at,
        tutor_profile: {
          id: t.user_id,
          role: 'tutor',
          name: t.name,
          email: t.email,
          phone: t.phone,
        },
      };
    });

    res.json({ tutors });
  } catch (err) {
    console.error('Fetch approved tutors error:', err);
    res.status(500).json({ error: 'Failed to fetch tutor listings' });
  }
});

app.get('/api/tutors/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.email, u.phone
       FROM tutor_profiles t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ? AND t.status = 'approved'`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found or not approved' });
    }

    const t = rows[0];
    ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
      (k) => {
        if (typeof t[k] === 'string') {
          try {
            t[k] = JSON.parse(t[k]);
          } catch (e) {
            t[k] = [];
          }
        }
      }
    );

    res.json({
      tutor: {
        ...t,
        fee_amount: Number(t.fee_amount),
        tutor_profile: {
          id: t.user_id,
          role: 'tutor',
          name: t.name,
          email: t.email,
          phone: t.phone,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tutor details' });
  }
});

// --------------------------------------------------------------------------
// Tutor Inquiries / Requests Endpoints
// --------------------------------------------------------------------------
app.post('/api/requests', authenticateToken, requireRole(['student']), async (req, res) => {
  const { tutor_id, subject, class_level, learning_needs, preferred_schedule, guardian_phone } = req.body;
  const studentId = req.user.id;

  if (!tutor_id || !subject || !class_level || !learning_needs) {
    return res.status(400).json({ error: 'Required fields: tutor_id, subject, class_level, learning_needs' });
  }

  try {
    const requestId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO tutor_requests (id, student_id, tutor_id, subject, class_level, learning_needs, preferred_schedule, guardian_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [requestId, studentId, tutor_id, subject, class_level, learning_needs, preferred_schedule || null, guardian_phone || null]
    );

    res.status(201).json({ success: true, requestId });
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to submit tutor request' });
  }
});

app.get('/api/requests/student', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as tutor_name, u.email as tutor_email, u.phone as tutor_phone
       FROM tutor_requests r
       JOIN users u ON r.tutor_id = u.id
       WHERE r.student_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student requests' });
  }
});

app.get('/api/requests/tutor', authenticateToken, requireRole(['tutor']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.name as student_name, u.email as student_email, u.phone as student_phone
       FROM tutor_requests r
       JOIN users u ON r.student_id = u.id
       WHERE r.tutor_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tutor inquiries' });
  }
});

app.patch('/api/requests/:id/status', authenticateToken, async (req, res) => {
  const { status, response_message } = req.body;
  const requestId = req.params.id;

  if (!['accepted', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query(
      `UPDATE tutor_requests SET status = ?, response_message = ? WHERE id = ?`,
      [status, response_message || null, requestId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// --------------------------------------------------------------------------
// Favorites Endpoints
// --------------------------------------------------------------------------
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT tutor_id FROM tutor_favorites WHERE student_id = ?', [req.user.id]);
    res.json({ favorites: rows.map((r) => r.tutor_id) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites/toggle', authenticateToken, async (req, res) => {
  const { tutor_id } = req.body;
  if (!tutor_id) return res.status(400).json({ error: 'tutor_id required' });

  try {
    const [existing] = await pool.query(
      'SELECT id FROM tutor_favorites WHERE student_id = ? AND tutor_id = ?',
      [req.user.id, tutor_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM tutor_favorites WHERE id = ?', [existing[0].id]);
      res.json({ isFavorite: false });
    } else {
      const favId = crypto.randomUUID();
      await pool.query('INSERT INTO tutor_favorites (id, student_id, tutor_id) VALUES (?, ?, ?)', [
        favId,
        req.user.id,
        tutor_id,
      ]);
      res.json({ isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// --------------------------------------------------------------------------
// Admin Review Desk Endpoints (Protected for role = 'admin')
// --------------------------------------------------------------------------
app.get('/api/admin/applications', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, u.name, u.email, u.phone
      FROM tutor_profiles t
      JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ` WHERE t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC`;

    const [rows] = await pool.query(query, params);

    const applications = rows.map((app) => {
      ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
        (k) => {
          if (typeof app[k] === 'string') {
            try {
              app[k] = JSON.parse(app[k]);
            } catch (e) {
              app[k] = [];
            }
          }
        }
      );
      return {
        ...app,
        fee_amount: Number(app.fee_amount),
        tutor_profile: {
          id: app.user_id,
          role: 'tutor',
          name: app.name,
          email: app.email,
          phone: app.phone,
        },
      };
    });

    res.json({ applications });
  } catch (err) {
    console.error('Admin fetch applications error:', err);
    res.status(500).json({ error: 'Failed to fetch tutor applications' });
  }
});

app.patch('/api/admin/applications/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { status, admin_notes, reviewer_message } = req.body;
  const appId = req.params.id;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await pool.query(
      `UPDATE tutor_profiles
       SET status = ?, admin_notes = ?, reviewer_message = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, admin_notes || null, reviewer_message || null, appId]
    );

    res.json({ success: true, message: `Application status updated to ${status}` });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

app.get('/api/admin/students', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.email, u.name, u.phone, u.created_at,
             sp.class_level, sp.board, sp.learning_language, sp.subjects, sp.guardian_phone, sp.learning_goals
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [rows] = await pool.query(query, params);

    const students = rows.map((s) => {
      let subjects = s.subjects;
      if (typeof subjects === 'string') {
        try {
          subjects = JSON.parse(subjects);
        } catch {
          subjects = [];
        }
      }
      return {
        ...s,
        subjects: subjects || [],
      };
    });

    res.json({ students });
  } catch (err) {
    console.error('Admin fetch students error:', err);
    res.status(500).json({ error: 'Failed to fetch registered students' });
  }
});

// Bind to 0.0.0.0 so both localhost and mobile devices on local Wi-Fi (192.168.1.253) can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Shikshan Backend API running on port ${PORT}`);
  console.log(`Local machine URL: http://localhost:${PORT}`);
  console.log(`Home Wi-Fi LAN URL: http://192.168.1.253:${PORT}`);
  console.log(`=======================================================`);
});
