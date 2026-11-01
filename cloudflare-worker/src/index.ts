import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_EMAIL?: string;
  ADMIN_PHONE?: string;
};

type Variables = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const api = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --------------------------------------------------------------------------
// Helper: 3-Hour Batch Time Parsing & Overlap Check
// --------------------------------------------------------------------------
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return -1;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) || 0;
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function validateThreeHourBatch(startStr: string, endStr: string): boolean {
  const startMin = parseTimeToMinutes(startStr);
  const endMin = parseTimeToMinutes(endStr);
  if (startMin < 0 || endMin < 0) return false;
  // Fixed duration = 180 minutes (3 hours)
  return endMin - startMin === 180;
}

function isTimeOverlapping(s1: number, e1: number, s2: number, e2: number): boolean {
  return s1 < e2 && e1 > s2;
}

// --------------------------------------------------------------------------
// CORS Configuration
// --------------------------------------------------------------------------
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// --------------------------------------------------------------------------
// Auth Middleware
// --------------------------------------------------------------------------
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return c.json({ error: 'Authentication token required' }, 401);
  }

  try {
    const secret = c.env.JWT_SECRET || 'shikshan-secure-jwt-secret-key-prod-2026';
    const payload = (await verify(token, secret, 'HS256')) as any;
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired authentication token' }, 403);
  }
};

const optionalAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const secret = c.env.JWT_SECRET || 'shikshan-secure-jwt-secret-key-prod-2026';
      const payload = (await verify(token, secret, 'HS256')) as any;
      c.set('user', payload);
    } catch {
      // Ignored for optional auth
    }
  }
  await next();
};

const requireRole = (roles: string[]) => async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || !roles.includes(user.role)) {
    return c.json({ error: 'Access denied: insufficient permissions' }, 403);
  }
  await next();
};

// --------------------------------------------------------------------------
// Root & Health Endpoints
// --------------------------------------------------------------------------
const rootHandler = (c: any) => {
  return c.json({
    status: 'online',
    service: 'Shikshan API',
    tagline: 'Learn with confidence. Grow with guidance.',
    platform: 'Cloudflare Workers (Edge Serverless) + D1 Database',
    version: '2.0.0',
    documentation: {
      health_check: '/api/health',
      description: 'Shikshan Backend REST API for Student & Tutor discovery and academic mentoring across Karnataka.',
    },
    timestamp: new Date().toISOString(),
  });
};

app.get('/', rootHandler);
app.get('/api', rootHandler);

const healthCheckHandler = async (c: any) => {
  try {
    const result: any = await c.env.DB.prepare('SELECT 1 as connected').first();
    const userCount: any = await c.env.DB.prepare('SELECT count(*) as total FROM users').first();

    return c.json({
      status: 'ok',
      service: 'Shikshan API',
      database: {
        status: result?.connected === 1 ? 'connected' : 'degraded',
        engine: 'Cloudflare D1 (Distributed SQLite)',
        registered_users: userCount?.total || 0,
      },
      environment: 'production',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Health check database query failed:', err);
    return c.json(
      {
        status: 'error',
        service: 'Shikshan API',
        database: {
          status: 'disconnected',
          error: 'D1 database binding failed or query timed out',
        },
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
};

app.get('/health', healthCheckHandler);
api.get('/health', healthCheckHandler);

// --------------------------------------------------------------------------
// Authentication Endpoints
// --------------------------------------------------------------------------
api.post('/auth/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password, role, name, phone, photo_url } = body;

  if (!email || !password || !role || !name || !phone) {
    return c.json({ error: 'All fields are required (email, password, role, name, phone)' }, 400);
  }

  if (!['student', 'tutor'].includes(role)) {
    return c.json({ error: 'Role must be student or tutor' }, 400);
  }

  // Tutors must have a profile photo
  if (role === 'tutor' && (!photo_url || typeof photo_url !== 'string' || photo_url.trim() === '')) {
    return c.json({ error: 'A profile photo is mandatory for tutor registration' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase().trim()).first();
    if (existing) {
      return c.json({ error: 'An account with this email already exists' }, 409);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, role, name, phone, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, email.toLowerCase().trim(), password_hash, role, name.trim(), phone.trim(), photo_url || null)
      .run();

    const secret = c.env.JWT_SECRET || 'shikshan-secure-jwt-secret-key-prod-2026';
    const token = await sign(
      {
        id: userId,
        email: email.toLowerCase().trim(),
        role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
      },
      secret
    );

    return c.json(
      {
        token,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          role,
          name: name.trim(),
          phone: phone.trim(),
          photo_url: photo_url || null,
        },
      },
      201
    );
  } catch (err: any) {
    console.error('Registration error:', err);
    return c.json({ error: 'Failed to create user account' }, 500);
  }
});

api.post('/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  try {
    const user: any = await c.env.DB.prepare(
      'SELECT id, email, password_hash, role, name, phone, photo_url FROM users WHERE email = ?'
    )
      .bind(email.toLowerCase().trim())
      .first();

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const secret = c.env.JWT_SECRET || 'shikshan-secure-jwt-secret-key-prod-2026';
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
      },
      secret
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        photo_url: user.photo_url || null,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return c.json({ error: 'Login authentication failed' }, 500);
  }
});

api.get('/auth/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  try {
    const user: any = await c.env.DB.prepare(
      'SELECT id, email, role, name, phone, photo_url FROM users WHERE id = ?'
    )
      .bind(authUser.id)
      .first();

    if (!user) {
      return c.json({ error: 'User record not found' }, 404);
    }

    return c.json({ user });
  } catch {
    return c.json({ error: 'Failed to retrieve user profile' }, 500);
  }
});

