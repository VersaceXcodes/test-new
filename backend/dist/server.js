import express from 'express';
import cors from "cors";
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
// Import Zod schemas
import { createUserInputSchema, createTaskInputSchema, updateTaskInputSchema, searchTaskInputSchema } from './schema.js';
dotenv.config();
function createErrorResponse(message, error, errorCode) {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };
    if (errorCode) {
        response.error_code = errorCode;
    }
    // Only include detailed error information in development
    if (error && process.env.NODE_ENV === 'development') {
        response.details = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
    return response;
}
// Database setup - using PGlite for development
const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432, JWT_SECRET = 'your-secret-key' } = process.env;
let pool;
let db;
async function initializeDatabase() {
    // Try PostgreSQL first if DATABASE_URL or production database config is available
    const hasPostgresConfig = DATABASE_URL || (PGHOST && PGDATABASE && PGUSER && PGPASSWORD);
    if (hasPostgresConfig) {
        console.log('Attempting PostgreSQL connection...');
        try {
            pool = new Pool(DATABASE_URL
                ? {
                    connectionString: DATABASE_URL,
                    ssl: { rejectUnauthorized: false }
                }
                : {
                    host: PGHOST,
                    database: PGDATABASE,
                    user: PGUSER,
                    password: PGPASSWORD,
                    port: Number(PGPORT),
                    ssl: { rejectUnauthorized: false },
                });
            await pool.query('SELECT NOW()');
            console.log('PostgreSQL connection successful');
            return;
        }
        catch (error) {
            console.error('PostgreSQL connection failed, falling back to PGlite:', error);
        }
    }
    // Fall back to PGlite if PostgreSQL is not available or connection failed
    console.log('Using PGlite as database...');
    db = new PGlite();
    // Initialize tables
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL UNIQUE,
        password_hash VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        created_at VARCHAR NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
        task_id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        task_name VARCHAR NOT NULL,
        due_date VARCHAR,
        is_complete BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS auth_tokens (
        token_id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        auth_token VARCHAR NOT NULL UNIQUE,
        created_at VARCHAR NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS search_filters (
        filter_id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        search_query VARCHAR,
        filter_status VARCHAR DEFAULT 'incomplete',
        created_at VARCHAR NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `);
    pool = {
        query: async (text, params) => {
            return await db.query(text, params);
        }
    };
    console.log('Database initialized with PGlite');
}
const app = express();
// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;
// Middleware setup
app.use(morgan('combined'));
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'https://123test-new.launchpulse.ai'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.use(express.json({ limit: "5mb" }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
/*
  Authentication middleware for protected routes
  Verifies JWT token and loads user data from database
*/
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_MISSING'));
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
        if (result.rows.length === 0) {
            return res.status(401).json(createErrorResponse('Invalid token - user not found', null, 'AUTH_USER_NOT_FOUND'));
        }
        req.user = result.rows[0];
        next();
    }
    catch (error) {
        console.error('Auth token verification error:', error);
        return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
    }
};
/*
  User Registration Endpoint
  Creates new user account and returns JWT token for immediate login
  Stores password directly without hashing for development ease
*/
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Registration attempt:', { email: req.body?.email, hasPassword: !!req.body?.password, hasName: !!req.body?.name });
        // Validate input using Zod schema
        const validationResult = createUserInputSchema.safeParse(req.body);
        if (!validationResult.success) {
            console.error('Validation failed:', validationResult.error);
            return res.status(400).json(createErrorResponse('Validation failed', validationResult.error, 'VALIDATION_ERROR'));
        }
        const { email, password, name } = validationResult.data;
        // Check if user already exists
        const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (existingUser.rows.length > 0) {
            console.log('User already exists:', email);
            return res.status(400).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
        }
        // Generate unique user ID and create user
        const user_id = uuidv4();
        const created_at = new Date().toISOString();
        console.log('Creating user:', { user_id, email: email.toLowerCase().trim() });
        const result = await pool.query('INSERT INTO users (user_id, email, password_hash, name, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, name, created_at', [user_id, email.toLowerCase().trim(), password, name.trim(), created_at]);
        const user = result.rows[0];
        console.log('User created successfully:', user.user_id);
        // Generate JWT token
        const auth_token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        // Store auth token in database
        const token_id = uuidv4();
        await pool.query('INSERT INTO auth_tokens (token_id, user_id, auth_token, created_at) VALUES ($1, $2, $3, $4)', [token_id, user.user_id, auth_token, created_at]);
        console.log('Registration successful for user:', user.email);
        res.status(201).json({
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                created_at: user.created_at
            },
            token: auth_token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(createErrorResponse('Internal server error during registration', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  User Login Endpoint
  Authenticates existing user and returns JWT token
  Uses direct password comparison for development
*/
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_REQUIRED_FIELDS'));
        }
        // Find user with direct password comparison (no hashing for development)
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (result.rows.length === 0) {
            return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
        }
        const user = result.rows[0];
        // Check password (direct comparison for development)
        if (password !== user.password_hash) {
            return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
        }
        // Generate JWT token
        const auth_token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        // Store auth token in database
        const token_id = uuidv4();
        const created_at = new Date().toISOString();
        await pool.query('INSERT INTO auth_tokens (token_id, user_id, auth_token, created_at) VALUES ($1, $2, $3, $4)', [token_id, user.user_id, auth_token, created_at]);
        res.json({
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
                created_at: user.created_at
            },
            token: auth_token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json(createErrorResponse('Internal server error during login', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Auth Verify Endpoint
  Verifies JWT token and returns user information
  Used for auth state initialization
*/
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user.user_id,
                email: req.user.email,
                name: req.user.name,
                created_at: req.user.created_at
            }
        });
    }
    catch (error) {
        console.error('Auth verify error:', error);
        res.status(500).json(createErrorResponse('Internal server error during auth verification', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Get User Profile Endpoint
  Retrieves user profile information for specified user_id
  Requires authentication
*/
app.get('/api/users/:user_id', authenticateToken, async (req, res) => {
    try {
        const { user_id } = req.params;
        // Check if user is requesting their own profile or has permission
        if (req.user.user_id !== user_id) {
            return res.status(403).json(createErrorResponse('Access denied - can only view own profile', null, 'ACCESS_DENIED'));
        }
        const result = await pool.query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
        }
        const user = result.rows[0];
        // Convert created_at string to proper format for response
        res.json({
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            created_at: user.created_at
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json(createErrorResponse('Internal server error retrieving user profile', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  List Tasks Endpoint
  Retrieves filtered list of tasks for a user with search and pagination
  Supports filtering by completion status and search query
*/
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        // Validate query parameters using Zod schema
        const queryValidation = searchTaskInputSchema.safeParse({
            user_id: req.query.user_id,
            query: req.query.search_query || req.query.query,
            is_complete: req.query.filter_status === 'complete' ? true : req.query.filter_status === 'incomplete' ? false : req.query.is_complete,
            limit: req.query.limit,
            offset: req.query.offset,
            sort_by: req.query.sort_by,
            sort_order: req.query.sort_order
        });
        if (!queryValidation.success) {
            return res.status(400).json(createErrorResponse('Invalid query parameters', queryValidation.error, 'VALIDATION_ERROR'));
        }
        const { user_id, query, is_complete, limit, offset, sort_by, sort_order } = queryValidation.data;
        // Ensure user can only access their own tasks
        if (user_id && req.user.user_id !== user_id) {
            return res.status(403).json(createErrorResponse('Access denied - can only view own tasks', null, 'ACCESS_DENIED'));
        }
        // Build dynamic query with filters
        let sql = 'SELECT task_id, user_id, task_name, due_date, is_complete FROM tasks WHERE user_id = $1';
        const params = [req.user.user_id];
        let paramCount = 1;
        // Add search query filter
        if (query) {
            paramCount++;
            sql += ` AND task_name ILIKE $${paramCount}`;
            params.push(`%${query}%`);
        }
        // Add completion status filter
        if (is_complete !== undefined) {
            paramCount++;
            sql += ` AND is_complete = $${paramCount}`;
            params.push(is_complete);
        }
        // Add sorting
        sql += ` ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;
        // Add pagination
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(limit);
        paramCount++;
        sql += ` OFFSET $${paramCount}`;
        params.push(offset);
        const result = await pool.query(sql, params);
        // Format tasks for response
        const tasks = result.rows.map(task => ({
            task_id: task.task_id,
            user_id: task.user_id,
            task_name: task.task_name,
            due_date: task.due_date,
            is_complete: task.is_complete
        }));
        res.json(tasks);
    }
    catch (error) {
        console.error('List tasks error:', error);
        res.status(500).json(createErrorResponse('Internal server error retrieving tasks', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Create Task Endpoint
  Creates a new task for the authenticated user
  Generates unique task_id and handles due_date formatting
*/
app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        // Validate input using Zod schema
        const validationResult = createTaskInputSchema.safeParse({
            ...req.body,
            user_id: req.user.user_id // Ensure user_id matches authenticated user
        });
        if (!validationResult.success) {
            return res.status(400).json(createErrorResponse('Validation failed', validationResult.error, 'VALIDATION_ERROR'));
        }
        const { user_id, task_name, due_date, is_complete } = validationResult.data;
        // Generate unique task ID
        const task_id = uuidv4();
        // Format due_date for database storage (convert to string if exists)
        const formatted_due_date = due_date ? due_date.toISOString() : null;
        const result = await pool.query('INSERT INTO tasks (task_id, user_id, task_name, due_date, is_complete) VALUES ($1, $2, $3, $4, $5) RETURNING task_id, user_id, task_name, due_date, is_complete', [task_id, user_id, task_name, formatted_due_date, is_complete || false]);
        const task = result.rows[0];
        res.status(201).json({
            task_id: task.task_id,
            user_id: task.user_id,
            task_name: task.task_name,
            due_date: task.due_date,
            is_complete: task.is_complete
        });
    }
    catch (error) {
        console.error('Create task error:', error);
        res.status(500).json(createErrorResponse('Internal server error creating task', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Get Single Task Endpoint
  Retrieves details of a specific task by task_id
  Ensures user can only access their own tasks
*/
app.get('/api/tasks/:task_id', authenticateToken, async (req, res) => {
    try {
        const { task_id } = req.params;
        const result = await pool.query('SELECT task_id, user_id, task_name, due_date, is_complete FROM tasks WHERE task_id = $1', [task_id]);
        if (result.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
        }
        const task = result.rows[0];
        // Ensure user can only access their own tasks
        if (task.user_id !== req.user.user_id) {
            return res.status(403).json(createErrorResponse('Access denied - can only view own tasks', null, 'ACCESS_DENIED'));
        }
        res.json({
            task_id: task.task_id,
            user_id: task.user_id,
            task_name: task.task_name,
            due_date: task.due_date,
            is_complete: task.is_complete
        });
    }
    catch (error) {
        console.error('Get task error:', error);
        res.status(500).json(createErrorResponse('Internal server error retrieving task', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Update Task Endpoint
  Updates existing task with new information (name, due_date, completion status)
  Supports partial updates via PATCH method
*/
app.patch('/api/tasks/:task_id', authenticateToken, async (req, res) => {
    try {
        const { task_id } = req.params;
        // First verify task exists and belongs to user
        const existingTask = await pool.query('SELECT task_id, user_id, task_name, due_date, is_complete FROM tasks WHERE task_id = $1', [task_id]);
        if (existingTask.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
        }
        const task = existingTask.rows[0];
        if (task.user_id !== req.user.user_id) {
            return res.status(403).json(createErrorResponse('Access denied - can only update own tasks', null, 'ACCESS_DENIED'));
        }
        // Validate update input using Zod schema
        const validationResult = updateTaskInputSchema.safeParse({
            task_id,
            ...req.body
        });
        if (!validationResult.success) {
            return res.status(400).json(createErrorResponse('Validation failed', validationResult.error, 'VALIDATION_ERROR'));
        }
        const { task_name, due_date, is_complete } = validationResult.data;
        // Build dynamic update query for partial updates
        const updates = [];
        const params = [task_id];
        let paramCount = 1;
        if (task_name !== undefined) {
            paramCount++;
            updates.push(`task_name = $${paramCount}`);
            params.push(task_name);
        }
        if (due_date !== undefined) {
            paramCount++;
            updates.push(`due_date = $${paramCount}`);
            params.push(due_date ? due_date.toISOString() : null);
        }
        if (is_complete !== undefined) {
            paramCount++;
            updates.push(`is_complete = $${paramCount}`);
            params.push(is_complete);
        }
        if (updates.length === 0) {
            return res.status(400).json(createErrorResponse('No valid fields to update', null, 'NO_UPDATE_FIELDS'));
        }
        const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $1 RETURNING task_id, user_id, task_name, due_date, is_complete`;
        const result = await pool.query(sql, params);
        const updatedTask = result.rows[0];
        res.json({
            task_id: updatedTask.task_id,
            user_id: updatedTask.user_id,
            task_name: updatedTask.task_name,
            due_date: updatedTask.due_date,
            is_complete: updatedTask.is_complete
        });
    }
    catch (error) {
        console.error('Update task error:', error);
        res.status(500).json(createErrorResponse('Internal server error updating task', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Delete Task Endpoint
  Removes a task from the database
  Ensures user can only delete their own tasks
*/
app.delete('/api/tasks/:task_id', authenticateToken, async (req, res) => {
    try {
        const { task_id } = req.params;
        // First verify task exists and belongs to user
        const existingTask = await pool.query('SELECT user_id FROM tasks WHERE task_id = $1', [task_id]);
        if (existingTask.rows.length === 0) {
            return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
        }
        const task = existingTask.rows[0];
        if (task.user_id !== req.user.user_id) {
            return res.status(403).json(createErrorResponse('Access denied - can only delete own tasks', null, 'ACCESS_DENIED'));
        }
        // Delete the task
        await pool.query('DELETE FROM tasks WHERE task_id = $1', [task_id]);
        res.status(204).send(); // No content response for successful deletion
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json(createErrorResponse('Internal server error deleting task', error, 'INTERNAL_SERVER_ERROR'));
    }
});
/*
  Health Check Endpoint
  Simple endpoint to verify server is running
*/
app.get('/api/health', async (req, res) => {
    try {
        let dbStatus = 'unknown';
        try {
            await pool.query('SELECT 1');
            dbStatus = 'connected';
        }
        catch (dbError) {
            dbStatus = 'disconnected';
            console.error('Database health check failed:', dbError);
        }
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: 'Health check failed'
        });
    }
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json(createErrorResponse('Internal server error', err, 'UNHANDLED_ERROR'));
});
// Serve static files from Vite build or local public directory
const frontendPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', 'public') // Production: serve from backend/public (from dist/ go up to backend/ then down to public/)
    : path.join(__dirname, '..', 'vitereact', 'public'); // Development: serve from vitereact/public
app.use(express.static(frontendPath));
// Catch-all route for SPA routing - serve index.html for non-API routes only
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});
export { app, pool };
// Start the server
async function startServer() {
    await initializeDatabase();
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`TodoGenie server running on port ${port} and listening on 0.0.0.0`);
    });
}
startServer();
//# sourceMappingURL=server.js.map