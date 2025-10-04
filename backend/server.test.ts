import request from 'supertest';
import { app, pool } from './server.ts'; // Importing app and database pool
import {
  createUserInputSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
  updateUserInputSchema
} from './zodschemas.ts';

const TEST_DB_URL = 'postgres://username:password@localhost/test_db';

beforeAll(async () => {
  await pool.connect(TEST_DB_URL);
});

afterAll(async () => {
  await pool.end();
});

describe('User Registration and Authentication', () => {
  test('Registers a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: "testuser@example.com",
        password_hash: "testpassword",
        name: "Test User"
      });
      
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('auth_token');
  });
  
  test('Fails to register user with existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: "user1@example.com",
        password_hash: "password123",
        name: "Existing User"
      });
    
    expect(response.status).toBe(409);
  });

  test('Logs in an existing user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "user1@example.com",
        password: "password123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth_token');
  });

  test('Fails to log in with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "user1@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);
  });
});

describe('Task Operations', () => {
  let testToken;
  let testUserId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "user1@example.com",
        password: "password123"
      });
    testToken = response.body.auth_token;
    testUserId = response.body.user_id;
  });

  test('Creates a Task successfully', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        user_id: testUserId,
        task_name: "New Task",
        due_date: "2023-12-31"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('task_id');
  });

  test('Fails to create a Task without authentication', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        user_id: testUserId,
        task_name: "New Task",
        due_date: "2023-12-31"
      });

    expect(response.status).toBe(401);
  });

  test('Lists all Tasks for a user', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .query({ user_id: testUserId });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  test('Updates an existing Task', async () => {
    const tasks = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .query({ user_id: testUserId });

    const taskId = tasks.body[0].task_id;

    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ task_name: "Updated Task Name" });

    expect(response.status).toBe(200);
    expect(response.body.task_name).toBe("Updated Task Name");
  });

  test('Deletes a Task successfully', async () => {
    const tasks = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`)
      .query({ user_id: testUserId });

    const taskId = tasks.body[0].task_id;

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(204);
  });
});