// Photo Upload / Replace / Remove
api.post('/user/photo', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { photo_url } = body;

  if (!photo_url || typeof photo_url !== 'string') {
    return c.json({ error: 'Valid photo_url is required' }, 400);
  }

  try {
    await c.env.DB.prepare('UPDATE users SET photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(photo_url, authUser.id)
      .run();

    if (authUser.role === 'student') {
      await c.env.DB.prepare('UPDATE student_profiles SET photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(photo_url, authUser.id)
        .run();
    } else if (authUser.role === 'tutor') {
      await c.env.DB.prepare('UPDATE tutor_profiles SET photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(photo_url, authUser.id)
        .run();
    }

    return c.json({ success: true, photo_url });
  } catch (err: any) {
    console.error('Save photo error:', err);
    return c.json({ error: 'Failed to update profile photo' }, 500);
  }
});

api.delete('/user/photo', authMiddleware, async (c) => {
  const authUser = c.get('user');
  try {
    await c.env.DB.prepare('UPDATE users SET photo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(authUser.id)
      .run();

    if (authUser.role === 'student') {
      await c.env.DB.prepare('UPDATE student_profiles SET photo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(authUser.id)
        .run();
    } else if (authUser.role === 'tutor') {
      await c.env.DB.prepare('UPDATE tutor_profiles SET photo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(authUser.id)
        .run();
    }

    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Failed to delete profile photo' }, 500);
  }
});

// --------------------------------------------------------------------------
// Student Profile Endpoints
// --------------------------------------------------------------------------
api.post('/student/profile', authMiddleware, requireRole(['student', 'admin']), async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { class_level, board, learning_language, subjects, guardian_phone, learning_goals, photo_url } = body;

  if (!class_level || !board || !learning_language || !subjects) {
    return c.json({ error: 'Required fields: class_level, board, learning_language, subjects' }, 400);
  }

  try {
    const profileId = crypto.randomUUID();
    const subjectsJson = typeof subjects === 'string' ? subjects : JSON.stringify(subjects);

    await c.env.DB.prepare(
      `INSERT INTO student_profiles (id, user_id, class_level, board, learning_language, subjects, guardian_phone, learning_goals, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         class_level = excluded.class_level,
         board = excluded.board,
         learning_language = excluded.learning_language,
         subjects = excluded.subjects,
         guardian_phone = excluded.guardian_phone,
         learning_goals = excluded.learning_goals,
         photo_url = COALESCE(excluded.photo_url, student_profiles.photo_url),
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(
        profileId,
        authUser.id,
        class_level,
        board,
        learning_language,
        subjectsJson,
        guardian_phone || null,
        learning_goals || null,
        photo_url || null
      )
      .run();

    if (photo_url) {
      await c.env.DB.prepare('UPDATE users SET photo_url = ? WHERE id = ?').bind(photo_url, authUser.id).run();
    }

    return c.json({ success: true, message: 'Student profile saved successfully' });
  } catch (err: any) {
    console.error('Student profile error:', err);
    return c.json({ error: 'Failed to save student profile' }, 500);
  }
});

api.get('/student/profile', authMiddleware, async (c) => {
  const authUser = c.get('user');
  try {
    const profile: any = await c.env.DB.prepare(
      `SELECT sp.*, u.name, u.email, u.phone, u.photo_url as user_photo
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ?`
    )
      .bind(authUser.id)
      .first();

    if (!profile) {
      return c.json({ profile: null });
    }

    if (typeof profile.subjects === 'string') {
      try {
        profile.subjects = JSON.parse(profile.subjects);
      } catch {
        profile.subjects = [];
      }
    }

    return c.json({
      profile: {
        ...profile,
        photo_url: profile.photo_url || profile.user_photo || null,
      },
    });
  } catch {
    return c.json({ error: 'Failed to retrieve student profile' }, 500);
  }
});

// --------------------------------------------------------------------------
// Tutor Profile & Application Endpoints
// --------------------------------------------------------------------------
api.post('/tutor/profile', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
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
    photo_url,
  } = body;

  // Mandatory photo validation
  if (!photo_url || typeof photo_url !== 'string' || photo_url.trim() === '') {
    return c.json({ error: 'A profile photo is mandatory for tutor registration' }, 400);
  }

  // Monthly fee validation: maximum ₹3,000
  const feeNum = Number(fee_amount);
  if (isNaN(feeNum) || feeNum <= 0 || feeNum > 3000) {
    return c.json({ error: 'Monthly fee must be a valid amount up to ₹3,000' }, 400);
  }

  if (
    !education_level ||
    !course_qualification ||
    !institution_name ||
    !subjects ||
    !class_levels ||
    !board_familiarity ||
    !teaching_languages ||
    !bio_intro
  ) {
    return c.json({ error: 'All core academic qualification fields are required' }, 400);
  }

  try {
    const profileId = crypto.randomUUID();
    const toJ = (v: any) => (typeof v === 'string' ? v : JSON.stringify(v || []));

    await c.env.DB.prepare(
      `INSERT INTO tutor_profiles (
        id, user_id, education_level, course_qualification, institution_name,
        subjects, class_levels, board_familiarity, teaching_languages,
        bio_intro, teaching_experience, available_days, time_windows,
        hours_per_day, requested_fee, fee_amount, fee_unit, status, photo_url, approval_acknowledged
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'per_month', 'pending', ?, 0)
       ON CONFLICT(user_id) DO UPDATE SET
         education_level = excluded.education_level,
         course_qualification = excluded.course_qualification,
         institution_name = excluded.institution_name,
         subjects = excluded.subjects,
         class_levels = excluded.class_levels,
         board_familiarity = excluded.board_familiarity,
         teaching_languages = excluded.teaching_languages,
         bio_intro = excluded.bio_intro,
         teaching_experience = excluded.teaching_experience,
         available_days = excluded.available_days,
         time_windows = excluded.time_windows,
         hours_per_day = excluded.hours_per_day,
         requested_fee = excluded.requested_fee,
         fee_amount = excluded.fee_amount,
         fee_unit = 'per_month',
         photo_url = excluded.photo_url,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(
        profileId,
        authUser.id,
        education_level,
        course_qualification,
        institution_name,
        toJ(subjects),
        toJ(class_levels),
        toJ(board_familiarity),
        toJ(teaching_languages),
        bio_intro,
        teaching_experience || null,
        toJ(available_days),
        toJ(time_windows),
        hours_per_day || 2,
        feeNum,
        feeNum,
        photo_url
      )
      .run();

    await c.env.DB.prepare('UPDATE users SET photo_url = ? WHERE id = ?').bind(photo_url, authUser.id).run();

    return c.json({ success: true, message: 'Tutor application submitted for manual verification' });
  } catch (err: any) {
    console.error('Tutor profile error:', err);
    return c.json({ error: 'Failed to submit tutor application' }, 500);
  }
});

api.get('/tutor/my-status', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  try {
    const app: any = await c.env.DB.prepare(
      `SELECT t.*, u.name, u.email, u.phone, u.photo_url as user_photo, t.photo_url as tutor_photo
       FROM tutor_profiles t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = ?`
    )
      .bind(authUser.id)
      .first();

    if (!app) {
      return c.json({ application: null });
    }

    ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
      (k) => {
        if (typeof app[k] === 'string') {
          try {
            app[k] = JSON.parse(app[k]);
          } catch {
            app[k] = [];
          }
        }
      }
    );

    return c.json({
      application: {
        ...app,
        photo_url: app.tutor_photo || app.user_photo || null,
        fee_amount: Number(app.fee_amount) || 3000,
        requested_fee: Number(app.requested_fee) || Number(app.fee_amount) || 3000,
        approval_acknowledged: Boolean(app.approval_acknowledged),
      },
    });
  } catch {
    return c.json({ error: 'Failed to retrieve application status' }, 500);
  }
});

// Acknowledge approval celebratory event (shown only once)
api.post('/tutor/acknowledge-approval', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  try {
    await c.env.DB.prepare(
      'UPDATE tutor_profiles SET approval_acknowledged = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    )
      .bind(authUser.id)
      .run();
    return c.json({ success: true, message: 'Approval acknowledged' });
  } catch {
    return c.json({ error: 'Failed to acknowledge approval' }, 500);
  }
});

// --------------------------------------------------------------------------
// Batch Management Endpoints (Strict 4-Student Capacity, Fixed 3-Hour Batches)
// --------------------------------------------------------------------------
api.get('/tutor/batches', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT b.*,
              (SELECT count(DISTINCT r.student_id) FROM tutor_requests r WHERE r.batch_id = b.id AND r.status = 'accepted') as enrolled_count
       FROM tutor_batches b
       WHERE b.tutor_id = ?
       ORDER BY b.start_time ASC`
    )
      .bind(authUser.id)
      .all();

    const batches = (results || []).map((b: any) => {
      const distinctCount = Number(b.enrolled_count || 0);
      return {
        ...b,
        enrolled_count: distinctCount,
        max_capacity: 4,
        remaining_seats: Math.max(0, 4 - distinctCount),
        is_full: distinctCount >= 4,
      };
    });

    return c.json({ batches });
  } catch {
    return c.json({ error: 'Failed to fetch tutor batches' }, 500);
  }
});

api.post('/tutor/batches', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { name, start_time, end_time, days } = body;

  if (!name || !start_time || !end_time || !days) {
    return c.json({ error: 'All batch fields are required: name, start_time, end_time, days' }, 400);
  }

  // Validate exact 3-hour duration
  if (!validateThreeHourBatch(start_time, end_time)) {
    return c.json({ error: 'Every batch must have a fixed duration of exactly 3 hours (e.g. 7:00 AM - 10:00 AM)' }, 400);
  }

  const newStartMin = parseTimeToMinutes(start_time);
  const newEndMin = parseTimeToMinutes(end_time);

  try {
    // Check overlapping batches for this tutor
    const { results: existingBatches } = await c.env.DB.prepare(
      'SELECT id, name, start_time, end_time, days FROM tutor_batches WHERE tutor_id = ?'
    )
      .bind(authUser.id)
      .all();

    for (const eb of (existingBatches || []) as any[]) {
      const eStart = parseTimeToMinutes(eb.start_time);
      const eEnd = parseTimeToMinutes(eb.end_time);
      if (isTimeOverlapping(newStartMin, newEndMin, eStart, eEnd)) {
        return c.json(
          {
            error: `Batch time overlaps with existing batch "${eb.name}" (${eb.start_time} - ${eb.end_time})`,
          },
          400
        );
      }
    }

    const batchId = crypto.randomUUID();
    const daysStr = typeof days === 'string' ? days : JSON.stringify(days);

    await c.env.DB.prepare(
      `INSERT INTO tutor_batches (id, tutor_id, name, start_time, end_time, days, max_capacity)
       VALUES (?, ?, ?, ?, ?, ?, 4)`
    )
      .bind(batchId, authUser.id, name.trim(), start_time.trim(), end_time.trim(), daysStr)
      .run();

    return c.json({ success: true, batchId }, 201);
  } catch (err: any) {
    console.error('Create batch error:', err);
    return c.json({ error: 'Failed to create batch' }, 500);
  }
});

api.delete('/tutor/batches/:id', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const batchId = c.req.param('id');

  try {
    // Check if batch has accepted students
    const activeReq: any = await c.env.DB.prepare(
      `SELECT count(*) as count FROM tutor_requests WHERE batch_id = ? AND status = 'accepted'`
    )
      .bind(batchId)
      .first();

    if (activeReq && activeReq.count > 0) {
      return c.json({ error: 'Cannot delete batch with active enrolled students' }, 400);
    }

    await c.env.DB.prepare('DELETE FROM tutor_batches WHERE id = ? AND tutor_id = ?')
      .bind(batchId, authUser.id)
      .run();

    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Failed to delete batch' }, 500);
  }
});

api.get('/tutor/batches/:id/students', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const batchId = c.req.param('id');

  try {
    const batch: any = await c.env.DB.prepare(
      'SELECT id, name, start_time, end_time, days, tutor_id FROM tutor_batches WHERE id = ?'
    )
      .bind(batchId)
      .first();

    if (!batch) {
      return c.json({ error: 'Batch not found' }, 404);
    }

    if (authUser.role !== 'admin' && batch.tutor_id !== authUser.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { results } = await c.env.DB.prepare(
      `SELECT r.id as request_id, r.student_id, r.subject, r.class_level, r.learning_needs,
              r.guardian_phone, r.created_at, r.updated_at, r.status,
              u.name as student_name, u.email as student_email, u.phone as student_phone, u.photo_url as student_photo
       FROM tutor_requests r
       JOIN users u ON r.student_id = u.id
       WHERE r.batch_id = ? AND r.status = 'accepted'
       GROUP BY r.student_id
       ORDER BY r.updated_at DESC`
    )
      .bind(batchId)
      .all();

    return c.json({ batch, students: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch batch students' }, 500);
  }
});

api.post('/tutor/batches/:id/assign', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const batchId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { requestId } = body;

  if (!requestId) {
    return c.json({ error: 'requestId is required' }, 400);
  }

  try {
    // 1. Validate batch exists
    const batch: any = await c.env.DB.prepare(
      'SELECT id, name, start_time, end_time, days, tutor_id FROM tutor_batches WHERE id = ?'
    )
      .bind(batchId)
      .first();

    if (!batch) {
      return c.json({ error: 'Batch not found' }, 404);
    }

    // 2. Validate tutor owns batch
    if (authUser.role !== 'admin' && batch.tutor_id !== authUser.id) {
      return c.json({ error: 'Forbidden: Access denied to manage this batch' }, 403);
    }

    // 3. Validate student request exists and belongs to this tutor
    const reqItem: any = await c.env.DB.prepare(
      'SELECT id, student_id, tutor_id, status FROM tutor_requests WHERE id = ?'
    )
      .bind(requestId)
      .first();

    if (!reqItem) {
      return c.json({ error: 'Student request not found' }, 404);
    }

    if (authUser.role !== 'admin' && reqItem.tutor_id !== authUser.id) {
      return c.json({ error: 'Forbidden: Student request does not belong to this tutor' }, 403);
    }

    if (reqItem.status !== 'accepted') {
      return c.json({ error: 'Only accepted student requests can be assigned to a batch' }, 400);
    }

    // 4. Strict duplicate assignment prevention: Check if student already enrolled in this batch
    const alreadyEnrolled: any = await c.env.DB.prepare(
      `SELECT id FROM tutor_requests WHERE batch_id = ? AND student_id = ? AND status = 'accepted'`
    )
      .bind(batchId, reqItem.student_id)
      .first();

    if (alreadyEnrolled) {
      return c.json({ error: 'This student is already enrolled in this batch.' }, 400);
    }

    // 5. Strict maximum capacity check (concurrency-safe distinct active count)
    const countRes: any = await c.env.DB.prepare(
      `SELECT count(DISTINCT student_id) as count FROM tutor_requests WHERE batch_id = ? AND status = 'accepted'`
    )
      .bind(batchId)
      .first();

    const currentCount = Number(countRes?.count || 0);
    if (currentCount >= 4) {
      return c.json({ error: 'Batch is full (maximum 4 students allowed)' }, 400);
    }

    const batchTimeStr = `${batch.start_time} - ${batch.end_time}`;
    await c.env.DB.prepare(
      `UPDATE tutor_requests
       SET batch_id = ?, batch_name = ?, batch_time = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(batch.id, batch.name, batchTimeStr, requestId)
      .run();

    return c.json({ success: true, message: 'Student successfully assigned to batch' });
  } catch (err: any) {
    console.error('Assign student error:', err);
    return c.json({ error: 'Failed to assign student to batch' }, 500);
  }
});

api.post('/tutor/batches/:id/unassign', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  const batchId = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { requestId } = body;

  if (!requestId) {
    return c.json({ error: 'requestId is required' }, 400);
  }

  try {
    const batch: any = await c.env.DB.prepare(
      'SELECT id, tutor_id FROM tutor_batches WHERE id = ?'
    )
      .bind(batchId)
      .first();

    if (!batch) {
      return c.json({ error: 'Batch not found' }, 404);
    }

    if (authUser.role !== 'admin' && batch.tutor_id !== authUser.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await c.env.DB.prepare(
      `UPDATE tutor_requests
       SET batch_id = NULL, batch_name = NULL, batch_time = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND batch_id = ?`
    )
      .bind(requestId, batchId)
      .run();

    return c.json({ success: true, message: 'Student removed from batch' });
  } catch {
    return c.json({ error: 'Failed to unassign student from batch' }, 500);
  }
});

api.get('/tutors/:id/batches', optionalAuthMiddleware, async (c) => {
  const tutorId = c.req.param('id');
  try {
    // Resolve tutor user_id from tutor profile id or user_id
    const tp: any = await c.env.DB.prepare(
      'SELECT user_id FROM tutor_profiles WHERE id = ? OR user_id = ?'
    )
      .bind(tutorId, tutorId)
      .first();

    const actualUserId = tp ? tp.user_id : tutorId;

    const { results } = await c.env.DB.prepare(
      `SELECT b.*,
              (SELECT count(DISTINCT r.student_id) FROM tutor_requests r WHERE r.batch_id = b.id AND r.status = 'accepted') as enrolled_count
       FROM tutor_batches b
       WHERE b.tutor_id = ?
       ORDER BY b.start_time ASC`
    )
      .bind(actualUserId)
      .all();

    const batches = (results || []).map((b: any) => {
      const distinctCount = Number(b.enrolled_count || 0);
      return {
        ...b,
        enrolled_count: distinctCount,
        max_capacity: 4,
        remaining_seats: Math.max(0, 4 - distinctCount),
        is_full: distinctCount >= 4,
      };
    });

    return c.json({ batches });
  } catch {
    return c.json({ error: 'Failed to fetch batches for tutor' }, 500);
  }
});

// --------------------------------------------------------------------------
// Public / Approved Tutors Discovery (Strict Privacy: Phone hidden before acceptance)
// --------------------------------------------------------------------------
api.get('/tutors', optionalAuthMiddleware, async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT t.id, t.user_id, t.education_level, t.course_qualification, t.institution_name,
              t.subjects, t.class_levels, t.board_familiarity, t.teaching_languages,
              t.bio_intro, t.teaching_experience, t.available_days, t.time_windows,
              t.hours_per_day, t.fee_amount, t.requested_fee, t.fee_unit, t.status, t.created_at,
              u.name, u.email, u.phone, u.photo_url as user_photo, t.photo_url as tutor_photo
       FROM tutor_profiles t
       JOIN users u ON t.user_id = u.id
       WHERE t.status = 'approved'
       ORDER BY t.created_at DESC`
    ).all();

    // Determine which tutors' phone numbers the caller is authorized to see
    let authorizedTutorIds = new Set<string>();
    if (authUser) {
      if (authUser.role === 'admin') {
        authorizedTutorIds = new Set((results || []).map((t: any) => t.user_id));
      } else {
        authorizedTutorIds.add(authUser.id); // Own phone
        if (authUser.role === 'student') {
          // Tutors who accepted this student's request
          const { results: acceptedReqs } = await c.env.DB.prepare(
            `SELECT tutor_id FROM tutor_requests WHERE student_id = ? AND status = 'accepted'`
          )
            .bind(authUser.id)
            .all();
          (acceptedReqs || []).forEach((r: any) => authorizedTutorIds.add(r.tutor_id));
        }
      }
    }

    const tutors = (results || []).map((t: any) => {
      ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
        (k) => {
          if (typeof t[k] === 'string') {
            try {
              t[k] = JSON.parse(t[k]);
            } catch {
              t[k] = [];
            }
          }
        }
      );

      const isAuthorized = authorizedTutorIds.has(t.user_id);
      const safePhone = isAuthorized ? t.phone : null;

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
        hours_per_day: t.hours_per_day || 2,
        fee_amount: Number(t.fee_amount) || 3000,
        fee_unit: 'per_month',
        proposed_rate: Number(t.fee_amount) || 3000,
        status: t.status,
        photo_url: t.tutor_photo || t.user_photo || null,
        created_at: t.created_at,
        is_phone_revealed: isAuthorized,
        tutor_profile: {
          id: t.user_id,
          role: 'tutor',
          name: t.name,
          email: t.email,
          phone: safePhone,
          photo_url: t.tutor_photo || t.user_photo || null,
        },
      };
    });

    return c.json({ tutors });
  } catch (err: any) {
    console.error('Fetch tutors error:', err);
    return c.json({ error: 'Failed to fetch tutor listings' }, 500);
  }
});

api.get('/tutors/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const authUser = c.get('user');

  try {
    const t: any = await c.env.DB.prepare(
      `SELECT t.*, u.name, u.email, u.phone, u.photo_url as user_photo, t.photo_url as tutor_photo
       FROM tutor_profiles t
       JOIN users u ON t.user_id = u.id
       WHERE (t.id = ? OR t.user_id = ?) AND t.status = 'approved'`
    )
      .bind(id, id)
      .first();

    if (!t) {
      return c.json({ error: 'Tutor not found or not approved' }, 404);
    }

    ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
      (k) => {
        if (typeof t[k] === 'string') {
          try {
            t[k] = JSON.parse(t[k]);
          } catch {
            t[k] = [];
          }
        }
      }
    );

    // Private phone authorization check
    let isAuthorized = false;
    if (authUser) {
      if (authUser.role === 'admin' || authUser.id === t.user_id) {
        isAuthorized = true;
      } else if (authUser.role === 'student') {
        const accepted: any = await c.env.DB.prepare(
          `SELECT id FROM tutor_requests WHERE student_id = ? AND tutor_id = ? AND status = 'accepted'`
        )
          .bind(authUser.id, t.user_id)
          .first();
        if (accepted) isAuthorized = true;
      }
    }

    const safePhone = isAuthorized ? t.phone : null;

    return c.json({
      tutor: {
        ...t,
        photo_url: t.tutor_photo || t.user_photo || null,
        fee_amount: Number(t.fee_amount) || 3000,
        fee_unit: 'per_month',
        is_phone_revealed: isAuthorized,
        tutor_profile: {
          id: t.user_id,
          role: 'tutor',
          name: t.name,
          email: t.email,
          phone: safePhone,
          photo_url: t.tutor_photo || t.user_photo || null,
        },
      },
    });
  } catch {
    return c.json({ error: 'Failed to fetch tutor details' }, 500);
  }
});

// --------------------------------------------------------------------------
// Tutor Requests / Student Inquiries (Batch Capacity & Duplicate Protection)
// --------------------------------------------------------------------------
api.post('/requests', authMiddleware, requireRole(['student']), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { tutor_id, batch_id, batch_name, batch_time, subject, class_level, learning_needs, preferred_schedule, guardian_phone } = body;
  const authUser = c.get('user');

  if (!tutor_id || !subject || !class_level || !learning_needs) {
    return c.json({ error: 'Required fields: tutor_id, subject, class_level, learning_needs' }, 400);
  }

  // Short text protection (min 2 characters, sensible max 500)
  if (learning_needs.trim().length < 2) {
    return c.json({ error: 'Please enter a learning need or topic' }, 400);
  }

  try {
    // 1. Duplicate active request protection
    const existing: any = await c.env.DB.prepare(
      `SELECT id, status FROM tutor_requests WHERE student_id = ? AND tutor_id = ? AND status IN ('pending', 'accepted')`
    )
      .bind(authUser.id, tutor_id)
      .first();

    if (existing) {
      return c.json({ error: 'You have already applied to this tutor.' }, 400);
    }

    // 2. Batch capacity check (max 4 distinct accepted students)
    if (batch_id) {
      const countRes: any = await c.env.DB.prepare(
        `SELECT count(DISTINCT student_id) as count FROM tutor_requests WHERE batch_id = ? AND status = 'accepted'`
      )
        .bind(batch_id)
        .first();

      if (countRes && Number(countRes.count) >= 4) {
        return c.json({ error: 'This batch is full (4 of 4 students reached).' }, 400);
      }
    }

    const requestId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO tutor_requests (id, student_id, tutor_id, batch_id, batch_name, batch_time, subject, class_level, learning_needs, preferred_schedule, guardian_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        requestId,
        authUser.id,
        tutor_id,
        batch_id || null,
        batch_name || null,
        batch_time || null,
        subject.trim(),
        class_level.trim(),
        learning_needs.trim(),
        preferred_schedule || null,
        guardian_phone || null
      )
      .run();

    return c.json({ success: true, requestId }, 201);
  } catch (err: any) {
    console.error('Create request error:', err);
    return c.json({ error: 'Failed to submit tutor request' }, 500);
  }
});

api.get('/requests/student', authMiddleware, requireRole(['student']), async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT r.*, u.name as tutor_name, u.email as tutor_email,
              CASE WHEN r.status = 'accepted' THEN u.phone ELSE NULL END as tutor_phone,
              u.photo_url as tutor_photo,
              p.status as payment_status
       FROM tutor_requests r
       JOIN users u ON r.tutor_id = u.id
       LEFT JOIN payment_coordinations p ON p.request_id = r.id
       WHERE r.student_id = ?
       ORDER BY r.created_at DESC`
    )
      .bind(authUser.id)
      .all();

    return c.json({ requests: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch student requests' }, 500);
  }
});

api.get('/requests/tutor', authMiddleware, requireRole(['tutor', 'admin']), async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT r.*, u.name as student_name, u.email as student_email, u.phone as student_phone, u.photo_url as student_photo,
              (SELECT count(DISTINCT sub.student_id) FROM tutor_requests sub WHERE sub.batch_id = r.batch_id AND sub.status = 'accepted') as batch_enrolled_count
       FROM tutor_requests r
       JOIN users u ON r.student_id = u.id
       WHERE r.tutor_id = ?
       ORDER BY r.created_at DESC`
    )
      .bind(authUser.id)
      .all();

    return c.json({ requests: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch tutor inquiries' }, 500);
  }
});

api.patch('/requests/:id/status', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { status, response_message } = body;
  const authUser = c.get('user');

  if (!['accepted', 'declined', 'cancelled'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  try {
    // If accepting, verify batch capacity does not exceed 4 students
    if (status === 'accepted') {
      const reqItem: any = await c.env.DB.prepare(
        'SELECT batch_id, tutor_id FROM tutor_requests WHERE id = ?'
      )
        .bind(id)
        .first();

      if (reqItem?.batch_id) {
        const countRes: any = await c.env.DB.prepare(
          `SELECT count(*) as count FROM tutor_requests WHERE batch_id = ? AND status = 'accepted' AND id != ?`
        )
          .bind(reqItem.batch_id, id)
          .first();

        if (countRes && countRes.count >= 4) {
          return c.json({ error: 'Cannot accept request: batch is already full (4 students maximum)' }, 400);
        }
      }
    }

    await c.env.DB.prepare(
      `UPDATE tutor_requests SET status = ?, response_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    )
      .bind(status, response_message || null, id)
      .run();

    return c.json({ success: true, message: `Request status updated to ${status}` });
  } catch {
    return c.json({ error: 'Failed to update request status' }, 500);
  }
});

// --------------------------------------------------------------------------
// Student Favorites Endpoints
// --------------------------------------------------------------------------
api.get('/favorites', authMiddleware, async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT tutor_id FROM tutor_favorites WHERE student_id = ?`
    )
      .bind(authUser.id)
      .all();

    const favorites = (results || []).map((r: any) => r.tutor_id);
    return c.json({ favorites });
  } catch {
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

api.post('/favorites/toggle', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { tutor_id } = body;

  if (!tutor_id) return c.json({ error: 'tutor_id is required' }, 400);

  try {
    const existing: any = await c.env.DB.prepare(
      'SELECT id FROM tutor_favorites WHERE student_id = ? AND tutor_id = ?'
    )
      .bind(authUser.id, tutor_id)
      .first();

    if (existing) {
      await c.env.DB.prepare('DELETE FROM tutor_favorites WHERE id = ?').bind(existing.id).run();
      return c.json({ favorited: false });
    } else {
      const favId = crypto.randomUUID();
      await c.env.DB.prepare(
        'INSERT INTO tutor_favorites (id, student_id, tutor_id) VALUES (?, ?, ?)'
      )
        .bind(favId, authUser.id, tutor_id)
        .run();
      return c.json({ favorited: true });
    }
  } catch {
    return c.json({ error: 'Failed to toggle favorite' }, 500);
  }
});

// --------------------------------------------------------------------------
// Manual Payment Coordination Endpoints (Part 13)
// --------------------------------------------------------------------------
api.post('/payment/interest', authMiddleware, requireRole(['student']), async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { request_id } = body;

  if (!request_id) {
    return c.json({ error: 'request_id is required' }, 400);
  }

  try {
    // Verify request is accepted and belongs to student
    const reqItem: any = await c.env.DB.prepare(
      `SELECT r.*, t.fee_amount
       FROM tutor_requests r
       JOIN tutor_profiles t ON r.tutor_id = t.user_id
       WHERE r.id = ? AND r.student_id = ?`
    )
      .bind(request_id, authUser.id)
      .first();

    if (!reqItem) {
      return c.json({ error: 'Request not found or does not belong to you' }, 404);
    }

    if (reqItem.status !== 'accepted') {
      return c.json({ error: 'Payment coordination can only be initiated after your tutor accepts the request' }, 400);
    }

    const coordId = crypto.randomUUID();
    const monthlyFee = Number(reqItem.fee_amount) || 3000;

    await c.env.DB.prepare(
      `INSERT INTO payment_coordinations (id, request_id, student_id, tutor_id, monthly_fee, status)
       VALUES (?, ?, ?, ?, ?, 'interested')
       ON CONFLICT(request_id) DO UPDATE SET
         status = 'interested',
         monthly_fee = excluded.monthly_fee,
         updated_at = CURRENT_TIMESTAMP`
    )
      .bind(coordId, request_id, authUser.id, reqItem.tutor_id, monthlyFee)
      .run();

    return c.json({
      success: true,
      message: "Your interest in proceeding with payment has been recorded. Shikshan support will contact you to coordinate.",
    });
  } catch (err: any) {
    console.error('Payment interest error:', err);
    return c.json({ error: 'Failed to record payment interest' }, 500);
  }
});

api.get('/payment/student', authMiddleware, requireRole(['student']), async (c) => {
  const authUser = c.get('user');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT p.*, u.name as tutor_name, u.email as tutor_email, u.phone as tutor_phone, r.subject, r.batch_name
       FROM payment_coordinations p
       JOIN users u ON p.tutor_id = u.id
       JOIN tutor_requests r ON p.request_id = r.id
       WHERE p.student_id = ?
       ORDER BY p.updated_at DESC`
    )
      .bind(authUser.id)
      .all();

    return c.json({ payments: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch payment records' }, 500);
  }
});

api.get('/payment/admin', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT p.*,
              s.name as student_name, s.email as student_email, s.phone as student_phone,
              t.name as tutor_name, t.email as tutor_email, t.phone as tutor_phone,
              r.subject, r.batch_name
       FROM payment_coordinations p
       JOIN users s ON p.student_id = s.id
       JOIN users t ON p.tutor_id = t.id
       JOIN tutor_requests r ON p.request_id = r.id
       ORDER BY p.updated_at DESC`
    ).all();

    return c.json({ payments: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch admin payment coordinations' }, 500);
  }
});

api.patch('/payment/admin/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id');
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { status, amount_collected, admin_notes } = body;

  const validStatuses = ['not_interested', 'interested', 'awaiting_admin_contact', 'payment_pending', 'partially_paid', 'paid', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return c.json({ error: 'Invalid payment status' }, 400);
  }

  try {
    await c.env.DB.prepare(
      `UPDATE payment_coordinations
       SET status = COALESCE(?, status),
           amount_collected = COALESCE(?, amount_collected),
           admin_notes = COALESCE(?, admin_notes),
           payment_date = CASE WHEN ? = 'paid' THEN CURRENT_TIMESTAMP ELSE payment_date END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(status || null, amount_collected !== undefined ? Number(amount_collected) : null, admin_notes || null, status || null, id)
      .run();

    // Audit log
    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
       VALUES (?, ?, 'UPDATE_PAYMENT_STATUS', 'PAYMENT', ?, ?)`
    )
      .bind(logId, authUser.id, id, JSON.stringify({ status, amount_collected, admin_notes }))
      .run();

    return c.json({ success: true, message: 'Payment record updated' });
  } catch (err: any) {
    console.error('Update payment error:', err);
    return c.json({ error: 'Failed to update payment record' }, 500);
  }
});

// --------------------------------------------------------------------------
// Admin Review Desk & Directory Endpoints (Protected for role = 'admin')
// --------------------------------------------------------------------------
api.get('/admin/applications', authMiddleware, requireRole(['admin']), async (c) => {
  const status = c.req.query('status');
  try {
    let query = `
      SELECT t.*, u.name, u.email, u.phone, u.photo_url as user_photo, t.photo_url as tutor_photo
      FROM tutor_profiles t
      JOIN users u ON t.user_id = u.id
    `;
    const params: string[] = [];

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query += ` WHERE t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.created_at DESC`;

    const stmt = params.length > 0 ? c.env.DB.prepare(query).bind(...params) : c.env.DB.prepare(query);
    const { results } = await stmt.all();

    const applications = (results || []).map((app: any) => {
      ['subjects', 'class_levels', 'board_familiarity', 'teaching_languages', 'available_days', 'time_windows'].forEach(
        (k) => {
          if (typeof app[k] === 'string') {
            try {
              app[k] = JSON.parse(app[k]);
            } catch {
              app[k] = [];
            }
          }
        }
      );
      return {
        ...app,
        photo_url: app.tutor_photo || app.user_photo || null,
        fee_amount: Number(app.fee_amount) || 3000,
        requested_fee: Number(app.requested_fee) || Number(app.fee_amount) || 3000,
        tutor_profile: {
          id: app.user_id,
          role: 'tutor',
          name: app.name,
          email: app.email,
          phone: app.phone,
          photo_url: app.tutor_photo || app.user_photo || null,
        },
      };
    });

    return c.json({ applications });
  } catch (err: any) {
    console.error('Admin fetch applications error:', err);
    return c.json({ error: 'Failed to fetch tutor applications' }, 500);
  }
});

api.patch('/admin/applications/:id/status', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id');
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { status, approved_fee, admin_notes, reviewer_message } = body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  // Monthly fee validation (maximum ₹3,000)
  let feeUpdate: number | null = null;
  if (approved_fee !== undefined && approved_fee !== null) {
    const f = Number(approved_fee);
    if (isNaN(f) || f <= 0 || f > 3000) {
      return c.json({ error: 'Approved monthly fee cannot exceed ₹3,000' }, 400);
    }
    feeUpdate = f;
  }

  try {
    await c.env.DB.prepare(
      `UPDATE tutor_profiles
       SET status = ?,
           fee_amount = COALESCE(?, fee_amount),
           admin_notes = ?,
           reviewer_message = ?,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(status, feeUpdate, admin_notes || null, reviewer_message || null, id)
      .run();

    // Audit log
    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
       VALUES (?, ?, 'UPDATE_APPLICATION_STATUS', 'TUTOR_APPLICATION', ?, ?)`
    )
      .bind(logId, authUser.id, id, JSON.stringify({ status, approved_fee: feeUpdate, admin_notes }))
      .run();

    return c.json({ success: true, message: `Application status updated to ${status}` });
  } catch (err: any) {
    console.error('Update status error:', err);
    return c.json({ error: 'Failed to update application status' }, 500);
  }
});

api.patch('/admin/tutor/:id/fee', authMiddleware, requireRole(['admin']), async (c) => {
  const id = c.req.param('id');
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { monthly_fee } = body;

  const feeNum = Number(monthly_fee);
  if (isNaN(feeNum) || feeNum <= 0 || feeNum > 3000) {
    return c.json({ error: 'Monthly fee must be a valid amount up to ₹3,000' }, 400);
  }

  try {
    await c.env.DB.prepare(
      `UPDATE tutor_profiles
       SET fee_amount = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? OR user_id = ?`
    )
      .bind(feeNum, id, id)
      .run();

    // Audit log
    const logId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
       VALUES (?, ?, 'UPDATE_TUTOR_FEE', 'TUTOR', ?, ?)`
    )
      .bind(logId, authUser.id, id, JSON.stringify({ monthly_fee: feeNum }))
      .run();

    return c.json({ success: true, monthly_fee: feeNum });
  } catch {
    return c.json({ error: 'Failed to update tutor monthly fee' }, 500);
  }
});

api.get('/admin/students', authMiddleware, requireRole(['admin']), async (c) => {
  const search = c.req.query('search');
  try {
    let query = `
      SELECT u.id, u.email, u.name, u.phone, u.photo_url, u.created_at,
             sp.class_level, sp.board, sp.learning_language, sp.subjects, sp.guardian_phone, sp.learning_goals
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
    `;
    const params: string[] = [];

    if (search && search.trim()) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY u.created_at DESC`;

    const stmt = params.length > 0 ? c.env.DB.prepare(query).bind(...params) : c.env.DB.prepare(query);
    const { results } = await stmt.all();

    const students = (results || []).map((s: any) => {
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

    return c.json({ students });
  } catch (err: any) {
    console.error('Admin fetch students error:', err);
    return c.json({ error: 'Failed to fetch registered students' }, 500);
  }
});

api.get('/admin/requests', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT r.*,
              s.name as student_name, s.email as student_email, s.phone as student_phone,
              t.name as tutor_name, t.email as tutor_email, t.phone as tutor_phone,
              b.start_time as batch_start_time, b.end_time as batch_end_time,
              (SELECT count(DISTINCT sub.student_id) FROM tutor_requests sub WHERE sub.batch_id = r.batch_id AND sub.status = 'accepted') as batch_enrolled_count
       FROM tutor_requests r
       JOIN users s ON r.student_id = s.id
       JOIN users t ON r.tutor_id = t.id
       LEFT JOIN tutor_batches b ON r.batch_id = b.id
       ORDER BY r.created_at DESC`
    ).all();

    return c.json({ requests: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch admin requests' }, 500);
  }
});

api.get('/admin/audit-logs', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT a.*, u.name as admin_name, u.email as admin_email
       FROM admin_audit_logs a
       JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 100`
    ).all();

    return c.json({ audit_logs: results || [] });
  } catch {
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

api.get('/admin/stats', authMiddleware, requireRole(['admin']), async (c) => {
  try {
    const studentsCount: any = await c.env.DB.prepare("SELECT count(*) as count FROM users WHERE role = 'student'").first();
    const tutorsCount: any = await c.env.DB.prepare("SELECT count(*) as count FROM tutor_profiles WHERE status = 'approved'").first();
    const pendingApps: any = await c.env.DB.prepare("SELECT count(*) as count FROM tutor_profiles WHERE status = 'pending'").first();
    const totalRequests: any = await c.env.DB.prepare("SELECT count(*) as count FROM tutor_requests").first();
    const activeBatches: any = await c.env.DB.prepare("SELECT count(*) as count FROM tutor_batches").first();
    const paymentInterests: any = await c.env.DB.prepare("SELECT count(*) as count FROM payment_coordinations").first();

    return c.json({
      stats: {
        total_students: studentsCount?.count || 0,
        approved_tutors: tutorsCount?.count || 0,
        pending_applications: pendingApps?.count || 0,
        total_requests: totalRequests?.count || 0,
        active_batches: activeBatches?.count || 0,
        payment_interests: paymentInterests?.count || 0,
      },
    });
  } catch {
    return c.json({ error: 'Failed to fetch platform stats' }, 500);
  }
});

api.post('/admin/profile', authMiddleware, requireRole(['admin']), async (c) => {
  const authUser = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { name, phone, photo_url } = body;

  try {
    await c.env.DB.prepare(
      `UPDATE users
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           photo_url = COALESCE(?, photo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(name?.trim() || null, phone?.trim() || null, photo_url || null, authUser.id)
      .run();

    return c.json({ success: true, message: 'Admin profile updated' });
  } catch {
    return c.json({ error: 'Failed to update admin profile' }, 500);
  }
});

// --------------------------------------------------------------------------
// Mount API Sub-Router under both /api and /
// --------------------------------------------------------------------------
app.route('/api', api);
app.route('/', api);

export default app;
